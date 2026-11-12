import { INestApplication } from '@nestjs/common';

/** Settings shared by the real server and the integration tests. */
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api/v1');
}
