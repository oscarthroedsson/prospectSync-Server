import { PrismaClient, Prisma } from "@prisma/client";
import { getPrismaClient } from "../config/database";
import { TriggerDefinition } from "../models/trigger.model";

export class TriggerRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = getPrismaClient();
  }

  async findReminderTriggersByDate(dateStr: string): Promise<TriggerDefinition[]> {
    // Use raw SQL query to match Go implementation and avoid Prisma type issues
    // This matches the exact query from trigger.repo.go
    const triggers = await this.prisma.$queryRaw<
      Array<{
        id: string;
        order: number;
        isPublic: boolean;
        createdBy: string;
        triggerCode: string;
        executeWhen: string | null;
        executeAt: string | null;
        combinator: string | null;
        config: any;
        expiration: string | null;
        stepId: string | null;
      }>
    >(
      Prisma.sql`
        SELECT
          id,
          "order",
          "isPublic",
          "createdBy",
          "triggerCode",
          "executeWhen",
          "executeAt",
          combinator,
          config,
          expiration,
          "stepId"
        FROM trigger_definition
        WHERE "triggerCode" = 'REMINDER'
          AND ("executeWhen" IS NULL OR "executeWhen" = 'REMINDER')
          AND "executeAt" IS NOT NULL
          AND DATE("executeAt"::timestamp) = DATE(${dateStr}::timestamp)
        ORDER BY "executeAt" ASC
      `
    );

    return triggers.map((trigger) => ({
      id: trigger.id,
      order: trigger.order,
      isPublic: trigger.isPublic,
      createdBy: trigger.createdBy,
      triggerCode: trigger.triggerCode,
      executeWhen: trigger.executeWhen || undefined,
      executeAt: trigger.executeAt || undefined,
      combinator: trigger.combinator || undefined,
      config: trigger.config as Record<string, any>,
      expiration: trigger.expiration || undefined,
      stepId: trigger.stepId || undefined,
    }));
  }
}

let instance: TriggerRepository | null = null;

export function getTriggerRepository(): TriggerRepository {
  if (!instance) {
    instance = new TriggerRepository();
  }
  return instance;
}
