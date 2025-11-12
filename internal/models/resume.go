package models

type Resume struct {
	ID                     *string                   `json:"id,omitempty" jsonschema:"description=Unikt ID för CV:t."`
	Name                   *string                   `json:"name,omitempty" jsonschema:"description=Fullständigt namn på personen."`
	Title                  *string                   `json:"title,omitempty" jsonschema:"description=Nuvarande titel eller yrkesroll."`
	Introduction           *string                   `json:"introduction,omitempty" jsonschema:"description=Kort introduktion eller sammanfattning av personen."`
	Contact                *[]Contact                `json:"contact,omitempty" jsonschema:"description=Lista med kontaktuppgifter."`
	Location               *string                   `json:"location,omitempty" jsonschema:"description=Plats, t.ex. stad eller land."`
	Skills                 *[]string                 `json:"skills,omitempty" jsonschema:"description=Lista över färdigheter eller teknologier."`
	Languages              *[]LanguageProficiency    `json:"languages,omitempty" jsonschema:"description=Språkkunskaper med nivåer."`
	ProfessionalExperience *[]ProfessionalExperience `json:"professionalExperience,omitempty" jsonschema:"description=Lista över professionell erfarenhet."`
	Education              *[]Education              `json:"education,omitempty" jsonschema:"description=Lista över utbildningar."`
	Certifications         *[]Certification          `json:"certifications,omitempty" jsonschema:"description=Lista över certifieringar."`
	Achievements           *[]achievements           `json:"achievements,omitempty" jsonschema:"description=Lista över prestationer eller utmärkelser."`
	Projects               *[]Project                `json:"projects,omitempty" jsonschema:"description=Lista över projekt."`
}

type Contact struct {
	Type       *string  `json:"type,omitempty" jsonschema:"description=Typ av kontakt (email, phone, linkedin, github, website, other)."`
	Value      *string  `json:"value,omitempty" jsonschema:"description=Kontaktvärdet."`
	Confidence *float64 `json:"confidence,omitempty" jsonschema:"description=Hur säker AI:n är på denna information."`
	Page       *int     `json:"page,omitempty" jsonschema:"description=Vilken sida i PDF som denna information hittades på."`
	Span       *struct {
		LineStart *int `json:"lineStart,omitempty" jsonschema:"description=Startlinje i PDF."`
		LineEnd   *int `json:"lineEnd,omitempty" jsonschema:"description=Slutlinje i PDF."`
	} `json:"span,omitempty" jsonschema:"description=Radintervall i dokumentet."`
}

type LanguageProficiency struct {
	Language   *string  `json:"language,omitempty" jsonschema:"description=Språkets namn."`
	Level      *string  `json:"level,omitempty" jsonschema:"description=Nivå: basic, conversational, fluent, native."`
	Confidence *float64 `json:"confidence,omitempty" jsonschema:"description=Hur säker AI:n är på språkfärdigheten."`
}

type Education struct {
	School      *string `json:"school,omitempty" jsonschema:"description=Skolans namn."`
	Type        *string `json:"type,omitempty" jsonschema:"description=Typ av utbildning (course, program, bootcamp, degree, certification)."`
	Degree      *string `json:"degree,omitempty" jsonschema:"description=Examen eller kursnamn."`
	Description *string `json:"description,omitempty" jsonschema:"description=Beskrivning av utbildningen."`
	Start       *string `json:"start,omitempty" jsonschema:"description=Startdatum."`
	End         *string `json:"end,omitempty" jsonschema:"description=Slutdatum."`
	Location    *string `json:"location,omitempty" jsonschema:"description=Plats för utbildningen."`
}

type ProfessionalExperience struct {
	Company          string   `json:"company,omitempty" jsonschema:"description=Företagets namn."`
	Title            string   `json:"title,omitempty" jsonschema:"description=Jobbtitel."`
	Description      string   `json:"description,omitempty" jsonschema:"description=Beskrivning av jobbet."`
	Start            string   `json:"start,omitempty" jsonschema:"description=Startdatum."`
	End              string   `json:"end,omitempty" jsonschema:"description=Slutdatum eller 'present'."`
	Location         string   `json:"location,omitempty" jsonschema:"description=Plats."`
	Responsibilities []string `json:"responsibilities,omitempty" jsonschema:"description=Lista över ansvar."`
	Achievements     []string `json:"achievements,omitempty" jsonschema:"description=Lista över prestationer."`
	Skills           []string `json:"skills,omitempty" jsonschema:"description=Relaterade färdigheter."`
	Confidence       float64  `json:"confidence,omitempty" jsonschema:"description=Hur säker AI:n är på detta jobb."`
	Page             int      `json:"page,omitempty" jsonschema:"description=PDF-sida där jobbet hittades."`
	Raw              string   `json:"raw,omitempty" jsonschema:"description=Råtext från dokumentet."`
}

type Certification struct {
	Name   string `json:"name,omitempty" jsonschema:"description=Certifieringens namn."`
	Issuer string `json:"issuer,omitempty" jsonschema:"description=Utfärdare av certifieringen."`
	Date   string `json:"date,omitempty" jsonschema:"description=Datum då certifieringen erhölls."`
}

type achievements struct {
	Title       string `json:"title,omitempty" jsonschema:"description=Titel på prestation."`
	Description string `json:"description,omitempty" jsonschema:"description=Beskrivning av prestation."`
	Date        string `json:"date,omitempty" jsonschema:"description=Datum för prestation."`
}

type Project struct {
	Name        string   `json:"name,omitempty" jsonschema:"description=Projektnamn."`
	Description string   `json:"description,omitempty" jsonschema:"description=Beskrivning av projektet."`
	Start       string   `json:"start,omitempty" jsonschema:"description=Startdatum."`
	End         string   `json:"end,omitempty" jsonschema:"description=Slutdatum eller 'present'."`
	URL         string   `json:"url,omitempty" jsonschema:"description=Länk till projektet."`
	Skills      []string `json:"skills,omitempty" jsonschema:"description=Lista över färdigheter som används."`
}
