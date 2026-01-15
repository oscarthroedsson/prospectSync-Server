export enum EventType {
  // Application events
  APPLICATION_CREATED = "application.created",
  APPLICATION_STAGE_CHANGED = "application.stage_changed",
  APPLICATION_REJECTED = "application.rejected",
  APPLICATION_HIRED = "application.hired",

  // Job posting events
  JOB_POSTING_EXPIRING_SOON = "job_posting.expiring_soon",
  JOB_POSTING_EXPIRED = "job_posting.expired",

  // Trigger events
  REMINDER_TRIGGER = "trigger.reminder",
}

export interface Event {
  type: EventType;
  payload: any;
}

export type Listener = (event: Event) => void | Promise<void>;
