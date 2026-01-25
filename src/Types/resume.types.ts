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
  type?: string; // email, phone, linkedin, github, website, other
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
  level?: string; // basic, conversational, fluent, native
  confidence?: number;
}

export interface Education {
  school?: string;
  type?: string; // course, program, bootcamp, degree, certification
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
  end: string; // or 'present'
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
  end: string; // or 'present'
  url: string;
  skills?: string[];
}
