export interface JobPosting {
    id?: string;
    title: string;
    companyName: string;
    companyLogo?: string;
    jobPostingUrl: string;
    jobDescription?: string;
    markdownText: string;
    language: LanguageItem[];
    jobRequirements: string[];
    merits: string[];
    applicantQualities: string[];
    status: string;
    endsAt?: string;
    createdAt: string;
    updatedAt: string;
    location?: Location;
    workArrengment?: string;
    employmentType?: string;
    salary?: Salary;
    createdJobPosting: CreatedJobPosting;
}
export interface LanguageItem {
    language: string;
    level: string;
}
export interface Location {
    city: string;
    country: string;
}
export interface Salary {
    type: string;
    amount?: string;
    currency?: string;
    period: string;
    benefits?: string[];
    notes?: string;
}
export interface CreatedJobPosting {
    createdByType: string;
    createdById?: string;
    source?: string;
    importedAt?: string;
}
export interface Company {
    name: string;
    logo: string;
}
//# sourceMappingURL=job-posting.model.d.ts.map