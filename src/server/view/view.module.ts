import { Module } from '@nestjs/common';

import { ViewController } from './view.controller';
import { ViewService } from './view.service';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [ConfigModule],
  providers: [ViewService],
  controllers: [ViewController],
})
export class ViewModule {}
