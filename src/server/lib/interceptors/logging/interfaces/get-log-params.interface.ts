export interface GetLogParams {
  start: number;
  executionTime: number;
  statusCode: number;
  curlString: string;
  /**
   * @default false
   */
  error?: boolean;
  noCloseWrap?: boolean;
}
