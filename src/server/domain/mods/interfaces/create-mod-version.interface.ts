export interface CreateModVersionPayload {
  modId: number;
  version: string;
  compatibleMCVersion: string | string[];
}
