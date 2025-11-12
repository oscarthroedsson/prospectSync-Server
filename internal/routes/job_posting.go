package routes

import (
	"github.com/gin-gonic/gin"
)

func jobPostingRoutes(r *gin.RouterGroup) {

	r.POST("/create")
	r.GET("/show")
	r.PATCH("/update")
	r.DELETE("/delete")

}
