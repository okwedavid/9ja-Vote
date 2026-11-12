import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  check(): { status: 'ok'; service: string; mode: 'DEMONSTRATION'; realVotingEnabled: false } {
    return { status: 'ok', service: '9ja-vote-api', mode: 'DEMONSTRATION', realVotingEnabled: false };
  }
}
