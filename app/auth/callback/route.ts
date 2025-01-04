import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'
import { AuthError } from '@supabase/supabase-js'

// Força a rota a ser dinâmica
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)

  try {
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') ?? '/dashboard'

    if (!code) {
      console.warn('Código de autenticação não fornecido')
      return NextResponse.redirect(new URL('/login', requestUrl.origin))
    }

    // Criando o cliente Supabase com cookies do Next.js
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    try {
      // Troca o código pela sessão
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        console.error('Erro na troca do código por sessão:', error.message)
        throw error
      }
    } catch (error) {
      if (error instanceof AuthError) {
        console.error('Erro ao processar autenticação:', error.message)
      } else {
        console.error('Erro desconhecido:', error)
      }
      return NextResponse.redirect(
        new URL(`/login?error=Falha na autenticação`, requestUrl.origin)
      )
    }

    // Redireciona para a página solicitada ou dashboard por padrão
    return NextResponse.redirect(new URL(next, requestUrl.origin))
  } catch (error) {
    if (error instanceof AuthError) {
      console.error('Erro inesperado no callback:', error.message)
    } else {
      console.error('Erro desconhecido:', error)
    }
    return NextResponse.redirect(
      new URL('/login?error=Erro inesperado', requestUrl.origin)
    )
  }
} 