import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ClassificationInterceptor } from './common/classification.interceptor';
import { ElectionsController } from './elections/elections.controller';
import { HealthController } from './health/health.controller';
import { PartiesController } from './parties/parties.controller';
import { ResultsController } from './results/results.controller';
import { ResultsService } from './results/results.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: Number(process.env.RATE_LIMIT_PER_MINUTE ?? 120) }]),
  ],
  controllers: [HealthController, ElectionsController, PartiesController, ResultsController],
  providers: [
    ResultsService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: ClassificationInterceptor },
  ],
})
export class AppModule {}
