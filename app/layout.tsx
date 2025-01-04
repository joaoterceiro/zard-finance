import './globals.css'
import { Inter } from 'next/font/google'
import { ToastProvider } from '@/contexts/ToastContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Zard Finance',
  description: 'Sistema de Gestão Financeira',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ToastProvider>
          <main className="min-h-screen bg-white">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  )
} 