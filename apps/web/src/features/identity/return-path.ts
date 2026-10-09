/** Where people land after signing in when no safe return path was given. */
export const DEFAULT_RETURN_PATH = '/';

/**
 * Only same-origin paths are allowed as a return destination, so a crafted sign-in link can
 * never send someone to another site after they authenticate (open redirect).
 */
export function safeReturnPath(requestedPath: string | null): string {
  if (requestedPath === null || !requestedPath.startsWith('/')) {
    return DEFAULT_RETURN_PATH;
  }
  // "//host" and "/\host" are treated by browsers as another origin.
  if (requestedPath.startsWith('//') || requestedPath.startsWith('/\\')) {
    return DEFAULT_RETURN_PATH;
  }
  return requestedPath;
}

/** The identity provider entry point, configured per environment once open question Q5 is settled. */
export function signInUrlFor(returnPath: string): string | null {
  const configuredUrl = process.env.NEXT_PUBLIC_RELYXUS_SIGN_IN_URL;
  if (configuredUrl === undefined || configuredUrl === '') {
    return null;
  }
  const signInUrl = new URL(configuredUrl, 'http://placeholder.invalid');
  signInUrl.searchParams.set('returnTo', returnPath);
  return configuredUrl.startsWith('/')
    ? `${signInUrl.pathname}${signInUrl.search}`
    : signInUrl.toString();
}
