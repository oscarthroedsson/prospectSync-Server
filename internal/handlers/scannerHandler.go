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

	"prospectsync-server/internal/models"
	"prospectsync-server/internal/service/webhook"
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
	ctx := c.Request.Context()
	client := openai.NewClient(os.Getenv("OPENAI_API_KEY"))
	schemaData, err := os.ReadFile("../../internal/ai/schemas/jobposting.json")

	getResp, err := http.Get(url)

	if err != nil {
		fmt.Println("error gettin the url")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error getting url content"})
		return
	}

	defer getResp.Body.Close()

	bodyByte, err := io.ReadAll(getResp.Body)
	htmlContent := string(bodyByte)
	cleanedText := extractText(htmlContent)

	var schemaObj map[string]interface{}
	err = json.Unmarshal(schemaData, &schemaObj)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse schema"})
		return
	}

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

	hook, err := webhook.Initiate(models.EventScan, models.TypeJobPosting)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Could not initiate webhook session",
			"details": err.Error(),
		})
		return
	}

	config := openai.ChatCompletionRequest{
		Model: openai.GPT5,
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
                    5. Jobbeskrivning: Använd texten i fältet **jobDescription** för att generera en strukturerad och välformulerad text i Markdown-format för fältet **markdownText**.
					6. Alla egenskaper och kunskaper som efterfrågas av jobb sökaren ska läggas under applicantQualities. Personliga egenskaper och kod relaterade kunskaper. Två ordade egenskaper ska ha _ istället för mellanslag
                    7. Följ ALLA regler i det medföljande JSON-schemat (i Tools).
                    </Rules>
                    
                    
                    --- RÅTEXT FRÅN JOBBANNONS ATT ANALYSERA ---
                    
                    """` + cleanedText + `"""`,
			},
		},
		Tools: tools,
	}

	fmt.Println("✅ Should send accepted")
	c.JSON(http.StatusAccepted, gin.H{
		"status":  "accepted",
		"message": "Jobbscanning har startat",
		"url":     url,
	})

	go func() {
		if err := hook.Start(); err != nil {
			log.Printf("[ScanJobPosting] webhook start misslyckades: %v", err)
		}

		aiResp, err := client.CreateChatCompletion(ctx, config)
		if err != nil {
			fmt.Println("[ScanJobPosting] AI CHAT ERROR: ", err.Error())
			hook.Error("Scanning job posting failed")
			return
		}

		var jobPosting *models.JobPosting
		if len(aiResp.Choices) > 0 {

			choice := aiResp.Choices[0]
			if len(choice.Message.ToolCalls) > 0 {
				toolCall := choice.Message.ToolCalls[0]
				fmt.Println("Tool call name:", toolCall.Function.Name)
				args := toolCall.Function.Arguments

				// Unmarshal with error handling
				if err := json.Unmarshal([]byte(args), &jobPosting); err != nil {
					go func() { hook.Error("Kunde inte tolka AI-svar") }()
					return
				}

				jobPostingJSON, _ := json.MarshalIndent(jobPosting, "", "  ")
				fmt.Println(string(jobPostingJSON))

				go func() {
					if err := hook.Success(jobPosting); err != nil {
						log.Printf("webhook success misslyckades: %v", err)
					}
				}()
				return
			}
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
	// Skapa en dokumentläsare från HTML-strängen
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(htmlContent))
	if err != nil {
		return ""
	}

	// Ta bort script, style och andra onödiga element
	doc.Find("script, style, noscript, iframe, svg").Remove()

	// Extrahera text
	text := doc.Text()

	// Rensa upp texten
	text = cleanUpText(text)

	return text
}
