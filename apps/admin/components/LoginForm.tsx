/** Plain HTML form: no client JavaScript needed to sign in. Errors come back in ?error=. */
export function LoginForm({ error }: { error?: string }) {
  return (
    <form action="/api/session" method="post" style={{ display: 'grid', gap: '0.9rem' }}>
      <label className="field">
        <span>Email</span>
        <input name="email" type="email" autoComplete="username" required placeholder="you@example.org" />
      </label>
      <label className="field">
        <span>Password</span>
        <input name="password" type="password" autoComplete="current-password" required minLength={8} />
      </label>
      <label className="field">
        <span>Authenticator code (only if you enabled MFA)</span>
        <input name="totp" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="123456" />
      </label>
      {error ? (
        <p className="banner error" role="alert">
          {error}
        </p>
      ) : null}
      <button className="btn-sm" type="submit">
        Sign in
      </button>
      <p className="muted-sm">
        Accounts are created by a super administrator or by the seed script. There are no default credentials in this
        repository.
      </p>
    </form>
  );
}
