import { Controller, Get, Query } from '@nestjs/common';
import { TrafficService } from './traffic.service';
import { Observable } from 'rxjs';

@Controller('traffic')
export class TrafficController {
  constructor(private readonly trafficService: TrafficService) {}

  @Get('duration')
  getDuration(
    @Query('fromLat') fromLat: string,
    @Query('fromLng') fromLng: string,
    @Query('toLat') toLat: string,
    @Query('toLng') toLng: string,
  ): Observable<any> {
    return this.trafficService.getCombinedResult(+fromLat, +fromLng, +toLat, +toLng);
  }
}
