package models

type JobPosting struct {
	Id                 *string           `json:"id"` // nullable / kan vara undefined
	Title              string            `json:"title"`
	CompanyName        string            `json:"companyName"`
	CompanyLogo        *string           `json:"companyLogo"`   // nullable
	JobPostingUrl      string            `json:"jobPostingUrl"` // du sätter själv
	JobDescription     string            `json:"jobDescription,omitempty"`
	MarkdownText       string            `json:"markdownText"`
	Language           []LanguageItem    `json:"language"`
	JobRequirements    []string          `json:"jobRequirements"`
	Merits             []string          `json:"merits"`
	ApplicantQualities []string          `json:"applicantQualities"`
	Status             string            `json:"status"`
	EndsAt             *string           `json:"endsAt"` // nullable
	CreatedAt          string            `json:"createdAt"`
	UpdatedAt          string            `json:"updatedAt"`
	Location           *Location         `json:"location"` // nullable
	WorkArrengment     string            `json:"workArrengment"`
	EmploymentType     string            `json:"employmentType"`
	Salary             *Salary           `json:"salary"` // nullable
	CreatedJobPosting  CreatedJobPosting `json:"createdJobPosting"`
}

type LanguageItem struct {
	Language string `json:"language"`
	Level    string `json:"level"` // enum: [""]
}

type Location struct {
	City    string `json:"city"`
	Country string `json:"country"`
}

type Salary struct {
	Type     string   `json:"type"`
	Amount   *string  `json:"amount"`   // nullable
	Currency *string  `json:"currency"` // nullable
	Period   string   `json:"period"`
	Benefits []string `json:"benefits,omitempty"`
	Notes    *string  `json:"notes"` // nullable
}

type CreatedJobPosting struct {
	CreatedByType string  `json:"createdByType"` // enum: "system"
	CreatedById   *string `json:"createdById"`   // null → *string
	Source        *string `json:"source"`        // enum + null
	ImportedAt    *string `json:"importedAt"`    // ISO string + null
}

type Company struct {
	Name string `json:"name"`
	Logo string `json:"logo"`
}
