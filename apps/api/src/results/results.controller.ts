import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Account, ResultRecord, ResultsPayload, StateResult, SubResult, WorkflowSummary } from '@9ja-vote/shared-types';
import { CurrentAccount, JwtAuthGuard } from '../auth/auth.guard';
import { TransitionDto } from '../auth/dto';
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

  @Get('states/:code/lgas')
  lgas(@Param('code') code: string): SubResult[] {
    return this.results.lgas(code);
  }

  @Get('states/:code/lgas/:lgaCode')
  wards(@Param('code') code: string, @Param('lgaCode') lgaCode: string): SubResult {
    return this.results.wards(code, lgaCode);
  }

  @Get('workflow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  workflow(): WorkflowSummary {
    return this.results.workflow();
  }

  @Post('states/:code/transition')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  transition(@Param('code') code: string, @Body() dto: TransitionDto, @CurrentAccount() account: Account): ResultRecord {
    return this.results.transition(code, dto.to, dto.note, account);
  }
}
