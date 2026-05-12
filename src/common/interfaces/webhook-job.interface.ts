export interface WebhookJobData {
  logId: string;
  provider: string;
  eventType: string;
  payload: Record<string, unknown>;
  headers: Record<string, unknown>;
}
