import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DEMO_CALENDAR, DEMO_ELECTION, DEMO_NOTICE, Election, ElectionCalendarItem } from '@9ja-vote/shared-types';

@ApiTags('elections')
@Controller('elections')
export class ElectionsController {
  @Get()
  list(): { notice: string; items: Election[]; calendar: ElectionCalendarItem[] } {
    return { notice: DEMO_NOTICE, items: [DEMO_ELECTION], calendar: DEMO_CALENDAR };
  }

  @Get(':id')
  one(@Param('id') id: string): { election: Election; calendar: ElectionCalendarItem[]; notice: string } {
    if (id !== DEMO_ELECTION.id) throw new NotFoundException(`Unknown election: ${id}`);
    return { election: DEMO_ELECTION, calendar: DEMO_CALENDAR, notice: DEMO_NOTICE };
  }
}
