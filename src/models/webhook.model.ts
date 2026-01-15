export enum WebhookStatus {
  STARTED = "started",
  RUNNING = "running",
  SUCCESS = "success",
  ERROR = "error",
}

export enum WebhookEvent {
  SCAN = "scan",
  ANALYZE = "analyze",
}

export enum WebhookType {
  PDF = "pdf",
  JOB_POSTING = "job-posting",
  REPO = "repo",
  RESUME = "resume",
}

export interface WebhookPayload {
  payloadOwner?: string;
  status: WebhookStatus;
  event: WebhookEvent;
  type: WebhookType;
  data?: any;
  error?: string;
  message?: string;
  timestamp: string;
}
