export interface IUser {
  id?: string;
  name?: string;
  email?: string;
  emailVerified?: string;
  image?: string;
  companyId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IUserWithRelations extends IUser {
  providers?: IUserProvider[];
  applications?: IUserApplication[];
  company?: IUserCompany;
}

export interface IUserProvider {
  id: string;
  provider: string;
  token?: IToken | null; // ← Lägg till token här
}

export interface IToken {
  id: string;
  providerId: string;
  access_token: string | null;
  refresh_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
}

export interface IUserApplication {
  id: string;
  jobPostingId: string;
  status: string;
  appliedAt: string;
  gotJob: boolean;
}

export interface IUserCompany {
  id: string;
  name: string;
  logo?: string;
}
