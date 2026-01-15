export interface Resume {
    id?: string;
    name?: string;
    title?: string;
    introduction?: string;
    contact?: Contact[];
    location?: string;
    skills?: string[];
    languages?: LanguageProficiency[];
    professionalExperience?: ProfessionalExperience[];
    education?: Education[];
    certifications?: Certification[];
    achievements?: Achievement[];
    projects?: Project[];
}
export interface Contact {
    type?: string;
    value?: string;
    confidence?: number;
    page?: number;
    span?: {
        lineStart?: number;
        lineEnd?: number;
    };
}
export interface LanguageProficiency {
    language?: string;
    level?: string;
    confidence?: number;
}
export interface Education {
    school?: string;
    type?: string;
    degree?: string;
    description?: string;
    start?: string;
    end?: string;
    location?: string;
}
export interface ProfessionalExperience {
    company: string;
    title: string;
    description: string;
    start: string;
    end: string;
    location: string;
    responsibilities?: string[];
    achievements?: string[];
    skills?: string[];
    confidence: number;
    page: number;
    raw: string;
}
export interface Certification {
    name: string;
    issuer: string;
    date: string;
}
export interface Achievement {
    title: string;
    description: string;
    date: string;
}
export interface Project {
    name: string;
    description: string;
    start: string;
    end: string;
    url: string;
    skills?: string[];
}
//# sourceMappingURL=resume.model.d.ts.map