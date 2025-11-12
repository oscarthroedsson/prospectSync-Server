package routes

import (
	"github.com/gin-gonic/gin"

	scannerHandler "prospectsync-server/internal/handlers"
)

func ScanRoutes(r *gin.RouterGroup) {
	r.POST("/document", scannerHandler.ScanPDFHandler)

	r.POST("/job-posting", scannerHandler.ScanJobPosting)

	r.POST("/repo", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "repo scan"})
	})
}
