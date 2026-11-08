// Username + password sign-in. Supabase Auth needs an email for a password
// account, so a username is stored as `<username>@users.stockstreak.in`, an
// address that is never emailed (Confirm email is off in Supabase, and
// reminders skip it). Shared by the browser and the server.

export const USERNAME_DOMAIN = "users.stockstreak.in";
export const USERNAME_RE = /^[a-z0-9_.]{3,20}$/;
export const MIN_PASSWORD = 8;

export const normaliseUsername = (raw: string) => raw.trim().toLowerCase();

/** The login address Supabase stores for a username. */
export const usernameToEmail = (username: string) => `${normaliseUsername(username)}@${USERNAME_DOMAIN}`;

/** The username behind a login address, or null for a real email address. */
export function usernameFromEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const [local, domain] = email.toLowerCase().split("@");
  return domain === USERNAME_DOMAIN ? local : null;
}
