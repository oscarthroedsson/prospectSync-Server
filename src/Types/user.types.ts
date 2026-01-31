import type { Prisma, User } from "@prisma/client";

import { DEFAULT_USER_INCLUDE } from "../repositories/user.repository";

// TypeScript-typen
export type IUser = User;
export type IUserFull = Prisma.UserGetPayload<{
  include: typeof DEFAULT_USER_INCLUDE;
}>;

// Type for user with selected relations (what mapToUserWithRelations returns)
export type IUserWithRelations = IUser & {
  providers?: IProviderDTO[];
  applications?: IApplicationDTO[];
  company?: ICompanyDTO;
};

export type IUserCreate = Prisma.UserCreateInput;
export type IUserUpdate = Prisma.UserUpdateInput;

// === Token ===
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

export type ITokenCreateDTO = Omit<IToken, "id">;
export type ITokenUpdateDTO = Partial<Omit<IToken, "id" | "providerId">>;

// === Provider DTO ===
export interface IProviderDTO {
  id: string;
  provider: string;
  providerAccountId: string;
  userId: string;
  token?: IToken;
}

export type IProviderCreateDTO = Omit<IProviderDTO, "id" | "userId"> & {
  token?: ITokenCreateDTO;
};
export type IProviderUpdateDTO = Partial<Omit<IProviderDTO, "id" | "userId">>;

// === Application DTO ===
export interface IApplicationDTO {
  id: string;
  jobPostingId: string;
  status: string;
  appliedAt: Date;
  gotJob: boolean;
}

export type IApplicationCreateDTO = Omit<IApplicationDTO, "id">;
export type IApplicationUpdateDTO = Partial<Omit<IApplicationDTO, "id" | "jobPostingId">>;

// === Company DTO ===
export interface ICompanyDTO {
  id: string;
  name: string;
  logo?: string;
}

export type ICompanyCreateDTO = Omit<ICompanyDTO, "id">;
export type ICompanyUpdateDTO = Partial<Omit<ICompanyDTO, "id">>;
