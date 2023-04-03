import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { format } from 'date-fns';
import chalk from 'chalk';

import { GetLogParams } from '../interfaces';

export const logName = (name: string): string => chalk.green(name);
export const logValue = (...value: any): string => chalk.yellow(value);

export const startWrap = chalk.magenta('#################################');
export const closeWrap = `${startWrap}\n`;

export const getLog = ({
  start,
  executionTime,
  statusCode,
  curlString,
  error,
  noCloseWrap,
}: GetLogParams): string => `
${startWrap}
${logName('Request id:')} ${logValue(randomStringGenerator())}
${logName('Request time:')} ${format(
  new Date(start),
  'MM/dd/yyyy, HH:mm:ss a..aa',
)}
${logName('Execution time:')} ${logValue(executionTime, 'ms')}
${logName('Response status:')} ${chalk[error ? 'red' : 'yellow'](statusCode)}
${logName('Curl:')} ${logValue(curlString)}
${!noCloseWrap ? `${closeWrap}` : ''}`;
