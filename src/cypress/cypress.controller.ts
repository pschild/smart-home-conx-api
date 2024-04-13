import { Controller, Get, Header, Logger, Query } from '@nestjs/common';
import { Observable } from 'rxjs';
import { CypressService } from './cypress.service';

@Controller('cypress')
export class CypressController {

  private readonly logger = new Logger(CypressController.name);

  constructor(
    private service: CypressService
  ) {
  }

  @Get('run')
  @Header('content-type', 'application/json')
  run(@Query('name') name: string): Observable<any> {
    return this.service.executeCypress(name);
  }
}
