import { HttpService } from '@nestjs/axios';
import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { booleanPointInPolygon, point, polygon } from '@turf/turf';
import { parse } from 'date-fns';
import { Observable, map } from 'rxjs';

interface Poi {
  id: string;
  lat: string;
  lng: string;
  address: {
    street: string;
    city: string;
  };
  type: string; // "ts": Teilstationaere Blitzer, "1": Mobile Blitzer, "2": Ampelblitzer, "6": Abstandskontrolle
  vmax: string; // vmax="50"
  create_date: string; // create_date="08.04.2024" oder "13:34"
  confirm_date: string; // confirm_date="08.04.2024" oder "13:34"; falls identisch mit create_date, dann noch nicht confirmed!
  info: {
    partly_fixed?: string;
    confirmed: number; // confirmed=0 oder 1
    quality: string | number; // quality="" oder 0..10
  };
}

interface PoiDto {
  createdAt: string;
  lastConfirmedAt: string;
  address: string;
  limit: string;
  typ: 'Blitzer teilstationär' | 'Blitzer mobil',
  isConfirmed: boolean;
  qualityPercent: number;
  highPrio: boolean;
}

@Controller('blitzer-de')
export class BlitzerDeController {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  @Get('pois')
  getPois(): Observable<PoiDto[]> {
    const highPrioArea = polygon([this.configService.get<any>('blitzer.polygon')]);
    return this.httpService.get<{ pois: Poi[] }>(this.buildUrl()).pipe(
      map(response => response.data.pois),
      map(poiList => poiList.map(poi => ({
        createdAt: this.parseDate(poi.create_date).toISOString(),
        lastConfirmedAt: this.parseDate(poi.confirm_date).toISOString(),
        address: `${poi.address.street} (${poi.address.city})`,
        limit: poi.vmax,
        typ: poi.type === '1' && poi.info.partly_fixed === '1' ? 'Blitzer teilstationär' : 'Blitzer mobil',
        isConfirmed: poi.info.confirmed ? true : false,
        qualityPercent: +poi.info.quality ? +poi.info.quality * 10 : 0,
        highPrio: booleanPointInPolygon(point([+poi.lat, +poi.lng]), highPrioArea),
      })))
    );
  }

  private parseDate(raw: string): Date {
    const timeMatch = raw.match(/^(\d{2}:\d{2})$/);
    const dayMatch = raw.match(/^(\d{2}.\d{2}.\d{4})$/);
    if (!!timeMatch) {
      return parse(timeMatch[0], 'H:mm', new Date());
    } else if (!!dayMatch) {
      return parse(dayMatch[0], 'dd.M.yyyy', new Date())
    }
  }

  private buildUrl(): string {
    return [
      this.configService.get<string>('blitzer.url'),
      `?type=${this.configService.get('blitzer.type-whitelist').join(',')}`,
      '&z=11',
      `&box=${this.configService.get('blitzer.box.bottom-left').join(',')},${this.configService.get('blitzer.box.top-right').join(',')}`
    ].join('');
  }
}
