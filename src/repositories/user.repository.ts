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

  async show(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: id },
      include: DEFAULT_USER_INCLUDE,
    });
    console.log("user: ", user);
    if (!user) return user;

    return user ? UserMapper.db(user) : null;
  }

  async showByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: DEFAULT_USER_INCLUDE,
    });

    return user ? UserMapper.db(user) : null;
  }

  async list(): Promise<IUser[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { name: "asc" },
    });

    return users.map((user) => UserMapper.base(user));
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
