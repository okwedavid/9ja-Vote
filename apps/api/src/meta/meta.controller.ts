import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DATA_CLASSIFICATION, DEMO_NOTICE, LOCALES } from '@9ja-vote/shared-types';

export interface FeatureStatus {
  key: string;
  label: string;
  status: 'LIVE' | 'IN_REVIEW' | 'PLANNED';
  note: string;
}

const FEATURES: FeatureStatus[] = [
  { key: 'results.public', label: 'Public results with drill-down', status: 'LIVE', note: 'National → state → LGA → ward, synthetic figures.' },
  { key: 'results.workflow', label: 'Seven-stage result workflow', status: 'LIVE', note: 'Server-enforced transitions with an append-only audit trail.' },
  { key: 'rbac', label: 'Six administration roles', status: 'LIVE', note: 'Separation of duties enforced by guards, not by the UI.' },
  { key: 'mfa', label: 'Two-factor authentication', status: 'LIVE', note: 'TOTP for administrators. No default accounts exist.' },
  { key: 'audit', label: 'Audit log', status: 'LIVE', note: 'Append-only; readable by auditors.' },
  { key: 'calendar', label: 'Election calendar', status: 'LIVE', note: 'Demonstration timetable, marked as unconfirmed.' },
  { key: 'polling-units', label: 'Polling-unit lookup', status: 'LIVE', note: 'Synthetic records only.' },
  { key: 'broadcast', label: 'TV broadcast graphics', status: 'LIVE', note: 'OBS-friendly 1920×1080 scoreboard.' },
  { key: 'i18n', label: 'Hausa, Yoruba, Igbo, Pidgin', status: 'IN_REVIEW', note: 'Drafted but disabled until native speakers review.' },
  { key: 'mobile', label: 'Flutter mobile app', status: 'IN_REVIEW', note: 'Source complete; needs an SDK build before release.' },
  { key: 'identity', label: 'Demo identity verification', status: 'PLANNED', note: 'Will never store biometrics; synthetic documents only.' },
  { key: 'notifications', label: 'Email and SMS delivery', status: 'PLANNED', note: 'Provider keys are not configured; in-app examples only.' },
];

@ApiTags('meta')
@Controller('meta')
export class MetaController {
  @Get()
  meta(): {
    name: string;
    version: string;
    build: string;
    classification: typeof DATA_CLASSIFICATION;
    notice: string;
    realVotingEnabled: false;
    inecResultsIntegrationEnabled: false;
    locales: typeof LOCALES;
    features: FeatureStatus[];
  } {
    return {
      name: '9ja Vote API',
      version: process.env.APP_VERSION ?? '0.2.0',
      build: process.env.GIT_SHA ?? 'local',
      classification: DATA_CLASSIFICATION,
      notice: DEMO_NOTICE,
      realVotingEnabled: false,
      inecResultsIntegrationEnabled: false,
      locales: LOCALES,
      features: FEATURES,
    };
  }
}
