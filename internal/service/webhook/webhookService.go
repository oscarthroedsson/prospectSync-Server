package webhook

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"prospectsync-server/internal/models"
)

type Session struct {
	baseURL    string
	secret     string
	event      models.WebhookEvent
	typ        models.WebhookType
	fullURL    string
	httpClient *http.Client
}

func Initiate(event models.WebhookEvent, eventType models.WebhookType) (*Session, error) {
	base := strings.TrimSuffix(os.Getenv("WEBHOOK_BASE_URL"), string(event))
	secret := os.Getenv("WEBHOOK_SECRET")

	if base == "" || secret == "" {
		return nil, fmt.Errorf("webhook config is missing: base=%q secret=%q", base, secret)
	}

	fullURL := fmt.Sprintf("%s/%s", base, event)
	return &Session{
		baseURL:    base,
		secret:     secret,
		event:      event,
		typ:        eventType,
		fullURL:    fullURL,
		httpClient: &http.Client{Timeout: 10 * time.Second},
	}, nil
}

func (s *Session) send(payload *models.WebhookPayload) error {
	payload.Event = s.event
	payload.Type = s.typ
	payload.Timestamp = time.Now().UTC().Format(time.RFC3339Nano) // date is a ref for GO to format timestamp

	body, err := json.Marshal(payload)

	log.Printf("⭐ DEBUG webhook POST -> %s\nPayload bytes: %d\nPayload JSON: %s\n", s.fullURL, len(body), string(body))
	if err != nil {
		return fmt.Errorf("json: %w", err)
	}

	mac := hmac.New(sha256.New, []byte(s.secret))
	mac.Write(body)
	signature := "sha256=" + hex.EncodeToString(mac.Sum(nil))

	log.Printf("⭐ DEBUG webhook signature: %s\n", signature)

	req, _ := http.NewRequest("POST", s.fullURL, bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-webhook-signature", signature)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		msg, _ := io.ReadAll(resp.Body)
		log.Printf("DEBUG webhook response (%d): %s", resp.StatusCode, string(msg))
		return fmt.Errorf("webhook %d: %s", resp.StatusCode, string(msg))
	}

	return nil
}

func (s *Session) Start(msg ...string) error {
	payload := &models.WebhookPayload{
		Event:  s.event,
		Type:   s.typ,
		Status: models.StatusStarted,
	}

	if len(msg) > 0 {
		payload.Data = map[string]any{"msg": msg[0]}
	}

	return s.send(payload)
}

func (s *Session) Running() error {
	return s.send(&models.WebhookPayload{
		Event:  s.event,
		Type:   s.typ,
		Status: models.StatusRunning,
	})
}

func (s *Session) Success(data any) error {
	return s.send(&models.WebhookPayload{
		Event:  s.event,
		Type:   s.typ,
		Status: models.StatusSuccess,
		Data:   data,
	})
}

func (s *Session) Error(msg string) error {
	return s.send(&models.WebhookPayload{
		Event:  s.event,
		Type:   s.typ,
		Status: models.StatusError,
		Error:  msg,
	})
}
