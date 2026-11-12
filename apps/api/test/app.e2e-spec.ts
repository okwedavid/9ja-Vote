import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/common/configure-app';

describe('API (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });
  afterAll(() => app.close());

  it('GET /api/v1/health reports demonstration mode with real voting disabled', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health').expect(200);
    expect(res.body).toMatchObject({ status: 'ok', mode: 'DEMONSTRATION', realVotingEnabled: false });
    expect(res.headers['x-data-classification']).toBe('DEMONSTRATION');
  });

  it('GET /api/v1/results/national returns labelled synthetic results', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/results/national').expect(200);
    expect(res.body.summary.declaredWinner).toBeNull();
    expect(res.body.states).toHaveLength(37);
  });

  it('exposes no write or voting endpoints', async () => {
    await request(app.getHttpServer()).post('/api/v1/results/national').expect(404);
    await request(app.getHttpServer()).post('/api/v1/votes').expect(404);
  });

  it('returns 404 for an unknown state', async () => {
    await request(app.getHttpServer()).get('/api/v1/results/states/zz').expect(404);
  });
});
