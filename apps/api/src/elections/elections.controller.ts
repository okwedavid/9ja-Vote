import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DEMO_ELECTION, DEMO_NOTICE, Election } from '@9ja-vote/shared-types';

@ApiTags('elections')
@Controller('elections')
export class ElectionsController {
  @Get()
  list(): { notice: string; items: Election[] } {
    return { notice: DEMO_NOTICE, items: [DEMO_ELECTION] };
  }
}
