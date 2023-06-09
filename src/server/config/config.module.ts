import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

import { ConfigOptions, EnvConfig } from './interfaces';
import { DI_CONFIG } from './constants';
import { DynamicModule, Module } from '@nestjs/common';

const defaultOptions: ConfigOptions = {
  folder: './configs',
};

const configFactory = (options: ConfigOptions) => ({
  provide: DI_CONFIG,
  useFactory: (): EnvConfig => {
    const fileName = `${process.env.NODE_ENV || 'development'}.env`;

    const envFile = path.resolve(process.cwd(), options.folder, fileName);

    return dotenv.parse(fs.readFileSync(envFile)) as unknown as EnvConfig;
  },
});

@Module({})
export class ConfigModule {
  static forRoot(options: ConfigOptions = defaultOptions): DynamicModule {
    const configProvider = configFactory(options);

    return {
      global: true,
      module: ConfigModule,
      providers: [configProvider],
      exports: [configProvider],
    };
  }
}
