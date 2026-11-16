import { Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  FAQ,
  GLOSSARY,
  LOCALES,
  NotificationItem,
  SOURCE_REGISTER,
  VOTER_EDUCATION,
  VoterEducationArticle,
} from '@9ja-vote/shared-types';
import { DataStore } from '../common/data-store';

const NOTICE = 'Civic information only. Not legal advice and not an official INEC publication.';

@ApiTags('content')
@Controller('content')
export class ContentController {
  @Get('education')
  education(): { notice: string; items: VoterEducationArticle[] } {
    return { notice: NOTICE, items: VOTER_EDUCATION };
  }

  @Get('education/:slug')
  article(@Param('slug') slug: string): VoterEducationArticle {
    const found = VOTER_EDUCATION.find((a) => a.slug === slug);
    if (!found) throw new NotFoundException(`Unknown article: ${slug}`);
    return found;
  }

  @Get('faq')
  faq(): { notice: string; items: typeof FAQ } {
    return { notice: NOTICE, items: FAQ };
  }

  @Get('glossary')
  glossary(): { notice: string; items: typeof GLOSSARY } {
    return { notice: NOTICE, items: GLOSSARY };
  }

  @Get('locales')
  locales(): { defaultLocale: string; items: typeof LOCALES } {
    return { defaultLocale: 'en', items: LOCALES };
  }

  @Get('sources')
  sources(): { notice: string; items: typeof SOURCE_REGISTER } {
    return {
      notice: 'Every published figure must be traceable to one of these sources. Synthetic data is labelled as such.',
      items: SOURCE_REGISTER,
    };
  }
}

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly store: DataStore) {}

  @Get()
  list(): { notice: string; unread: number; items: NotificationItem[] } {
    const items = this.store.notifications();
    return {
      notice: 'Demonstration notifications. No SMS or email is sent by this instance.',
      unread: items.filter((n) => !n.read).length,
      items,
    };
  }

  @Post(':id/read')
  markRead(@Param('id') id: string): NotificationItem {
    const updated = this.store.markNotificationRead(id);
    if (!updated) throw new NotFoundException(`Unknown notification: ${id}`);
    return updated;
  }
}
