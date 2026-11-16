import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Candidate, candidateForParty, DEMO_CANDIDATES, DEMO_NOTICE, DEMO_PARTIES, Party } from '@9ja-vote/shared-types';

@ApiTags('parties')
@Controller('parties')
export class PartiesController {
  /** Synthetic placeholders only. Real parties are loaded from verified INEC publications. */
  @Get()
  list(): { notice: string; items: (Party & { candidate?: Candidate })[] } {
    return {
      notice: DEMO_NOTICE,
      items: DEMO_PARTIES.map((p) => ({ ...p, candidate: candidateForParty(p.id) })),
    };
  }

  @Get(':id')
  one(@Param('id') id: string): { notice: string; party: Party; candidate: Candidate | null; candidates: Candidate[] } {
    const party = DEMO_PARTIES.find((p) => p.id === id);
    if (!party) throw new NotFoundException(`Unknown party: ${id}`);
    return {
      notice: DEMO_NOTICE,
      party,
      candidate: candidateForParty(party.id) ?? null,
      candidates: DEMO_CANDIDATES.filter((c) => c.partyId === party.id),
    };
  }
}
