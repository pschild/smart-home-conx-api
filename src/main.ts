import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { templateSettings } from 'lodash';

// settings for lodash templates
templateSettings.interpolate = /{{([\s\S]+?)}}/g;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3001);
}
bootstrap();
