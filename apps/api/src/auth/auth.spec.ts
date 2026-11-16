import { checkPasswordPolicy, hashPassword, verifyPassword } from './password';
import { generateTotp, generateTotpSecret, otpauthUrl, verifyTotp } from './totp';
import { issueToken, verifyToken } from './token';

describe('password hashing', () => {
  it('verifies the right password and rejects the wrong one', () => {
    const stored = hashPassword('Correct-Horse-9');
    expect(stored).toMatch(/^scrypt:/);
    expect(JSON.stringify(stored)).not.toContain('Correct-Horse-9');
    expect(verifyPassword('Correct-Horse-9', stored)).toBe(true);
    expect(verifyPassword('correct-horse-9', stored)).toBe(false);
  });

  it('applies an explainable policy', () => {
    expect(checkPasswordPolicy('short1').ok).toBe(false);
    expect(checkPasswordPolicy('password123456').ok).toBe(false);
    expect(checkPasswordPolicy('LongEnough-Pass9').ok).toBe(true);
  });
});

describe('TOTP', () => {
  it('accepts the current code and rejects a wrong one', () => {
    const secret = generateTotpSecret();
    const code = generateTotp(secret);
    expect(code).toMatch(/^\d{6}$/);
    expect(verifyTotp(secret, code)).toBe(true);
    expect(verifyTotp(secret, '000000')).toBe(false);
    expect(verifyTotp(secret, 'not-a-code')).toBe(false);
  });

  it('builds an otpauth URL an authenticator app can read', () => {
    const url = otpauthUrl('JBSWY3DPEHPK3PXP', 'admin@example.org');
    expect(url.startsWith('otpauth://totp/')).toBe(true);
    expect(url).toContain('secret=JBSWY3DPEHPK3PXP');
  });
});

describe('tokens', () => {
  it('signs and verifies access tokens, and rejects mismatched types', () => {
    const { token } = issueToken({ accountId: 'a1', email: 'a@example.org', role: 'READ_ONLY_AUDITOR', type: 'access' });
    const claims = verifyToken(token, 'access');
    expect(claims?.sub).toBe('a1');
    expect(verifyToken(token, 'refresh')).toBeNull();
    expect(verifyToken(`${token}tampered`, 'access')).toBeNull();
  });
});
