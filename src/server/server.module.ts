import { Module } from '@nestjs/common/decorators';
import { AppModule } from './app/app.module';
import { ViewModule } from './view/view.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [
    ConfigModule.forRoot({ folder: './configs' }),
    AppModule,
    ViewModule,
  ],
  exports: [ConfigModule],
})
export class ServerModule {}
