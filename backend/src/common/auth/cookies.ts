import type { Response } from 'express';

/**
 * JWT transport for the browser.
 *
 * The access token is delivered in an `HttpOnly` cookie instead of
 * localStorage so it is never readable from JavaScript (XSS cannot steal it).
 * The cookie is `SameSite=Lax` because the frontend and API on Vercel share a
 * single origin, and in local development both run on `localhost` (same-site)
 * even though they are cross-origin. `Secure` is only added in production,
 * where the API is always served over HTTPS.
 */
export const AUTH_COOKIE_NAME = 'velora_token';

const COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

const parseCookies = (header?: string): Record<string, string> => {
    const cookies: Record<string, string> = {};

    for (const part of (header ?? '').split(';')) {
        const separator = part.indexOf('=');
        if (separator === -1) {
            continue;
        }

        const name = part.slice(0, separator).trim();
        const value = part.slice(separator + 1).trim();

        if (!name) {
            continue;
        }

        try {
            cookies[name] = decodeURIComponent(value);
        } catch {
            cookies[name] = value;
        }
    }

    return cookies;
};

export const getAuthTokenFromRequest = (request: {
    headers: { cookie?: string };
}): string | undefined =>
    parseCookies(request.headers.cookie)[AUTH_COOKIE_NAME];

export const setAuthCookie = (response: Response, token: string): void => {
    const encoded = encodeURIComponent(token);
    const secure = process.env.NODE_ENV === 'production';

    response.append(
        'Set-Cookie',
        `${AUTH_COOKIE_NAME}=${encoded}; HttpOnly; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure ? '; Secure' : ''}`,
    );
};

export const clearAuthCookie = (response: Response): void => {
    const secure = process.env.NODE_ENV === 'production';

    response.append(
        'Set-Cookie',
        `${AUTH_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secure ? '; Secure' : ''}`,
    );
};
