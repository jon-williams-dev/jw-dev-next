import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')?.split(':')[0];
  const url = request.nextUrl.clone();

  if (
    hostname === 'beacontrack.app' ||
    hostname === 'www.beacontrack.app'
  ) {
    if (url.pathname === '/') {
      url.pathname = '/beacon';
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
