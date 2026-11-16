import { BadRequestException, Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { buildDemoPollingUnits, PollingUnit, STATES } from '@9ja-vote/shared-types';

const NOTICE = 'Synthetic polling-unit records for demonstration. Codes and voter counts are invented.';

@ApiTags('polling units')
@Controller('polling-units')
export class PollingUnitsController {
  private readonly cache = new Map<string, PollingUnit[]>();

  private forState(stateCode: string): PollingUnit[] {
    const state = STATES.find((s) => s.code === stateCode.toUpperCase());
    if (!state) throw new BadRequestException(`Unknown state code: ${stateCode}`);
    const cached = this.cache.get(state.code);
    if (cached) return cached;
    const units = buildDemoPollingUnits(state.code, state.name);
    this.cache.set(state.code, units);
    return units;
  }

  @Get()
  search(
    @Query('state') state?: string,
    @Query('lga') lga?: string,
    @Query('q') q?: string,
    @Query('limit') limit?: string,
  ): { notice: string; total: number; items: PollingUnit[] } {
    if (!state) throw new BadRequestException('Provide ?state= with a state code, for example ?state=LA');
    let items = this.forState(state);
    if (lga) items = items.filter((u) => u.lgaCode.toLowerCase() === lga.toLowerCase());
    if (q) {
      const needle = q.toLowerCase();
      items = items.filter(
        (u) =>
          u.name.toLowerCase().includes(needle) ||
          u.code.toLowerCase().includes(needle) ||
          u.lgaName.toLowerCase().includes(needle) ||
          u.wardName.toLowerCase().includes(needle),
      );
    }
    const parsed = Number(limit ?? 50);
    const safeLimit = Number.isFinite(parsed) ? Math.min(Math.max(Math.trunc(parsed), 1), 100) : 50;
    return { notice: NOTICE, total: items.length, items: items.slice(0, safeLimit) };
  }

  @Get(':code')
  byCode(@Param('code') code: string): PollingUnit & { notice: string } {
    const stateCode = code.split('-')[0];
    if (!stateCode) throw new NotFoundException(`Unknown polling unit: ${code}`);
    const found = this.forState(stateCode).find((u) => u.code.toLowerCase() === code.toLowerCase());
    if (!found) throw new NotFoundException(`Unknown polling unit: ${code}`);
    return { ...found, notice: NOTICE };
  }
}
