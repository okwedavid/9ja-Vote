/**
 * Creates the first administrator account.
 *
 * No default credentials exist anywhere in this repository. This script either
 * takes a password from SEED_ADMIN_PASSWORD or generates a strong random one and
 * prints it exactly once. Run it again with --list to see which accounts exist.
 */
import { randomBytes } from 'node:crypto';
import { ADMIN_ROLES, AdminRole } from '@9ja-vote/shared-types';
import { AuthService } from '../auth/auth.service';
import { checkPasswordPolicy } from '../auth/password';
import { DataStore } from '../common/data-store';

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function strongPassword(): string {
  for (;;) {
    const candidate = randomBytes(18).toString('base64url');
    if (checkPasswordPolicy(candidate).ok) return candidate;
  }
}

function main(): void {
  const store = new DataStore();
  const auth = new AuthService(store);

  if (process.argv.includes('--list')) {
    const accounts = store.accounts();
    if (accounts.length === 0) {
      console.log('No administrator accounts exist yet. Create one with: npm run seed:admin -- --email you@example.org');
      return;
    }
    console.table(accounts.map((a) => ({ email: a.email, role: a.role, status: a.status, mfa: a.mfaEnabled })));
    console.log(`Store: ${store.path}`);
    return;
  }

  const email = arg('email');
  const role = (arg('role') ?? 'SUPER_ADMINISTRATOR').toUpperCase() as AdminRole;

  if (!email) {
    console.error('Usage: npm run seed:admin -- --email you@example.org [--name "Your Name"] [--role SUPER_ADMINISTRATOR]');
    console.error(`Roles: ${ADMIN_ROLES.join(', ')}`);
    process.exitCode = 1;
    return;
  }
  if (!ADMIN_ROLES.includes(role)) {
    console.error(`Unknown role "${role}". Choose one of: ${ADMIN_ROLES.join(', ')}`);
    process.exitCode = 1;
    return;
  }
  if (store.accountByEmail(email)) {
    console.error(`An account already exists for ${email}. Nothing was changed.`);
    process.exitCode = 1;
    return;
  }

  const provided = process.env.SEED_ADMIN_PASSWORD;
  const password = provided ?? strongPassword();
  const policy = checkPasswordPolicy(password);
  if (!policy.ok) {
    console.error('Password does not meet policy:', policy.problems.join(' '));
    process.exitCode = 1;
    return;
  }

  const account = auth.createAccount({
    email,
    displayName: arg('name') ?? email.split('@')[0] ?? 'Administrator',
    role,
    password,
  });

  console.log('');
  console.log('  Administrator created');
  console.log(`  Email:    ${account.email}`);
  console.log(`  Role:     ${account.role}`);
  if (!provided) {
    console.log(`  Password: ${password}`);
    console.log('');
    console.log('  This password is shown once and is not stored in the repository.');
    console.log('  Put it in a password manager, sign in, then enable two-factor authentication.');
  }
  console.log(`  Store:    ${store.path}`);
  console.log('');
}

main();
