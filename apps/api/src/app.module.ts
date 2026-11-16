import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AdminController } from './admin/admin.controller';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard, PermissionsGuard } from './auth/auth.guard';
import { ClassificationInterceptor } from './common/classification.interceptor';
import { DataStore } from './common/data-store';
import { ContentController, NotificationsController } from './content/content.controller';
import { ElectionsController } from './elections/elections.controller';
import { HealthController } from './health/health.controller';
import { MetaController } from './meta/meta.controller';
import { PartiesController } from './parties/parties.controller';
import { PollingUnitsController } from './polling-units/polling-units.controller';
import { ResultsController } from './results/results.controller';
import { ResultsService } from './results/results.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: Number(process.env.RATE_LIMIT_PER_MINUTE ?? 120) }]),
  ],
  controllers: [
    HealthController,
    MetaController,
    ElectionsController,
    PartiesController,
    ResultsController,
    PollingUnitsController,
    ContentController,
    NotificationsController,
    AuthController,
    AdminController,
  ],
  providers: [
    { provide: DataStore, useFactory: () => new DataStore() },
    AuthService,
    ResultsService,
    JwtAuthGuard,
    PermissionsGuard,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: ClassificationInterceptor },
  ],
})
export class AppModule {}
