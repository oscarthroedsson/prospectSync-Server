// dtos.ts
import { CreatedByEnum, EmploymentEnum, JobSourceEnum, WorkArrangementEnum } from "@prisma/client";
export interface IJobPostingDTO {
  id: string;
  title: string;
  companyName: string;
  companyLogo?: string | null;
  jobPostingUrl: string;
  jobDescription: string;
  markdownText: string;
  status: string;
  endsAt?: string | null;
  createdAt: string;
  updatedAt: string;
  createdJobPosting?: ICreatedJobPostingDTO | null;
  company?: ICompanyDTO | null;
  preferenceSet?: IPreferenceSetDTO;
  jobApplicants?: IJobApplicantDTO[];
  userProcesses?: IUserProcessDTO[];
}

export type IJobPostingCreateDTO = Omit<
  IJobPostingDTO,
  "id" | "jobApplicants" | "userProcesses" | "company"
> & {
  preferenceSet?: IPreferenceSetCreateDTO;
  createdJobPosting?: ICreatedJobPostingCreateDTO;
};

export type IJobPostingUpdateDTO = Partial<
  Omit<IJobPostingDTO, "id" | "createdAt" | "jobApplicants" | "userProcesses" | "company">
>;

export interface IPreferenceSetDTO {
  id: string;
  userId?: string | null;
  jobPostingId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  languages?: ILanguageDTO[];
  locations?: ILocationDTO[];
  workArrangements?: IWorkArrangementDTO[];
  employmentTypes?: IEmploymentTypeDTO[];
  salaries?: ISalaryDTO[];
  benefits?: IBenefitDTO[];
  requirements?: IRequirementDTO[];
  merits?: IMeritDTO[];
  applicantQualities?: IApplicantQualityDTO[];
}

export type IPreferenceSetCreateDTO = Omit<
  IPreferenceSetDTO,
  "id" | "userId" | "jobPostingId" | "createdAt" | "updatedAt"
> & {
  languages?: ILanguageCreateDTO[];
  locations?: ILocationCreateDTO[];
  workArrangements?: IWorkArrangementCreateDTO[];
  employmentTypes?: IEmploymentTypeCreateDTO[];
  salaries?: ISalaryCreateDTO[];
  benefits?: IBenefitCreateDTO[];
  requirements?: IRequirementCreateDTO[];
  merits?: IMeritCreateDTO[];
  applicantQualities?: IApplicantQualityCreateDTO[];
};

export type IPreferenceSetUpdateDTO = Partial<
  Omit<IPreferenceSetDTO, "id" | "createdAt" | "updatedAt">
>;

// === Language ===
export interface ILanguageDTO {
  id: string;
  language: string;
  level?: string | null; // Beginner, Intermediate, Advanced, Expert
  isNative?: boolean | null;
  preferenceSetId?: string | null;
}

export type ILanguageCreateDTO = Omit<ILanguageDTO, "id" | "preferenceSetId">;
export type ILanguageUpdateDTO = Partial<Omit<ILanguageDTO, "id" | "preferenceSetId">>;

// === Requirement ===
export interface IRequirementDTO {
  id: string;
  requirement: string;
  preferenceSetId?: string | null;
}

export type IRequirementCreateDTO = Omit<IRequirementDTO, "id" | "preferenceSetId">;
export type IRequirementUpdateDTO = Partial<Omit<IRequirementDTO, "id" | "preferenceSetId">>;

// === Merit ===
export interface IMeritDTO {
  id: string;
  merit: string;
  preferenceSetId?: string | null;
}

export type IMeritCreateDTO = Omit<IMeritDTO, "id" | "preferenceSetId">;
export type IMeritUpdateDTO = Partial<Omit<IMeritDTO, "id" | "preferenceSetId">>;

// === ApplicantQuality ===
export interface IApplicantQualityDTO {
  id: string;
  quality: string;
  preferenceSetId?: string | null;
}

