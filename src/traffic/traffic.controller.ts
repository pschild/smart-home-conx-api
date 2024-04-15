import { Controller, Get, Query } from '@nestjs/common';
import { TrafficService } from './traffic.service';
import { Observable, forkJoin } from 'rxjs';

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
    const tomtomInfo$ = this.trafficService.getTomTomInfo(+fromLat, +fromLng, +toLat, +toLng);
    const wazeInfo$ = this.trafficService.getWazeInfo(+fromLat, +fromLng, +toLat, +toLng);
    const googleMapsInfo$ = this.trafficService.getGoogleMapsInfo(+fromLat, +fromLng, +toLat, +toLng);
    return forkJoin({ tomtomInfo: tomtomInfo$, wazeInfo: wazeInfo$, googleMapsInfo: googleMapsInfo$ });
  }
}
