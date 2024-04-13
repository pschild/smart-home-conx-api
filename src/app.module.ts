import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CypressController } from './cypress/cypress.controller';
import { CypressService } from './cypress/cypress.service';

@Module({
  imports: [],
  controllers: [AppController, CypressController],
  providers: [AppService, CypressService],
})
export class AppModule {}
