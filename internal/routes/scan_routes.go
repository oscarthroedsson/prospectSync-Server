package routes

import "github.com/gin-gonic/gin"

func ScanRoutes(r *gin.RouterGroup) {
	r.POST("/document", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "document scan"})
	})

	r.POST("/repo", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "repo scan"})
	})
}
