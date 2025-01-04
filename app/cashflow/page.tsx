'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Header from '@/components/Header'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { Database } from '@/types/supabase'
import { CashflowChart } from '@/components/CashflowChart'
import { CashflowPieChart } from '@/components/CashflowPieChart'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Download } from "lucide-react"

type Transaction = Database['public']['Tables']['transactions']['Row']

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export default function Cashflow() {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const supabase = createClientComponentClient<Database>()
  const [previousMonthData, setPreviousMonthData] = useState<{
    income: number;
    expense: number;
    balance: number;
  }>({ income: 0, expense: 0, balance: 0 })

  const fetchTransactions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const startDate = new Date(selectedYear, selectedMonth, 1)
      const endDate = new Date(selectedYear, selectedMonth + 1, 0)

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true })

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error('Erro ao carregar transações:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [selectedYear, selectedMonth, supabase])

  const fetchPreviousMonthData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const previousMonth = selectedMonth === 0 ? 11 : selectedMonth - 1
      const previousYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear
      const startDate = new Date(previousYear, previousMonth, 1)
      const endDate = new Date(previousYear, previousMonth + 1, 0)

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])

      if (error) throw error

      const totals = data?.reduce((acc, transaction) => {
        if (transaction.type === 'income') {
          acc.income += transaction.amount
        } else {
          acc.expense += transaction.amount
        }
        acc.balance = acc.income - acc.expense
        return acc
      }, { income: 0, expense: 0, balance: 0 })

      setPreviousMonthData(totals)
    } catch (error) {
      console.error('Erro ao carregar dados do mês anterior:', error)
    }
  }

  useEffect(() => {
    fetchPreviousMonthData()
  }, [selectedYear, selectedMonth, supabase])

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return null
    return ((current - previous) / previous) * 100
  }

  const handleExportCSV = () => {
    const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']
    const csvData = transactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.description,
      t.category,
      t.type === 'income' ? 'Receita' : 'Despesa',
      t.amount.toFixed(2)
    ])

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `fluxo-de-caixa-${selectedYear}-${selectedMonth + 1}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const calculateTotals = () => {
    return transactions.reduce((acc, transaction) => {
      if (transaction.type === 'income') {
        acc.income += transaction.amount
      } else {
        acc.expense += transaction.amount
      }
      acc.balance = acc.income - acc.expense
      return acc
    }, { income: 0, expense: 0, balance: 0 })
  }

  const { income, expense, balance } = calculateTotals()

  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 5 }, (_, i) => currentYear - i)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container max-w-[1216px] py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Fluxo de Caixa</h1>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableYears().map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) => setSelectedMonth(parseInt(value))}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleExportCSV}
                title="Exportar para CSV"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Receitas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {income.toFixed(2)}
                </div>
                {calculatePercentageChange(income, previousMonthData.income) !== null && (
                  <p className={cn(
                    "text-xs mt-1",
                    income >= previousMonthData.income ? "text-green-600" : "text-red-600"
                  )}>
                    {income >= previousMonthData.income ? "↑" : "↓"}
                    {Math.abs(calculatePercentageChange(income, previousMonthData.income)!).toFixed(1)}%
                    em relação ao mês anterior
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Despesas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  R$ {expense.toFixed(2)}
                </div>
                {calculatePercentageChange(expense, previousMonthData.expense) !== null && (
                  <p className={cn(
                    "text-xs mt-1",
                    expense >= previousMonthData.expense ? "text-green-600" : "text-red-600"
                  )}>
                    {expense >= previousMonthData.expense ? "↑" : "↓"}
                    {Math.abs(calculatePercentageChange(expense, previousMonthData.expense)!).toFixed(1)}%
                    em relação ao mês anterior
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Saldo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn(
                  "text-2xl font-bold",
                  balance >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  R$ {balance.toFixed(2)}
                </div>
                {calculatePercentageChange(balance, previousMonthData.balance) !== null && (
                  <p className={cn(
                    "text-xs mt-1",
                    balance >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {balance >= 0 ? "↑" : "↓"}
                    {Math.abs(calculatePercentageChange(balance, previousMonthData.balance)!).toFixed(1)}%
                    em relação ao mês anterior
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Gráfico de Fluxo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <CashflowChart transactions={transactions} />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Receitas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <CashflowPieChart 
                    transactions={transactions} 
                    type="income"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Despesas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <CashflowPieChart 
                    transactions={transactions} 
                    type="expense"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Transações do Período</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhuma transação encontrada neste período
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {new Date(transaction.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell className={cn(
                          "text-right font-medium",
                          transaction.type === 'income' 
                            ? "text-green-600" 
                            : "text-red-600"
                        )}>
                          {transaction.type === 'income' ? '+' : '-'} 
                          R$ {transaction.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 