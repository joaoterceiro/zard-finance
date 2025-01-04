'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Header from '@/components/Header'
import { FinancialReport } from '@/components/FinancialReport'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Database } from '@/types/supabase'

type Transaction = Database['public']['Tables']['transactions']['Row']

export default function Analysis() {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', session.user.id)
          .order('date', { ascending: false })

        if (error) throw error
        setTransactions(data || [])
      } catch (error) {
        console.error('Erro ao carregar transações:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [supabase])

  const calculateMetrics = () => {
    const now = new Date()
    const thisMonth = transactions.filter(t => {
      const date = new Date(t.date)
      return date.getMonth() === now.getMonth() && 
             date.getFullYear() === now.getFullYear()
    })

    const monthlyIncome = thisMonth.reduce((acc, t) => 
      t.type === 'income' ? acc + t.amount : acc, 0
    )
    const monthlyExpense = thisMonth.reduce((acc, t) => 
      t.type === 'expense' ? acc + t.amount : acc, 0
    )
    const savingsRate = monthlyIncome > 0 
      ? ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100 
      : 0

    return {
      monthlyIncome,
      monthlyExpense,
      savingsRate,
      expenseByIncome: monthlyIncome > 0 
        ? (monthlyExpense / monthlyIncome) * 100 
        : 0
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container max-w-[1216px] py-8">
          <div className="flex justify-center items-center h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </div>
      </div>
    )
  }

  const metrics = calculateMetrics()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-[1216px] py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Análise Financeira</h1>

        <div className="grid gap-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Taxa de Economia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.savingsRate.toFixed(1)}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Despesas/Receitas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.expenseByIncome.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>

          <FinancialReport transactions={transactions} />
        </div>
      </div>
    </div>
  )
} 