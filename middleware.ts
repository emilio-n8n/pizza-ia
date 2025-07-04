import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options) {
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options) {
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Define paths that should be public or handled separately
  const publicPaths = ['/auth/login', '/auth/signup', '/api/retell-webhook'];
  const onboardingPath = '/onboarding/pizzeria-details';

  // If user is not logged in and trying to access a protected route, redirect to login
  if (!user && !publicPaths.includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // If user is logged in, check if pizzeria details are filled
  if (user) {
    const { data: pizzeria, error } = await supabase
      .from('pizzerias')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // If no pizzeria details and not already on onboarding page, redirect to onboarding
    if (!pizzeria && req.nextUrl.pathname !== onboardingPath) {
      // Allow API routes to be accessed without redirection, except for the update-agent-prompt route
      if (req.nextUrl.pathname.startsWith('/api/') && req.nextUrl.pathname !== '/api/update-agent-prompt') {
        return res; // Allow API calls to proceed
      }
      return NextResponse.redirect(new URL(onboardingPath, req.url));
    }

    // If pizzeria details exist and user is on onboarding page, redirect to dashboard
    if (pizzeria && req.nextUrl.pathname === onboardingPath) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (e.g. /vercel.svg)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*) ',
  ],
};