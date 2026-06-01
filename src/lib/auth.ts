export const AUTH_COOKIE = 'rental_auth';
const SESSION_VALUE = 'authenticated';

export function isAuthEnabled(): boolean {
  return Boolean(process.env.AUTH_PASSWORD?.trim());
}

export function verifyPassword(password: string): boolean {
  if (!isAuthEnabled()) return true;
  return password === process.env.AUTH_PASSWORD;
}

export function sessionCookieValue(): string {
  return SESSION_VALUE;
}

export function isValidSession(session: string | undefined): boolean {
  if (!isAuthEnabled()) return true;
  return session === SESSION_VALUE;
}
