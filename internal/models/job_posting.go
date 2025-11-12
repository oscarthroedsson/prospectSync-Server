package models

import (
	"time"
)

type JobPosting struct {
	ID                 string     `json:"id,omitempty" gorm:"primaryKey"`
	Title              string     `json:"title"`
	Company            string     `json:"company"`
	CompanyLogo        string     `json:"companyLogo,omitempty"`
	JobPostingUrl      string     `json:"jobPostingUrl,omitempty" gorm:"unique"`
	JobDescription     string     `json:"jobDescription,omitempty"`
	MarkdownText       string     `json:"markdownText"`
	JobRequirements    []string   `json:"jobRequirements"`
	Merits             []string   `json:"merits"`
	ApplicantQualities []string   `json:"applicantQualities"`
	Status             string     `json:"status" gorm:"default:'active'"`
	EndsAt             *time.Time `json:"endsAt"`
	CreatedAt          time.Time  `json:"createdAt"`
	UpdatedAt          time.Time  `json:"updatedAt"`
	Location           *Location  `json:"location"`
	WorkMode           string     `json:"work_mode"`
	EmploymentType     string     `json:"employmentType"`
	Salary             *Salary    `json:"salary"`
	CreatedBy          *CreatedBy `json:"createdBy,omitempty"`
}

type Location struct {
	JobPostingID string `json:"-" gorm:"primaryKey"`
	City         string `json:"city"`
	Country      string `json:"country"`
}

type Salary struct {
	JobPostingID string   `json:"-" gorm:"primaryKey"`
	Type         string   `json:"type"`
	Amount       string   `json:"amount"`
	Currency     string   `json:"currency"`
	Period       string   `json:"period"`
	Benefits     []string `json:"benefits,omitempty"`
	Notes        string   `json:"notes,omitempty"`
}

type CreatedBy struct {
	ID           string     `json:"id,omitempty" gorm:"primaryKey"`
	JobPostingID string     `json:"jobPostingId,omitempty" gorm:"unique;not null"`
	UserID       string     `json:"userId,omitempty"`
	JobPosting   JobPosting `json:"-" gorm:"foreignKey:JobPostingID"`
}
