package routes

import (
	"github.com/gin-gonic/gin"

	"prospectsync-server/internal/handlers"
)

func AnalyzeRoutes(r *gin.RouterGroup) {
	r.POST("/repository", handlers.AnalyzeGithubRepo)
}
