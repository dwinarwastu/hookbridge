export interface IProvider {
  validate(payload: Buffer, headers: Record<string, unknown>): boolean;
  extractEventType(payload: Record<string, unknown>): string;
}
