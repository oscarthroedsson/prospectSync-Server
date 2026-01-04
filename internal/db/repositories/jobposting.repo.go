package repositories

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"prospectsync-server/internal/db"
	"prospectsync-server/internal/models"
)

type JobPostingRepository struct {
	pool *pgxpool.Pool
}

var jobRepoInstance *JobPostingRepository

func Methods() *JobPostingRepository {
	if jobRepoInstance == nil {
		jobRepoInstance = &JobPostingRepository{
			pool: db.GetDB().Pool,
		}
	}
	return jobRepoInstance
}

//
// PUBLIC API
//

// FindExpiringSoon returns job postings that expire within the specified number of days
// daysUntilExpiration: number of days until expiration (e.g., 3 for jobs expiring in 3 days)
func (r *JobPostingRepository) FindExpiringSoon(daysUntilExpiration int) ([]*models.JobPosting, error) {
	rows, err := r.pool.Query(context.Background(), `
		SELECT
			"id",
			"title",
			"companyName",
			"companyLogo",
			"jobPostingUrl",
			"jobDescription",
			"markdownText",
			"status",
			"endsAt",
			"createdAt",
			"updatedAt"
		FROM job_postings
		WHERE "endsAt" IS NOT NULL
			AND "endsAt"::date >= CURRENT_DATE
			AND "endsAt"::date <= CURRENT_DATE + INTERVAL '1 day' * $1
			AND "status" != 'expired'
		ORDER BY "endsAt" ASC
	`, daysUntilExpiration)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var jobs []*models.JobPosting
	for rows.Next() {
		var job models.JobPosting
		err := rows.Scan(
			&job.Id,
			&job.Title,
			&job.CompanyName,
			&job.CompanyLogo,
			&job.JobPostingUrl,
			&job.JobDescription,
			&job.MarkdownText,
			&job.Status,
			&job.EndsAt,
			&job.CreatedAt,
			&job.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		jobs = append(jobs, &job)
	}

	return jobs, rows.Err()
}

// FindExpired returns job postings that have expired (endsAt is in the past)
func (r *JobPostingRepository) FindExpired() ([]*models.JobPosting, error) {
	// Use today's date as parameter to avoid prepared statement cache issues
	today := time.Now().Format("2006-01-02")
	rows, err := r.pool.Query(context.Background(), `
		SELECT
			"id",
			"title",
			"companyName",
			"companyLogo",
			"jobPostingUrl",
			"jobDescription",
			"markdownText",
			"status",
			"endsAt",
			"createdAt",
			"updatedAt"
		FROM job_postings
		WHERE "endsAt" IS NOT NULL
			AND "endsAt"::date < $1::date
			AND "status" != 'expired'
		ORDER BY "endsAt" DESC
	`, today)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var jobs []*models.JobPosting
	for rows.Next() {
		var job models.JobPosting
		err := rows.Scan(
			&job.Id,
			&job.Title,
			&job.CompanyName,
			&job.CompanyLogo,
			&job.JobPostingUrl,
			&job.JobDescription,
			&job.MarkdownText,
			&job.Status,
			&job.EndsAt,
			&job.CreatedAt,
			&job.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		jobs = append(jobs, &job)
	}

	return jobs, rows.Err()
}

// JobPosting_Show returns a fully hydrated JobPosting aggregate by jobPostingUrl
func (r *JobPostingRepository) ShowJobPosting(url string) (*models.JobPosting, error) {
	job, err := r.getRootByURL(url)
	if err != nil || job == nil {
		return job, err
	}

	id := *job.Id

	job.Language, _ = r.getLanguages(id)
	job.JobRequirements, _ = r.getStringArray("job_posting_requirements", id)
	job.Merits, _ = r.getStringArray("job_posting_merits", id)
	job.ApplicantQualities, _ = r.getStringArray("job_posting_applicant_qualities", id)
	job.Location, _ = r.getLocation(id)
	job.Salary, _ = r.getSalary(id)
	job.WorkArrengment, _ = r.getWorkArrengment(id)
	job.EmploymentType, _ = r.getEmploymentType(id)
	job.CreatedJobPosting, _ = r.getCreatedJobPosting(id)

	return job, nil
}

// ROOT
func (r *JobPostingRepository) getRootByURL(url string) (*models.JobPosting, error) {
	row := r.pool.QueryRow(context.Background(), `
		SELECT
		 "id",
    	 "title",
    	 "companyName",
     	 "companyLogo",
    	 "jobPostingUrl",
    	 "jobDescription",
    	 "markdownText",
    	 "status",
    	 "endsAt",
    	 "createdAt",
    	 "updatedAt"
		FROM job_postings
		WHERE "jobPostingUrl" = $1
	`, url)

	var job models.JobPosting

	err := row.Scan(
		&job.Id,
		&job.Title,
		&job.CompanyName,
		&job.CompanyLogo,
		&job.JobPostingUrl,
		&job.JobDescription,
		&job.MarkdownText,
		&job.Status,
		&job.EndsAt,
		&job.CreatedAt,
		&job.UpdatedAt,
	)

	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &job, nil
}

// Child Tables
func (r *JobPostingRepository) getLanguages(jobID string) ([]models.LanguageItem, error) {
	rows, err := r.pool.Query(context.Background(), `
		SELECT language, level
		FROM job_posting_languages
		WHERE "jobPostingId" = $1
	`, jobID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.LanguageItem
	for rows.Next() {
		var l models.LanguageItem
		if err := rows.Scan(&l.Language, &l.Level); err != nil {
			return nil, err
		}
		result = append(result, l)
	}

	return result, nil
}

func (r *JobPostingRepository) getStringArray(table string, jobID string) ([]string, error) {
	rows, err := r.pool.Query(context.Background(), `
		SELECT value
		FROM `+table+`
		WHERE "jobPostingId" = $1
	`, jobID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []string
	for rows.Next() {
		var v string
		if err := rows.Scan(&v); err != nil {
			return nil, err
		}
		result = append(result, v)
	}

	return result, nil
}

func (r *JobPostingRepository) getLocation(jobID string) (*models.Location, error) {
	row := r.pool.QueryRow(context.Background(), `
		SELECT city, country
		FROM job_posting_locations
		WHERE "jobPostingId" = $1
	`, jobID)

	var loc models.Location
	if err := row.Scan(&loc.City, &loc.Country); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return &loc, nil
}

func (r *JobPostingRepository) getSalary(jobID string) (*models.Salary, error) {
	row := r.pool.QueryRow(context.Background(), `
		SELECT type, amount, currency, period, notes
		FROM job_posting_salaries
		WHERE "jobPostingId" = $1
	`, jobID)

	var s models.Salary
	if err := row.Scan(
		&s.Type,
		&s.Amount,
		&s.Currency,
		&s.Period,
		&s.Notes,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return &s, nil
}

func (r *JobPostingRepository) getEmploymentType(jobID string) (*string, error) {
	row := r.pool.QueryRow(context.Background(), `
		SELECT "type"
		FROM job_posting_employment_types
		WHERE "jobPostingId" = $1
	`, jobID)

	var t string
	if err := row.Scan(&t); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return &t, nil
}

func (r *JobPostingRepository) getWorkArrengment(jobID string) (*string, error) {
	row := r.pool.QueryRow(context.Background(), `
		SELECT "mode"
		FROM job_posting_work_modes
		WHERE "jobPostingId" = $1
	`, jobID)

	var mode string
	if err := row.Scan(&mode); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return &mode, nil
}

func (r *JobPostingRepository) getCreatedJobPosting(jobID string) (models.CreatedJobPosting, error) {
	row := r.pool.QueryRow(context.Background(), `
		SELECT createdByType, "createdById", source, importedAt
		FROM created_job_postings
		WHERE "jobPostingId" = $1
	`, jobID)

	var c models.CreatedJobPosting
	err := row.Scan(
		&c.CreatedByType,
		&c.CreatedById,
		&c.Source,
		&c.ImportedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return c, nil
		}
		return c, err
	}

	return c, nil
}
