import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ServerModule } from './server.module';
import { HttpLoggingInterceptor } from './lib/interceptors/logging/http-logging.interceptor';
import { AllExceptionFilter } from './lib/exception-filters/all-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(ServerModule);

  const options = new DocumentBuilder()
    .setTitle('MC cfg')
    .setVersion('1.0')
    .addTag('MC cfg')
    .build();

  const document = SwaggerModule.createDocument(app, options);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new HttpLoggingInterceptor());
  app.useGlobalFilters(new AllExceptionFilter());

  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);

  console.log(`Server started on ${await app.getUrl()}`);
}
bootstrap();
