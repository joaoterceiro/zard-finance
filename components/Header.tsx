'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Transações', href: '/transactions' },
  { name: 'Metas', href: '/goals' },
  { name: 'Fluxo de Caixa', href: '/cashflow' },
  { name: 'Análise', href: '/analysis' },
]

export default function Header() {
  const [mounted, setMounted] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUserEmail(session?.user?.email ?? null)
    }
    
    setMounted(true)
    getUser()
  }, [supabase])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  if (!mounted) return null

  return (
    <header className="border-b">
      <div className="container max-w-[1216px] flex h-16 items-center justify-between">
        <div className="flex gap-6 md:gap-10">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Zard Finance</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-8 w-8 rounded-full"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {userEmail?.charAt(0).toUpperCase() ?? 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuItem className="flex-col items-start">
              <div className="text-xs text-muted-foreground">
                Logado como
              </div>
              <div className="text-sm font-medium truncate">
                {userEmail}
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link 
                href="/settings"
                className={cn(
                  pathname === '/settings' && "bg-accent"
                )}
              >
                Configurações
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 cursor-pointer"
              onClick={handleLogout}
            >
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
} 