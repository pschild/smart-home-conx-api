import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { add, addMinutes, format } from 'date-fns';
import { Observable, catchError, forkJoin, map, of, tap, timeout } from 'rxjs';
import { meanBy, template } from 'lodash';

interface CommutingInfo {
  minutes: number;
  eta: string;
  distance: number;
  delay: string;
}

interface TomTomResponse {
  routes: Array<{
    summary: {
      lengthInMeters: number;
      travelTimeInSeconds: number;
      trafficDelayInSeconds: number;
      trafficLengthInMeters: number;
    };
    guidance: {
      instructions: Array<{
        roadNumbers?: string[];
      }>;
    };
  }>;
}

interface WazeResponse {
  alternatives: Array<{
    response: {
      isFastest: boolean;
      jams: Array<{
        id: number;
        severity: number;
      }>;
      routeName: string;
      totalLength: number;
      totalSeconds: number;
    };
  }>;
}

@Injectable()
export class TrafficService {

  private readonly logger = new Logger(TrafficService.name);

  private static REQUEST_TIMEOUT = 1500;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  getCombinedResult(fromLat: number, fromLng: number, toLat: number, toLng: number): Observable<CommutingInfo> {
    return forkJoin({
      tomtomInfo: this.getTomTomInfo(fromLat, fromLng, toLat, toLng),
      wazeInfo: this.getWazeInfo(fromLat, fromLng, toLat, toLng),
      googleMapsInfo: this.getGoogleMapsInfo(fromLat, fromLng, toLat, toLng)
    }).pipe(
      map(results => Object.fromEntries(Object.entries(results).filter(([_, v]) => !!v))),
      map(results => Object.values(results)),
      map(results => {
        const averageMinutes = Math.ceil(meanBy(results, item => item.minutes));
        const eta = format(addMinutes(new Date(), averageMinutes), 'HH:mm');
        return {
          minutes: averageMinutes,
          eta,
          distance: parseFloat(meanBy(results, item => item.distance).toFixed(1)),
          delay: 'normal', // TODO
          sourcesCount: results.length,
        };
      }),
    );
  }

  private getWazeInfo(fromLat: number, fromLng: number, toLat: number, toLng: number): Observable<CommutingInfo> {
    const url = this.configService.get('waze.url');

    const body = {
      from: { y: fromLat, x: fromLng },
      to: { y: toLat, x: toLng },
      nPaths: 3,
      useCase: 'LIVEMAP_PLANNING',
      interval: 15,
      arriveAt: true
    };
    return this.httpService.post<WazeResponse>(url, body).pipe(
      timeout(TrafficService.REQUEST_TIMEOUT),
      map(response => response.data),
      tap(({ alternatives }) => alternatives.map(alternative => {
        this.logger.log(`Waze`);
        this.logger.log(`${(alternative.response.totalLength / 1000).toFixed(1)}km, ${this.toDuration(alternative.response.totalSeconds)}, Staus: ${alternative.response.jams.length}, schnellste: ${alternative.response.isFastest}`);
        this.logger.log(`über ${alternative.response.routeName}`);
      })),
      map(({ alternatives }) => {
        const fastestRoute = alternatives.find(alternative => alternative.response.isFastest === true);
        const minutes = Math.ceil(fastestRoute.response.totalSeconds / 60);
        const eta = format(add(new Date(), { minutes }), 'HH:mm');
        const distance = +((fastestRoute.response.totalLength / 1000).toFixed(1));
        return {
          minutes,
          eta,
          distance,
          delay: 'normal' // TODO
        };
      }),
      catchError(err => {
        this.logger.error(`An error occured for getWazeInfo: ${err}`);
        return of(null);
      }),
    );
  }
  
  private getTomTomInfo(fromLat: number, fromLng: number, toLat: number, toLng: number): Observable<CommutingInfo> {
    const url = template(this.configService.get('tomtom.url'))({ fromLat, fromLng, toLat, toLng });

    return this.httpService.get<TomTomResponse>(url).pipe(
      timeout(TrafficService.REQUEST_TIMEOUT),
      map(response => response.data.routes),
      tap(routes => routes.map(route => {
        this.logger.log(`TomTom`);
        this.logger.log(`${(route.summary.lengthInMeters / 1000).toFixed(1)}km, ${this.toDuration(route.summary.travelTimeInSeconds)}, Verzoegerung: +${this.toDuration(route.summary.trafficDelayInSeconds)}`);
        const autobahnen = new Set(
          route.guidance.instructions
            .map((instruction) => !!instruction.roadNumbers ? instruction.roadNumbers.find((no) => !!no.match(/^A(3|40|42|57)$/)) : undefined)
            .filter(Boolean)
        );
        this.logger.log(`über ${Array.from(autobahnen).join(', ')}`);
      })),
      map(routes => {
        const bestRoute = routes[0];
        const minutes = Math.ceil(bestRoute.summary.travelTimeInSeconds / 60);
        const eta = format(add(new Date(), { minutes }), 'HH:mm');
        const distance = +((bestRoute.summary.lengthInMeters / 1000).toFixed(1));
        return {
          minutes,
          eta,
          distance,
          delay: 'normal' // TODO
        };
      }),
      catchError(err => {
        this.logger.error(`An error occured for getTomTomInfo: ${err}`);
        return of(null);
      }),
    );
  }

  private getGoogleMapsInfo(fromLat: number, fromLng: number, toLat: number, toLng: number): Observable<CommutingInfo> {
    const url = template(this.configService.get('google-maps.url'))({ fromLat, fromLng, toLat, toLng });

    const trafficTypes = ['default', 'light', 'medium', 'heavy'];
    return this.httpService.get<any>(url).pipe(
      timeout(TrafficService.REQUEST_TIMEOUT),
      map(response => response.data),
      tap(data => {
        this.logger.log(`Google Maps`);
        const json = JSON.parse(data.substring(4));
        const routes = json[0][1];
        routes.forEach((route) => {
          const name = route[0][1];
          const distance = route[0][2][0];
          const duration = route[0][10][0][0];
          const trafficType = route[0][10][1];
          const isFastestRoute = !!JSON.stringify(route).match('Schnellste Route');
          const etaTextMatch = JSON.stringify(route).match('Du kommst etwa um (.+) an.');
          this.logger.log(`${(distance / 1000).toFixed(1)}km, ${this.toDuration(duration)}, ${trafficTypes[trafficType]}, schnellste: ${isFastestRoute}, etaText: ${etaTextMatch ? etaTextMatch[1] : 'N/A'}`);
          this.logger.log(`über ${name}`);
        });
      }),
      map(data => {
        const json = JSON.parse(data.substring(4));
        const routes = json[0][1];
        const bestRoute = routes[0];
        const minutes = Math.ceil(bestRoute[0][10][0][0] / 60);
        const eta = format(add(new Date(), { minutes }), 'HH:mm');
        const distance = +((bestRoute[0][2][0] / 1000).toFixed(1));
        const delayIndex = bestRoute[0][10][1];
        const delay = trafficTypes[delayIndex];
        return {
          minutes,
          eta,
          distance,
          delay,
        };
      }),
      catchError(err => {
        this.logger.error(`An error occured for getGoogleMapsInfo: ${err}`);
        return of(null);
      }),
    );
  }

  private toDuration(seconds: number): string {
    return new Date(seconds * 1000).toISOString().substring(11, 16);
  }
}
