import { Controller, Get, Header, Logger, Query } from '@nestjs/common';
import { Observable, of } from 'rxjs';
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

  @Get('mema/mock')
  memaTest(): Observable<any> {
    return of({
      "crawlTime": "2023-12-01T08:59:53.484Z",
      "balance": 35 + Math.floor(Math.random() * 100) / 100,
      "overview": [
        {
          "day": "2023-11-26T23:00:00.000Z",
          "active": false,
          "ordered": false
        },
        {
          "day": "2023-11-27T23:00:00.000Z",
          "active": false,
          "ordered": false
        },
        {
          "day": "2023-11-28T23:00:00.000Z",
          "active": false,
          "ordered": true
        },
        {
          "day": "2023-11-29T23:00:00.000Z",
          "active": false,
          "ordered": false
        },
        {
          "day": "2023-11-30T23:00:00.000Z",
          "active": true,
          "ordered": false
        },
        {
          "day": "2023-12-03T23:00:00.000Z",
          "active": true,
          "ordered": false
        },
        {
          "day": "2023-12-04T23:00:00.000Z",
          "active": true,
          "ordered": false
        },
        {
          "day": "2023-12-05T23:00:00.000Z",
          "active": true,
          "ordered": true
        },
        {
          "day": "2023-12-06T23:00:00.000Z",
          "active": true,
          "ordered": false
        },
        {
          "day": "2023-12-07T23:00:00.000Z",
          "active": true,
          "ordered": false
        }
      ],
      "orderedToday": false,
      "orderedNextWeek": false
    });
  }

  @Get('bof/mock')
  bofTest(): Observable<any> {
    return of({
      "crawlTime": "2024-03-26T12:35:11.050Z", // 13:35:11
      "startDateTime": "2024-03-26T15:00:00.000Z", // 16:00
      "endDateTime": "2024-03-26T17:00:00.000Z" // 18:00
    });
  }
}
