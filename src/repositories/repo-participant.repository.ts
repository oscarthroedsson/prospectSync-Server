import { Prisma, PrismaClient } from "@prisma/client";

import { getPrismaClient } from "../config/prisma";

export const DEFAULT_REPOPARTICIPANT_INCLUDES = {
  user: false,
  analyzedRepo: true,
} as Prisma.RepoParticipantInclude;

// Interfaces
export type ParticipantRepoInput = Prisma.RepoParticipantCreateInput;

export class RepoParticipantRepository {
  private prisma: PrismaClient;
  constructor() {
    this.prisma = getPrismaClient();
  }

  async create(
    participantData: Omit<ParticipantRepoInput, "analyzedRepo" | "userId">,
    analyzedRepoId: string,
    userId: string,
    config: typeof DEFAULT_REPOPARTICIPANT_INCLUDES = DEFAULT_REPOPARTICIPANT_INCLUDES,
  ) {
    const participant = await this.prisma.repoParticipant.create({
      data: {
        ...participantData,
        analyzedRepo: { connect: { id: analyzedRepoId } },
        user: { connect: { id: userId } },
      },
      include: { ...DEFAULT_REPOPARTICIPANT_INCLUDES, ...config },
    });

    return participant;
  }
}
