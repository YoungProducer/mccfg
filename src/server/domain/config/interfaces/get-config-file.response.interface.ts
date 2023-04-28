import { ReadStream } from 'typeorm/platform/PlatformTools';

export interface GetConfigFileResponse {
  file: ReadStream;
  fileName: string;
}
