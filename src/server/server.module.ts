import { Module } from '@nestjs/common/decorators';
import { AppModule } from './app/app.module';
import { ViewModule } from './view/view.module';

@Module({
  imports: [AppModule, ViewModule],
})
export class ServerModule {}
