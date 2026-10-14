import { NextRequest, NextResponse } from 'next/server';
import {
  MAIN_HOST,
  TRANSPORT_ALIAS_HOSTS,
  TRANSPORT_EXTRA_PATHS,
  TRANSPORT_HOST,
  TRANSPORT_PAGES,
  TRANSPORT_URL,
} from './lib/transport_domains';

const BEACON_HOSTS = ['beacontrack.app', 'www.beacontrack.app'];
const STATIC_FILES = ['/robots.txt', '/sitemap.xml'];

function transportSite(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();

  const page = Object.values(TRANSPORT_PAGES).find((p) => p.publicPath === pathname);
  if (page) {
    url.pathname = page.path;
    return NextResponse.rewrite(url);
  }

  // Internal page routes have a public URL here; avoid serving duplicates.
  const internal = Object.values(TRANSPORT_PAGES).find((p) => p.path === pathname);
  if (internal) {
    return NextResponse.redirect(`${TRANSPORT_URL}${internal.publicPath}`, 301);
  }

  if (pathname === '/robots.txt' || pathname === '/sitemap.xml') {
    url.pathname = pathname === '/robots.txt' ? '/api/transport_robots' : '/api/transport_sitemap';
    return NextResponse.rewrite(url);
  }

  if (
    TRANSPORT_EXTRA_PATHS.includes(pathname) ||
    pathname.startsWith('/_vercel/') ||
    /^\/google[0-9a-f]+\.html$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  return NextResponse.redirect(`https://${MAIN_HOST}${pathname}${request.nextUrl.search}`, 301);
}

function beaconSite(request: NextRequest) {
  const url = request.nextUrl.clone();

  if (STATIC_FILES.includes(url.pathname)) {
    return NextResponse.next();
  }

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

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')?.split(':')[0] ?? '';
  const host = hostname.replace(/^www\./, '');
  const { pathname } = request.nextUrl;

  if (host === TRANSPORT_HOST) {
    if (hostname !== host) {
      return NextResponse.redirect(`${TRANSPORT_URL}${pathname}${request.nextUrl.search}`, 301);
    }
    return transportSite(request);
  }

  if (TRANSPORT_ALIAS_HOSTS.includes(host)) {
    const target = TRANSPORT_EXTRA_PATHS.includes(pathname) ? pathname : TRANSPORT_PAGES.en.publicPath;
    return NextResponse.redirect(`${TRANSPORT_URL}${target}${request.nextUrl.search}`, 301);
  }

  if (host === MAIN_HOST) {
    const page = Object.values(TRANSPORT_PAGES).find((p) => p.path === pathname);
    if (page) {
      return NextResponse.redirect(`${TRANSPORT_URL}${page.publicPath}`, 301);
    }
    return NextResponse.next();
  }

  if (BEACON_HOSTS.includes(hostname)) {
    return beaconSite(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|images|fonts|icons|favicon.ico|beacon-privacy-full.html).*)'],
};
