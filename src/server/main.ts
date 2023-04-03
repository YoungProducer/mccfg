import { NestFactory } from '@nestjs/core';
import { ServerModule } from './server.module';
import { HttpLoggingInterceptor } from './lib/interceptors/logging/http-logging.interceptor';
import { AllExceptionFilter } from './lib/exception-filters/all-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(ServerModule);
  app.useGlobalInterceptors(new HttpLoggingInterceptor());
  app.useGlobalFilters(new AllExceptionFilter());
  await app.listen(3000);
}
bootstrap();
