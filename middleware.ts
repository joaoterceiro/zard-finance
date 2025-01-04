import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Rotas que requerem autenticação
    const protectedRoutes = ['/dashboard', '/transactions', '/goals', '/cashflow', '/settings']
    const isProtectedRoute = protectedRoutes.some(route =>
      req.nextUrl.pathname.startsWith(route)
    )

    if (isProtectedRoute && !session) {
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Redireciona usuários logados tentando acessar páginas de auth
    const authRoutes = ['/login', '/register', '/forgot-password']
    const isAuthRoute = authRoutes.some(route =>
      req.nextUrl.pathname.startsWith(route)
    )

    if (isAuthRoute && session) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return res
  } catch (error) {
    console.error('Erro no middleware:', error)
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 