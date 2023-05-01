import { Module } from '@nestjs/common';
import { ConfigsService } from './config.service';
import { ConfigsController } from './config.controller';
import { UsersModule } from '../users/users.module';
import { ModsModule } from '../mods/mods.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigEntity } from './entities/config.entity';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule } from 'server/config/config.module';
import { DI_CONFIG } from 'server/config/constants';
import { EnvConfig } from 'server/config/interfaces';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';
import { UserEntity } from '../users/entities/user.entity';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { ConfigSubscriber } from './subscribers/config.subscriber';

@Module({
  imports: [
    UsersModule,
    ModsModule,
    TypeOrmModule.forFeature([ConfigEntity]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: EnvConfig) => ({
        storage: diskStorage({
          destination(req, _file, callback) {
            const uploadsDir = config.FILE_UPLOAD_DIR;

            const user: UserEntity = req['user'];

            const fullPath = join(
              process.cwd(),
              uploadsDir,
              user.username,
              'configs',
            );

            callback(null, fullPath);
          },
          filename: (req, file, cb) => {
            const randFileName = randomStringGenerator();
            const fileName = `${randFileName}${extname(file.originalname)}`;
            req['fileName'] = fileName;
            cb(null, fileName);
          },
        }),
      }),
      inject: [DI_CONFIG],
    }),
  ],
  providers: [ConfigsService, ConfigSubscriber],
  controllers: [ConfigsController],
})
export class ConfigsModule {}
