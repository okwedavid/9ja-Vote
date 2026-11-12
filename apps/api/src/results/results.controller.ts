import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResultsPayload, StateResult } from '@9ja-vote/shared-types';
import { ResultsService } from './results.service';

@ApiTags('results')
@Controller('results')
export class ResultsController {
  constructor(private readonly results: ResultsService) {}

  @Get('national')
  national(): ResultsPayload {
    return this.results.national();
  }

  @Get('states/:code')
  state(@Param('code') code: string): StateResult {
    return this.results.state(code);
  }
}
