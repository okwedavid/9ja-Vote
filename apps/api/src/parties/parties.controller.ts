import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DEMO_NOTICE, DEMO_PARTIES, Party } from '@9ja-vote/shared-types';

@ApiTags('parties')
@Controller('parties')
export class PartiesController {
  /** Synthetic placeholders only. Real parties are loaded from verified INEC publications. */
  @Get()
  list(): { notice: string; items: Party[] } {
    return { notice: DEMO_NOTICE, items: DEMO_PARTIES };
  }
}
