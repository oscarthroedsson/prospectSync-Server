import { AnalyzedRepo, Prisma, PrismaClient } from "@prisma/client";

import { getPrismaClient } from "../config/prisma";

export const DEFAULT_ANALYZED_REPO_INCLUDE = {
  repoParticipants: false,
} as Prisma.AnalyzedRepoInclude;

export type AnalyzedRepoInput = Prisma.AnalyzedRepoCreateInput;

export class AnalysedRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = getPrismaClient();
  }

  async create(
    data: Prisma.AnalyzedRepoCreateInput,
    config: Partial<typeof DEFAULT_ANALYZED_REPO_INCLUDE> = DEFAULT_ANALYZED_REPO_INCLUDE,
  ): Promise<AnalyzedRepo> {
    return this.prisma.analyzedRepo.create({
      data,
      include: { ...config, ...DEFAULT_ANALYZED_REPO_INCLUDE },
    });
  }

  async showUnique(id: string) {
    return this.prisma.analyzedRepo.findUnique({
      where: { id },
      include: DEFAULT_ANALYZED_REPO_INCLUDE,
    });
  }

  async updateUnique(id: string, data: Prisma.AnalyzedRepoUpdateInput) {
    return this.prisma.analyzedRepo.update({
      where: { id },
      data,
      include: DEFAULT_ANALYZED_REPO_INCLUDE,
    });
  }
  async upsert() {}
  async remove() {}
}
