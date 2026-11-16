import { Shell } from '../../components/Shell';
import { MfaPanel, PasswordForm } from '../../components/MfaPanel';
import { requireSession } from '../../lib/session';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const { account } = await requireSession();
  return (
    <Shell account={account} current="/settings">
      <div>
        <p className="eyebrow" style={{ margin: 0 }}>Security settings</p>
        <h1 style={{ margin: '0.2rem 0 0' }}>Your account</h1>
        <p className="muted-sm" style={{ margin: '0.3rem 0 0' }}>
          Two-factor authentication uses any standard TOTP app. Enable it before this leaves demonstration mode.
        </p>
      </div>

      <div className="card">
        <p className="eyebrow">Session</p>
        <dl className="kv">
          <dt>Name</dt>
          <dd>{account.displayName}</dd>
          <dt>Email</dt>
          <dd>{account.email}</dd>
          <dt>Role</dt>
          <dd>{account.role.replaceAll('_', ' ').toLowerCase()}</dd>
          <dt>Last sign-in</dt>
          <dd>
            {account.lastLoginAt
              ? new Date(account.lastLoginAt).toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })
              : 'this is your first sign-in'}
          </dd>
          <dt>Session lifetime</dt>
          <dd>30 minutes; sign-out revokes the token immediately</dd>
        </dl>
      </div>

      <div className="card">
        <p className="eyebrow">Two-factor authentication</p>
        <MfaPanel enabled={account.mfaEnabled} />
      </div>

      <div className="card">
        <p className="eyebrow">Password</p>
        <PasswordForm />
      </div>

      <div className="card">
        <p className="eyebrow">What this session can never do</p>
        <ul className="muted-sm" style={{ margin: 0, paddingLeft: '1.2rem' }}>
          <li>See how any individual voted — that data does not exist in the schema.</li>
          <li>Declare a winner, or alter a published figure without a new audited version.</li>
          <li>Create an account with a default or shared password.</li>
        </ul>
      </div>
    </Shell>
  );
}
