package handlers

import (
	"github.com/gin-gonic/gin"
)

func AnalyzeGithubRepo(c *gin.Context) {
	c.JSON(200, gin.H{"message": "analyze job posting"})
}
