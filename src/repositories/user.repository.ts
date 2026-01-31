import { Prisma, PrismaClient } from "@prisma/client";

import { IUser } from "../Types/user.types";
import { getPrismaClient } from "../config/prisma";
import { UserMapper } from "../utils/mapper/user.mapper";

export const DEFAULT_PREFERENCE_SET_INCLUDE: Prisma.PreferenceSetInclude = {
  languages: true,
  locations: true,
  workArrangements: true,
  employmentTypes: true,
  salaries: true,
  benefits: true,
  requirements: true,
  merits: true,
  applicantQualities: true,
};

export const DEFAULT_USER_INCLUDE: Prisma.UserInclude = {
  // Profildata
  contactInfos: true,
  socialLinks: true,
  qualities: true,
  knowledgeAreas: true,
  workExperiences: true,
  educations: true,
  cvs: true,
  coverLetters: true,

  // 🔑 PREFERENCES (ALLT HÄR)
  preferenceSets: {
    include: DEFAULT_PREFERENCE_SET_INCLUDE,
  },

  // Process / ATS
  applications: true,
  userProcess: true,
  processSteps: true,
  processes: true,
  userPipelineStepComments: true,

  // Organisation / system
  company: true,
  createdJobPostings: true,
  todos: true,
  repoParticipants: true,

  // Auth
  providers: {
    include: {
      token: true,
    },
  },
};

export class UserRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = getPrismaClient();
  }

  async create(data: IUser): Promise<IUser> {
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        emailVerified: data.emailVerified,
        image: data.image,
        companyId: data.companyId,
      },
    });

    return UserMapper.base(user);
  }

  /**
   * Show user by ID with optional selective includes
   * @param id User ID
   * @param include Optional Prisma include object for selective loading
   */
  async show(id: string, include?: Prisma.UserInclude) {
    const user = await this.prisma.user.findUnique({
      where: { id: id },
      include: include || {}, // Only include what's requested
    });

    if (!user) return user;

    // If no includes specified, return base user
    if (!include || Object.keys(include).length === 0) {
      return UserMapper.base(user as IUser);
    }

    return UserMapper.db(user);
  }

  /**
   * Show user by email with optional selective includes
   * @param email User email
   * @param include Optional Prisma include object for selective loading
   */
  async showByEmail(email: string, include?: Prisma.UserInclude) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: include || {}, // Only include what's requested
    });

    if (!user) return user;

    // If no includes specified, return base user
    if (!include || Object.keys(include).length === 0) return UserMapper.base(user as IUser);

    return UserMapper.db(user);
  }

  /**
   * Show user with all relations (use sparingly - expensive!)
   */
  async showByIdFull(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: DEFAULT_USER_INCLUDE,
    });

    return user ? UserMapper.db(user) : null;
  }

  /**
   * Show user with only providers (lightweight)
   */
  async showByIdWithProviders(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        providers: {
          include: { token: true },
        },
      },
    });

    if (!user) return null;

    // Map providers to DTO
    const providers = user.providers?.map((p: any) => ({
      id: p.id,
      provider: String(p.provider),
      providerAccountId: p.providerAccountId,
      userId: p.userId,
      token: p.token
        ? {
            id: p.token.id,
            providerId: p.token.providerId,
            access_token: p.token.access_token,
            refresh_token: p.token.refresh_token,
            expires_at: p.token.expires_at,
            token_type: p.token.token_type,
            scope: p.token.scope,
            id_token: p.token.id_token,
            session_state: p.token.session_state,
          }
        : undefined,
    }));

    return {
      ...UserMapper.base(user as IUser),
      providers,
    };
  }

  // ƒ We should only have one method that includes count - we would like to keep listWithCount → re-name to list
  /**
   * List users with pagination
   * @param options Pagination options
   */
  async list(options: { page?: number; limit?: number } = {}): Promise<IUser[]> {
    const page = options.page || 1;
    const limit = options.limit || 50;

    const users = await this.prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: "asc" },
    });

    return users.map((user) => UserMapper.base(user));
  }

  /**
   * List users with total count for pagination UI
   */
  async listWithCount(options: { page?: number; limit?: number } = {}) {
    const page = options.page || 1;
    const limit = options.limit || 50;

    const [items, total] = await Promise.all([this.list(options), this.prisma.user.count()]);

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.emailVerified !== undefined && { emailVerified: data.emailVerified }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.companyId !== undefined && { companyId: data.companyId }),
      },
    });

    return UserMapper.base(user);
  }

  async remove(id: string): Promise<IUser> {
    const user = await this.prisma.user.delete({
      where: { id },
    });

    return UserMapper.base(user);
  }

  async findByCompanyId(companyId: string): Promise<IUser[]> {
    const users = await this.prisma.user.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
    });

    return users.map((user) => UserMapper.base(user));
  }
}

let instance: UserRepository | null = null;

export function getUserRepository(): UserRepository {
  if (!instance) {
    instance = new UserRepository();
  }
  return instance;
}
