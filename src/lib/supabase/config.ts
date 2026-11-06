// Supabase Auth settings, shared by the browser, server and proxy clients.
// The publishable ("anon") key is safe in the browser: Supabase Auth only
// ever hands a session to someone who knows the account's password.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const supabaseConfigured = () => SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
