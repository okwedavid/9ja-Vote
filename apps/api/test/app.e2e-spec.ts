import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { configureApp } from '../src/common/configure-app';
import { DataStore } from '../src/common/data-store';

const dir = mkdtempSync(join(tmpdir(), '9ja-e2e-'));
process.env.DATA_STORE_PATH = join(dir, 'store.json');
process.env.JWT_ACCESS_SECRET = 'test-access-secret-that-is-long-enough-1234';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-that-is-long-enough-1234';

describe('API (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    const auth = moduleRef.get(AuthService);
    auth.createAccount({
      email: 'super@example.org',
      displayName: 'Super Admin',
      role: 'SUPER_ADMINISTRATOR',
      password: 'Integration-Password-9',
    });
  });

  afterAll(async () => {
    await app.close();
    rmSync(dir, { recursive: true, force: true });
  });

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

  it('exposes no voting endpoints and no unauthenticated writes', async () => {
    await request(app.getHttpServer()).post('/api/v1/votes').expect(404);
    await request(app.getHttpServer()).post('/api/v1/results/states/LA/transition').send({ to: 'DISPUTED' }).expect(401);
  });

  it('returns 404 for an unknown state', async () => {
    await request(app.getHttpServer()).get('/api/v1/results/states/zz').expect(404);
  });

  it('serves meta, content, calendar and polling-unit data', async () => {
    const meta = await request(app.getHttpServer()).get('/api/v1/meta').expect(200);
    expect(meta.body.realVotingEnabled).toBe(false);
    expect(meta.body.features.length).toBeGreaterThan(5);

    const calendar = await request(app.getHttpServer()).get('/api/v1/elections').expect(200);
    expect(calendar.body.calendar.length).toBeGreaterThan(3);

    const education = await request(app.getHttpServer()).get('/api/v1/content/education').expect(200);
    expect(education.body.items[0].slug).toBeTruthy();

    const units = await request(app.getHttpServer()).get('/api/v1/polling-units?state=LA').expect(200);
    expect(units.body.items.length).toBeGreaterThan(0);
    expect(units.body.items[0].dataSource).toBe('SYNTHETIC_DEMO');
  });

  it('drills down to LGAs', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/results/states/LA/lgas').expect(200);
    expect(res.body).toHaveLength(3);
  });

  it('signs an administrator in and enforces separation of duties', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'super@example.org', password: 'Integration-Password-9' })
      .expect(200);
    const token = login.body.accessToken as string;
    expect(login.body.account.role).toBe('SUPER_ADMINISTRATOR');

    await request(app.getHttpServer()).get('/api/v1/admin/accounts').set('Authorization', `Bearer ${token}`).expect(200);
    await request(app.getHttpServer()).get('/api/v1/admin/audit').set('Authorization', `Bearer ${token}`).expect(200);

    // A super administrator may manage users and read the audit log, but may not verify results.
    const denied = await request(app.getHttpServer())
      .post('/api/v1/results/states/LA/transition')
      .set('Authorization', `Bearer ${token}`)
      .send({ to: 'DISPUTED' })
      .expect(403);
    expect(denied.body.message).toMatch(/permission/i);
  });

  it('rejects a bad password without revealing whether the account exists', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'super@example.org', password: 'wrong-password-123' })
      .expect(401);
    expect(res.body.message).toBe('Email or password is incorrect');

    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.org', password: 'whatever-password-1' })
      .expect(401);
  });

  it('keeps the data store in a writable location outside the repository', () => {
    expect(moduleStore().path).toBe(process.env.DATA_STORE_PATH);
  });

  function moduleStore(): DataStore {
    return app.get(DataStore);
  }
});
