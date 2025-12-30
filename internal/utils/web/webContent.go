package web

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/chromedp/chromedp"
)

func RetriveDOM(url string, wait ...int) (string, error) {
	ctx, cancel := chromedp.NewContext(context.Background())
	defer cancel()

	var finalURL string

	chromedp.Run(ctx,
		chromedp.Navigate(url),
		chromedp.Location(&finalURL),
	)

	fmt.Println("🔗🔗🔗🔗 FINAL URL:", finalURL)

	waitTime := 3
	if len(wait) > 0 {
		waitTime = wait[0]
	}

	ctx, cancel = context.WithTimeout(ctx, time.Duration(waitTime)*time.Second)
	defer cancel()

	var htmlContent string

	err := chromedp.Run(ctx,
		chromedp.Navigate(url),
		chromedp.WaitVisible("body", chromedp.ByQuery),
		chromedp.Sleep(3*time.Second), // Wait for JS to load
		chromedp.OuterHTML("html", &htmlContent, chromedp.ByQuery),
	)

	return htmlContent, err
}

func GetTagContent(html, tag string) ([]string, error) {
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(html))
	if err != nil {
		return nil, fmt.Errorf("failed to parse HTML: %w", err)
	}

	var contents []string
	doc.Find(tag).Each(func(i int, s *goquery.Selection) {
		text := strings.TrimSpace(s.Text())
		if text != "" {
			contents = append(contents, text)
		}
	})

	return contents, nil
}
