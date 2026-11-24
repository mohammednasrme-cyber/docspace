import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  configureApp(app);

  const config = app.get(ConfigService);
  const port = Number(config.get<string>('PORT') ?? 3001);

  await app.listen(port, '0.0.0.0');
  Logger.log(`DocSpace API listening on http://localhost:${port}/api`, 'Bootstrap');
}

void bootstrap();
