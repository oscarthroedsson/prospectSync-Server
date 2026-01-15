import { PrismaClient } from "@prisma/client";
import { getPrismaClient } from "../config/database";
import { ProcessStep, ActionDefinition } from "../models/action.model";

export class StepRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = getPrismaClient();
  }

  async getStepByID(stepID: string): Promise<ProcessStep | null> {
    const step = await this.prisma.processStep.findUnique({
      where: { id: stepID },
    });

    if (!step) {
      return null;
    }

    return {
      id: step.id,
      processId: step.processId || undefined,
      name: step.title, // Prisma uses 'title', model uses 'name'
      // status field removed - not in Prisma schema
      order: step.order,
    };
  }

  async getActionsByStepID(stepID: string): Promise<ActionDefinition[]> {
    const actions = await this.prisma.actionDefinition.findMany({
      where: { stepId: stepID },
      orderBy: { order: "asc" },
    });

    return actions
      .filter((action) => action.stepId !== null) // Filter out null stepIds
      .map((action) => ({
        id: action.id,
        stepId: action.stepId!, // Non-null assertion since we filtered
        name: action.name,
        isPublic: action.isPublic,
        order: action.order,
        config: action.config as Record<string, any>,
      }));
  }

  async getUserEmailByStepID(stepID: string): Promise<string | null> {
    const userProcessStep = await this.prisma.userProcessStep.findFirst({
      where: { stepId: stepID },
      include: {
        process: {
          include: {
            user: true,
          },
        },
      },
    });

    return userProcessStep?.process.user.email || null;
  }
}

let instance: StepRepository | null = null;

export function getStepRepository(): StepRepository {
  if (!instance) {
    instance = new StepRepository();
  }
  return instance;
}
