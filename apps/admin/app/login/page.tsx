import { redirect } from 'next/navigation';
import { Emblem } from '../../components/Emblem';
import { LoginForm } from '../../components/LoginForm';
import { getSession } from '../../lib/session';

export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getSession()) redirect('/');
  const { error } = await searchParams;
  return (
    <main className="login-wrap">
      <div className="login-card">
        <div className="brand">
          <Emblem size={36} />
          <span>9ja Vote Command Centre</span>
        </div>
        <h1>Sign in</h1>
        <p className="muted-sm" style={{ marginTop: 0 }}>
          Demonstration environment. All figures are synthetic and no real voter data exists here.
        </p>
        <LoginForm error={error} />
      </div>
    </main>
  );
}
