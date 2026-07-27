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

  // If the path already starts with /beacon, redirect to strip it
  // e.g. beacontrack.app/beacon/story → beacontrack.app/story
  if (url.pathname.startsWith('/beacon')) {
    const stripped = url.pathname === '/beacon'
      ? '/'
      : url.pathname.slice('/beacon'.length);
    url.pathname = stripped || '/';
    return NextResponse.redirect(url);
  }

  // Rewrite clean paths to the /beacon equivalents
  url.pathname = url.pathname === '/' ? '/beacon' : `/beacon${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next|images|fonts|icons|favicon.ico|robots.txt|sitemap.xml|beacon-privacy-full.html).*)'],
};
