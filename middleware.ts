import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')?.split(':')[0];

  if (
    hostname !== 'beacontrack.app' &&
    hostname !== 'www.beacontrack.app'
  ) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();

  if (!url.pathname.startsWith('/beacon')) {
    url.pathname =
      url.pathname === '/'
        ? '/beacon'
        : `/beacon${url.pathname}`;

    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|images|fonts|icons|favicon.ico|robots.txt|sitemap.xml).*)'],
};
