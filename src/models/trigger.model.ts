export interface TriggerDefinition {
  id: string;
  order: number;
  isPublic: boolean;
  createdBy: string;
  triggerCode: string; // e.g., "REMINDER", "EMAIL_SENT", etc.
  executeWhen?: string; // e.g., "time", "event" (nullable)
  executeAt?: string; // ISO date string (nullable)
  combinator?: string; // nullable
  config: Record<string, any>; // JSON config
  expiration?: string; // nullable
  stepId?: string; // nullable
}
