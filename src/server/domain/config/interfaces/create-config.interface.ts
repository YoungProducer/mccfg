export interface CreateConfigPayload {
  fileName: string;
  initialFileName: string;
  version: string;
  ownerId: number;
  primaryModId: number;
  dependenciesIds: number[];
}
