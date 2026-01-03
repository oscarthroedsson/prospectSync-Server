package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/gin-gonic/gin"
	openai "github.com/sashabaranov/go-openai"
	"github.com/unidoc/unipdf/v3/common/license"
	"github.com/unidoc/unipdf/v3/extractor"
	"github.com/unidoc/unipdf/v3/model"

	"prospectsync-server/internal/db/repositories"
	"prospectsync-server/internal/models"
	"prospectsync-server/internal/service/webhook"
	mapper "prospectsync-server/internal/utils/Mapper"
	"prospectsync-server/internal/utils/web"
)

func ScanPDFHandler(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Minute)
	defer cancel()

	fileHeader, err := c.FormFile("file") // Get file

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	file, err := fileHeader.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot open uploaded file"})
		return
	}
	defer file.Close() // close file when func returns

	data, err := io.ReadAll(file)
	if err != nil {
		c.JSON(500, gin.H{"error": "Cannot read file"})
		return
	}
	// base64PDF := base64.StdEncoding.EncodeToString(data)
	// dataURI := "data:application/pdf;base64," + base64PDF

	// ============================================================
	// READ PDF
	key := os.Getenv("UNIDOC_LICENSE_API_KEY")

	if key == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "UniDoc license missing"})
		return
	}

	if err := license.SetMeteredKey(key); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid UniDoc license"})
		return
	}

	reader := bytes.NewReader(data)
	pdfReader, err := model.NewPdfReader(reader)

	if err != nil {
		fmt.Println("PDF parse error:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid PDF"})
		return
	}

	var buf bytes.Buffer
	numPages, err := pdfReader.GetNumPages()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot get page count"})
		return
	}

	for i := 1; i <= numPages; i++ {
		page, err := pdfReader.GetPage(i)
		if err != nil {
			continue
		}

		ex, err := extractor.New(page)
		if err != nil {
			continue
		}

		text, err := ex.ExtractText()
		if err != nil {
			continue
		}

		buf.WriteString(text)
		buf.WriteString("\n\n--- PAGE BREAK ---\n\n")
	}

	rawText := buf.String()
	// ============================================================
	fmt.Println("📄 RAW TEXT: ", rawText)

	client := openai.NewClient(os.Getenv("OPENAI_API_KEY"))
	schemaData, err := os.ReadFile("../../internal/ai/schemas/resume.json")

	if err != nil {
		fmt.Println("⚠️ err: ", err)
	}

	var schema map[string]interface{}
	json.Unmarshal(schemaData, &schema)

	tools := []openai.Tool{
		{
			Type: openai.ToolTypeFunction,
			Function: &openai.FunctionDefinition{
				Name:       "save_resume",
				Parameters: schema,
			},
		},
	}

	fmt.Println("📘 RawText: ", rawText)
	// apa, _ := json.MarshalIndent(tools, "", "  ")
	config := openai.ChatCompletionRequest{
		Model: openai.GPT5,
		Messages: []openai.ChatCompletionMessage{
			{
				Role: openai.ChatMessageRoleUser,
				Content: `
                 **ROLL:** <Roll>
                        Du är en specialist på strukturerad datautvinning (Data Extraction Expert) med fokus på CV:n.
                    </Roll>
        
                    <assignment>
                        Avkoda den bifogade Base64-strängen till råtext. Analysera sedan den utvunna CV-texten och extrahera ALL relevant data.
                    </assignment>

                    <Rules>
                    1. Du MÅSTE strikt anropa funktionen "save_resume" EXAKT en gång.
                    2. Utdata MÅSTE vara en felfri JSON-sträng som validerar mot det givna schemat.
                    3. Hallucination förbjuden: Du FÅR INTE lägga till information som inte uttryckligen finns i CV:t. Om ett fält saknas, fyll i det med null, en tom sträng (""), eller en tom array ([]) enligt schemat.
                    4. Datum & Plats: Följ de strikta formatkraven (t.ex. YYYY-MM-DD och 'Country, Region, City') som anges i schemabeskrivningarna.
                    5. Följ ALLA regler i det medföljande JSON-schemat (i Tools).
                    </Rules>
                    
                    
                    --- DOKUMENT ATT ANALYSERA (BASE64) ---
                    
                    """` + rawText + `"""`,
			},
		},
		Tools: tools,
	}

	fmt.Println("🟢 Before")
	resp, err := client.CreateChatCompletion(ctx, config)

	if err != nil {
		fmt.Println("🤖⚠️ Error resp: ", err)
		c.JSON(http.StatusBadRequest, err)
		return
	}
	fmt.Println("🟠 After")

	var resume *models.Resume

	if len(resp.Choices) > 0 {
		// Safety checks
		choice := resp.Choices[0]
		if len(choice.Message.ToolCalls) > 0 {
			toolCall := choice.Message.ToolCalls[0]
			fmt.Println("Tool call name:", toolCall.Function.Name)
			args := toolCall.Function.Arguments
			fmt.Println("RAW ARGS (len):", len(args))
			fmt.Println("RAW ARGS preview:", func() string {
				if len(args) > 500 {
					return args[:500] + "...(truncated)"
				}
				return args
			}())

			// Unmarshal with error handling
			if err := json.Unmarshal([]byte(args), &resume); err != nil {
				log.Println("❌ Unmarshal error:", err)
				c.JSON(http.StatusBadRequest, gin.H{
					"error": "failed to unmarshal tool args",
				})
				return
			}

			resumeJSON, _ := json.MarshalIndent(resume, "", "  ")

			fmt.Println(string(resumeJSON))

			c.JSON(http.StatusOK, resume)
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Model did not produce a tool call",
		"raw_resp": resp.Choices,
	})
}

