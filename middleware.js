// middleware.js — site-wide Basic Auth

export const config = { matcher: ['/(.*)'] };

function unauthorized() {
  return new Response('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Protected"' },
  });
}

export default function middleware(req) {
  const { pathname } = new URL(req.url);

  // let Vercel internals through
  if (pathname.startsWith('/_vercel')) return;

  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Basic ')) return unauthorized();

  const b64 = auth.split(' ')[1];
  // atob is available in the Edge runtime used by middleware
  const [user, pass] = atob(b64).split(':');

  if (
    user === process.env.BASIC_AUTH_USER &&
    pass === process.env.BASIC_AUTH_PASS
  ) {
    return; // allow request through
  }
  return unauthorized();
}