export type IApplicantQualityCreateDTO = Omit<IApplicantQualityDTO, "id" | "preferenceSetId">;
export type IApplicantQualityUpdateDTO = Partial<Omit<IApplicantQualityDTO, "id" | "preferenceSetId">>;

// === Location ===
export interface ILocationDTO {
  id: string;
  city?: string | null;
  region?: string | null;
  country: string;
  isRemote: boolean;
  lat?: number | null;
  lng?: number | null;
  preferenceSetId?: string | null;
}

export type ILocationCreateDTO = Omit<ILocationDTO, "id" | "preferenceSetId">;
export type ILocationUpdateDTO = Partial<Omit<ILocationDTO, "id" | "preferenceSetId">>;

// === WorkArrangement ===
export interface IWorkArrangementDTO {
  id: string;
  mode: WorkArrangementEnum;
  preferenceSetId?: string | null;
}

export type IWorkArrangementCreateDTO = Omit<IWorkArrangementDTO, "id" | "preferenceSetId">;
export type IWorkArrangementUpdateDTO = Partial<Omit<IWorkArrangementDTO, "id" | "preferenceSetId">>;

// === EmploymentType ===
export interface IEmploymentTypeDTO {
  id: string;
  type: EmploymentEnum; // EmploymentEnum
  preferenceSetId?: string | null;
}

export type IEmploymentTypeCreateDTO = Omit<IEmploymentTypeDTO, "id" | "preferenceSetId">;
export type IEmploymentTypeUpdateDTO = Partial<Omit<IEmploymentTypeDTO, "id" | "preferenceSetId">>;

// === Salary ===
export interface ISalaryDTO {
  id: string;
  minAmount?: number | null;
  maxAmount?: number | null;
  currency: string;
  period: string;
  notes?: string | null;
  preferenceSetId?: string | null;
}

export type ISalaryCreateDTO = Omit<ISalaryDTO, "id" | "preferenceSetId">;
export type ISalaryUpdateDTO = Partial<Omit<ISalaryDTO, "id" | "preferenceSetId">>;

// === Benefit ===
export interface IBenefitDTO {
  id: string;
  name: string;
  description?: string | null;
  preferenceSetId?: string | null;
}

export type IBenefitCreateDTO = Omit<IBenefitDTO, "id" | "preferenceSetId">;
export type IBenefitUpdateDTO = Partial<Omit<IBenefitDTO, "id" | "preferenceSetId">>;

// === PreferenceSet ===

// === CreatedJobPosting ===
export interface ICreatedJobPostingDTO {
  id: string;
  jobPostingId: string;
  createdByType: CreatedByEnum; // CreatedByEnum
  createdById?: string | null;
  source?: JobSourceEnum | null; // JobSourceEnum
  importedAt?: Date | null;
}

export type ICreatedJobPostingCreateDTO = Omit<ICreatedJobPostingDTO, "id" | "jobPostingId">;
export type ICreatedJobPostingUpdateDTO = Partial<Omit<ICreatedJobPostingDTO, "id" | "jobPostingId">>;

// === Company ===
export interface ICompanyDTO {
  id: string;
  name: string;
  logo?: string | null;
}

export type ICompanyCreateDTO = Omit<ICompanyDTO, "id">;
export type ICompanyUpdateDTO = Partial<Omit<ICompanyDTO, "id">>;

// === JobApplicant ===
export interface IJobApplicantDTO {
  id: string;
  userId: string;
  jobPostingId: string;
  appliedAt: string;
}

export type IJobApplicantCreateDTO = Omit<IJobApplicantDTO, "id">;
export type IJobApplicantUpdateDTO = Partial<Omit<IJobApplicantDTO, "id" | "userId" | "jobPostingId">>;

// === UserProcess ===
export interface IUserProcessDTO {
  id: string;
  userId: string;
  jobPostingId: string;
  status: string;
  updatedAt: Date;
}

export type IUserProcessCreateDTO = Omit<IUserProcessDTO, "id" | "updatedAt">;
export type IUserProcessUpdateDTO = Partial<Omit<IUserProcessDTO, "id" | "userId" | "jobPostingId" | "updatedAt">>;
