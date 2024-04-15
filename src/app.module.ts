import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CypressController } from './cypress/cypress.controller';
import { CypressService } from './cypress/cypress.service';
import { ConfigModule } from '@nestjs/config';
import { BlitzerDeController } from './blitzer-de.controller';
import configuration from './configuration';
import { HttpModule } from '@nestjs/axios';
import { TrafficService } from './traffic/traffic.service';
import { TrafficController } from './traffic/traffic.controller';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration]
    })
  ],
  controllers: [AppController, CypressController, BlitzerDeController, TrafficController],
  providers: [AppService, CypressService, TrafficService],
})
export class AppModule {}
