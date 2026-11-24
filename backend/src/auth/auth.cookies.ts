import type { CookieOptions, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ACCESS_COOKIE, REFRESH_COOKIE } from './auth.constants';

export function authCookieOptions(
  config: ConfigService,
  maxAgeMs?: number,
): CookieOptions {
  const isProduction = config.get<string>('NODE_ENV') === 'production';
  const secureSetting = config.get<string>('COOKIE_SECURE');
  const secure = secureSetting === 'true' || (isProduction && secureSetting !== 'false');

  return {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    ...(maxAgeMs ? { maxAge: maxAgeMs } : {}),
  };
}

export function setAuthCookies(
  response: Response,
  config: ConfigService,
  tokens: { accessToken: string; refreshToken: string; accessMaxAgeMs: number; refreshMaxAgeMs: number },
) {
  response.cookie(ACCESS_COOKIE, tokens.accessToken, {
    ...authCookieOptions(config, tokens.accessMaxAgeMs),
  });
  response.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    ...authCookieOptions(config, tokens.refreshMaxAgeMs),
  });
}

export function clearAuthCookies(response: Response, config: ConfigService) {
  const options = authCookieOptions(config);
  response.clearCookie(ACCESS_COOKIE, options);
  response.clearCookie(REFRESH_COOKIE, options);
}
