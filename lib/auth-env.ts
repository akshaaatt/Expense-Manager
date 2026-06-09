// Exposes public auth-related env vars to the client.
// NEXT_PUBLIC_ prefix is required for any env var to be available in the browser.

export const googleClientId: string | undefined =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
