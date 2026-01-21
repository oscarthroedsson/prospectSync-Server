import { Prisma, PrismaClient } from "@prisma/client";

import { IUser, IUserWithRelations } from "../models/user.model";
import { getPrismaClient } from "../config/prisma";

// Define the include config once
const DEFAULT_USER_INCLUDES = {
  providers: {
    include: {
      token: true,
    },
  },
  applications: {
    include: {
      jobPosting: true,
    },
  },
  userProcess: {
    include: {
      jobPosting: true,

      process: {
        include: {
          steps: true,
        },
      },

      steps: {
        include: {
          step: true,
          comments: true,
        },
      },

      todos: {
        include: {
          todo: {
            include: {
              items: true,
            },
          },
        },
      },
    },
  },

  company: true,
  createdJobPostings: true,
  userPipelineStepComments: true,
  processSteps: true,
  processes: true,
  todos: true,
} satisfies Prisma.UserInclude;

// Typ för User med relationer
type UserWithRelations = Prisma.UserGetPayload<{
  include: typeof DEFAULT_USER_INCLUDES;
}>;

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

    return this.mapToUser(user);
  }

  async show(id: string): Promise<IUserWithRelations | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: id },
      include: DEFAULT_USER_INCLUDES,
    });
    console.log("user: ", user);
    if (!user) return user;

    return user ? this.mapToUserWithRelations(user) : null;
  }

  async showByEmail(email: string): Promise<IUserWithRelations | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: DEFAULT_USER_INCLUDES,
    });

    return user ? this.mapToUserWithRelations(user) : null;
  }

  async list(): Promise<IUser[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { name: "asc" },
    });

    return users.map((user) => this.mapToUser(user));
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

    return this.mapToUser(user);
  }

  async remove(id: string): Promise<IUser> {
    const user = await this.prisma.user.delete({
      where: { id },
    });

    return this.mapToUser(user);
  }

  async findByCompanyId(companyId: string): Promise<IUser[]> {
    const users = await this.prisma.user.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
    });

    return users.map((user) => this.mapToUser(user));
  }

  private mapToUser(user: any): IUser {
    return {
      id: user.id,
      name: user.name ?? undefined,
      email: user.email ?? undefined,
      emailVerified: user.emailVerified ?? undefined,
      image: user.image ?? undefined,
      companyId: user.companyId ?? undefined,
    };
  }

  private mapToUserWithRelations(user: UserWithRelations): IUserWithRelations {
    return {
      ...this.mapToUser(user),
      providers: user.providers?.map((p) => ({
        id: p.id,
        provider: p.provider,
        providerAccountId: p.providerAccountId,
        token: p.token ? p.token : undefined,
      })),
      applications: user.applications?.map((a) => ({
        id: a.id,
        jobPostingId: a.jobPostingId,
        status: a.status,
        appliedAt: a.appliedAt,
        gotJob: a.gotJob,
      })),
      company: user.company
        ? {
            id: user.company.id,
            name: user.company.name,
            logo: user.company.logo ?? undefined,
          }
        : undefined,
    };
  }
}

let instance: UserRepository | null = null;

export function getUserRepository(): UserRepository {
  if (!instance) {
    instance = new UserRepository();
  }
  return instance;
}
