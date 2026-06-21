import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public files, next static files, and api requests
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return;
  }

  // Check if pathname has a locale
  const pathnameHasLocale = pathname.startsWith('/zh') || pathname.startsWith('/en');

  if (pathnameHasLocale) {
    return;
  }

  // Detect locale
  let locale = 'zh'; // Default is Chinese

  // 1. Check Cookie
  const langCookie = request.cookies.get('lang')?.value;
  if (langCookie === 'zh' || langCookie === 'en') {
    locale = langCookie;
  } else {
    // 2. Check Accept-Language header
    const acceptLanguage = request.headers.get('accept-language');
    if (acceptLanguage) {
      const lower = acceptLanguage.toLowerCase();
      // If English is preferred over Chinese
      const enIndex = lower.indexOf('en');
      const zhIndex = lower.indexOf('zh');
      if (enIndex !== -1 && (zhIndex === -1 || enIndex < zhIndex)) {
        locale = 'en';
      }
    }
  }

  // Redirect to /[locale]
  request.nextUrl.pathname = `/${locale}${pathname}`;
  const response = NextResponse.redirect(request.nextUrl);
  // Set language cookie if not present
  if (!langCookie) {
    response.cookies.set('lang', locale, { path: '/' });
  }
  return response;
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