func ScanJobPosting(c *gin.Context) {
	url := c.Query("url")
	userID := c.Request.Header.Get("X-User-ID")
	client := openai.NewClient(os.Getenv("OPENAI_API_KEY"))
	schemaData, err := os.ReadFile("internal/ai/schemas/jobposting.json")

	hook, err := webhook.Initiate(models.EventScan, models.TypeJobPosting, &userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Could not initiate webhook session",
			"details": err.Error(),
		})
		return
	}

	var createdById *string
	if userID != "" {
		createdById = &userID
	}

	repo := repositories.Methods()
	res, err := repo.ShowJobPosting(url)
	if err != nil {
		fmt.Println("⚠️ DB QUERY ERROR ", err)
	}
	// ƒ Pretty print res
	b, _ := json.MarshalIndent(res, "", "  ")
	fmt.Println("📦 JobPosting from repo:")
	fmt.Println(string(b))

	if res != nil {

		fmt.Println("🔵 Job posting already exists in DB, skipping scan and returning existing")
		hook.Success(res, "Good news! We have already scanned this job posting")
		c.JSON(http.StatusAccepted, gin.H{
			"status":  "accepted",
			"message": "Good news! We have already scanned this job posting",
			"url":     url,
		})

		return
	}

	if err != nil {
		fmt.Println(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read schemas"})
		return
	}

	// GET HTML CONTENT ------------------------------------------------
	htmlContent, err := web.RetriveDOM(url, 30)
	if err != nil {
		fmt.Println("❌ HTTP GET FAILED:", err)
		fmt.Println("error gettin the url")
		hook.Error("Could not scan the web page. Please copy the posting text and provide it manually; this will guarantee it works.")

		c.JSON(http.StatusBadRequest, gin.H{"error": "Error getting url content"})
		return
	}
	fmt.Println("✅ 5. HTTP GET successful")
	cleanedText := extractText(htmlContent)

	fmt.Println("🧹 CLEAN TEXT")
	fmt.Println(cleanedText)
	// GET HTML CONTENT ------------------------------------------------

	var schemaObj map[string]interface{}
	err = json.Unmarshal(schemaData, &schemaObj)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse schema"})
		return
	}

	/*
		TODO - fix the following find errors
		→ It provides null on keys where is required
		→ It could not understand that lang should be x y when it stood in the text
		→
	*/
	tools := []openai.Tool{
		{
			Type: openai.ToolTypeFunction,
			Function: &openai.FunctionDefinition{
				Name: "save_job_posting",
				Parameters: map[string]interface{}{
					"type":       "object",
					"properties": schemaObj["properties"],
					"required":   schemaObj["required"],
				},
			},
		},
	}

	config := openai.ChatCompletionRequest{
		Model: openai.GPT5Nano,
		Messages: []openai.ChatCompletionMessage{
			{
				Role: openai.ChatMessageRoleUser,

				Content: `
                 **ROLL:** <Roll>
                        Du är en specialist på strukturerad datautvinning (Data Extraction Expert) med fokus på **Jobbannonser**.
                    </Roll>
        
                    <assignment>
                        Analysera den utvunna råtexten från en jobbannons och extrahera **ALL** relevant data.
                        Fokusera särskilt på att identifiera och strukturera fält som **Titel**, **Företag**, **Krav**, **Förmåner**, **Lön** och **Plats**.
                    </assignment>

                    <Rules>
                    1. Du MÅSTE strikt anropa funktionen **"save_job_posting"** EXAKT en gång. (Använd det namn du definierat i Tools).
                    2. Utdata MÅSTE vara en felfri JSON-sträng som validerar mot det givna schemat.
                    3. Hallucination förbjuden: Du FÅR INTE lägga till information som inte uttryckligen finns i källtexten. Om ett fält saknas, fyll i det med **null**, en tom sträng (**""**), eller en tom array (**[]**) enligt schemat.
                    4. Datum & Tid: Följ det strikta formatet **ISO 8601** (t.ex. YYYY-MM-DDTHH:MM:SSZ) för fälten **endsAt, createdAt** och **updatedAt**. Om tid saknas, använd **T00:00:00Z**.
                    5. Markdown: Använd texten för att generera en strukturerad och välformulerad text i Markdown-format för fältet **markdownText**.
					6. JobDescription: Sammanfatta en kort [300 karaktärer MAX] sammanfattning av arbetsrollen som sinch söker. 
					7. Alla egenskaper och kunskaper som efterfrågas av jobb sökaren ska läggas under applicantQualities. Personliga egenskaper och kod relaterade kunskaper. Två ordade egenskaper ska ha _ istället för mellanslag
					8. Du ska använda samma språk som det görs i texten inom <CONTENT> 
                    9. Följ ALLA regler i det medföljande JSON-schemat (i Tools).
                    </Rules>
                    
                    
                    --- RÅTEXT FRÅN JOBBANNONS ATT ANALYSERA ---
                    <Content>
					` + cleanedText + `
					</Content>
					`,
			},
		},
		Tools: tools,
	}

	// Everything is validated, tell clients we will start
	c.JSON(http.StatusAccepted, gin.H{
		"status":  "accepted",
		"message": "Jobbscanning has started",
		"url":     url,
	})

	// Start AI operation background service
	go func() {
		fmt.Println("🚗 INSIDE ROUTIN")
		ctx := context.Background()

		// Send START notifikation to client (webhook)
		if err := hook.Start(); err != nil {
			log.Printf("🚨 [ScanJobPosting] webhook start misslyckades: %v", err)
		}

		// Run AI operation
		aiResp, err := client.CreateChatCompletion(ctx, config)
		if err != nil {
			fmt.Println("🌺 [ScanJobPosting] AI CHAT ERROR: ", err)
			hook.Error("Scanning job posting failed")
			return
		}

		var jobPosting *models.JobPosting

		fmt.Println("CHOISES", aiResp.Choices)
		if len(aiResp.Choices) > 0 {
			fmt.Println("→ choices: ", aiResp.Choices)
			choice := aiResp.Choices[0]
			if len(choice.Message.ToolCalls) > 0 {
				toolCall := choice.Message.ToolCalls[0]
				fmt.Println("Tool call name:", toolCall.Function.Name)
				args := toolCall.Function.Arguments

				// 🛑 DELETE THIS ======
				var prettyJSON map[string]interface{}
				if err := json.Unmarshal([]byte(args), &prettyJSON); err != nil {
					fmt.Printf("AI JSON (rå, oformaterad):\n%s\n", args)
				} else {
					formatted, _ := json.MarshalIndent(prettyJSON, "", "  ")
					fmt.Printf("AI JSON (formaterad):\n%s\n", string(formatted))
				}
				// ==========================================

				// Unmarshal with error handling
				if err := json.Unmarshal([]byte(args), &jobPosting); err != nil {
					// Sends Error notification to Client (webhook)
					fmt.Println("❌❌❌ Unmarshal error:", err)
					hook.Error("Kunde inte tolka AI-svar")
					return
				}

				// jobPosting.JobPostingUrl = url
				// jobPosting.CreatedAt = today
				// jobPosting.UpdatedAt = today
				// jobPosting.CreatedJobPosting = models.CreatedJobPosting{
				// 	CreatedByType: "system",
				// 	CreatedById:   createdById,
				// 	Source:        utils.Ptr("url"),
				// 	ImportedAt:    utils.Ptr(today.Format(time.RFC3339)),
				// }

				jobPosting, err := mapper.JobPostingMapper([]byte(args), url, createdById)
				if err != nil {
					fmt.Println("❌❌❌ JobPostingMapper error:", err)
					hook.Error("Kunde inte mappa jobbannonsdata")
					return
				}
				// jobPostingJSON, _ := json.MarshalIndent(jobPosting, "", "  ")

				// ==========================================

				// Sends success if it succeded
				if err := hook.Success(jobPosting); err != nil {
					log.Printf("webhook success misslyckades: %v", err)
				}

				return
			}
			fmt.Println("❌ no choices")
		}

	}()
}

func cleanUpText(text string) string {
	// Ta bort extra whitespace
	text = regexp.MustCompile(`\s+`).ReplaceAllString(text, " ")

	// Ta bort tomma rader
	text = regexp.MustCompile(`(?m)^\s*$\n`).ReplaceAllString(text, "")

	// Trimma och returnera
	return strings.TrimSpace(text)
}

func extractText(htmlContent string) string {

	doc, err := goquery.NewDocumentFromReader(strings.NewReader(htmlContent))
	if err != nil {
		fmt.Println("⚠️🚨 ERROR [extractText]: ", err)
		return ""
	}

	doc.Find("script, style, noscript, iframe, svg").Remove()

	// Extrahera text
	text := doc.Text()

	// Rensa upp texten
	text = cleanUpText(text)
	fmt.Println("📝 Text length AFTER cleanup:", len(text))
	fmt.Println("📝 First 500 chars AFTER cleanup:", text[:min(500, len(text))])

	return text
}
