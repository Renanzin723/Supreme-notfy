import Cookies from 'js-cookie';

const COOKIE_NAME = 'supreme-notify-token';
const COOKIE_OPTIONS = {
  expires: 7, // 7 dias
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  httpOnly: false // Para permitir acesso no cliente
};

export function setAuthToken(token: string) {
  Cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
}

export function getAuthToken(): string | undefined {
  return Cookies.get(COOKIE_NAME);
}

export function removeAuthToken() {
  Cookies.remove(COOKIE_NAME);
}

export function getAuthTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  return cookies[COOKIE_NAME] || null;
}
