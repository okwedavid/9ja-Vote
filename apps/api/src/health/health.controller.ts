import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DataStore } from '../common/data-store';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly store: DataStore) {}

  @Get()
  check(): {
    status: 'ok';
    service: string;
    mode: 'DEMONSTRATION';
    realVotingEnabled: false;
    version: string;
    storeVersion: number;
    uptimeSeconds: number;
  } {
    return {
      status: 'ok',
      service: '9ja-vote-api',
      mode: 'DEMONSTRATION',
      realVotingEnabled: false,
      version: process.env.APP_VERSION ?? '0.2.0',
      storeVersion: this.store.version,
      uptimeSeconds: Math.round(process.uptime()),
    };
  }
}
