export interface ActionDefinition {
  id: string;
  stepId: string;
  name: string;
  isPublic: boolean;
  order: number;
  config: Record<string, any>; // JSON config with discriminated union
}

export interface ProcessStep {
  id: string;
  processId?: string;
  name: string;
  // Note: status field removed - not present in Prisma schema
  // Status tracking would need to be implemented via UserProcessStep or separate table
  order: number;
  actions?: ActionDefinition[];
  metadata?: Record<string, any>;
}

export enum ActionConfigType {
  SEND_EMAIL = "SEND_EMAIL",
  CREATE_CALENDAR_EVENT = "CREATE_CALENDAR_EVENT",
  CREATE_TASK = "CREATE_TASK",
  WEBHOOK = "WEBHOOK",
  CALL_REMINDER = "CALL_REMINDER",
  UPDATE_STEP_STATUS = "UPDATE_STEP_STATUS",
}
