import * as dns from 'dns';
import cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from './config/config.service';

dns.setServers(['8.8.8.8', '1.1.1.1']);

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  const configService = app.get(ConfigService)

  const baseUrl1 = configService.getFrontEndBaseUrl1();
  const baseUrl2 = configService.getFrontEndBaseUrl2();

  app.enableCors({
    origin: [
      baseUrl1,
      baseUrl2
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(process.env.PORT ?? 8100);
}
bootstrap();
