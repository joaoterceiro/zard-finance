'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import type { Database } from '@/types/supabase'
import { cn } from "@/lib/utils"

type Transaction = Database['public']['Tables']['transactions']['Row']

interface FinancialReportProps {
  transactions: Transaction[]
}

export function FinancialReport({ transactions }: FinancialReportProps) {
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const generateReport = () => {
    const report = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date)
      const key = period === 'monthly' 
        ? `${date.getFullYear()}-${date.getMonth() + 1}`
        : `${date.getFullYear()}`

      if (!acc[key]) {
        acc[key] = {
          income: 0,
          expense: 0,
          balance: 0,
          categories: {}
        }
      }

      if (transaction.type === 'income') {
        acc[key].income += transaction.amount
      } else {
        acc[key].expense += transaction.amount
      }

      acc[key].balance = acc[key].income - acc[key].expense

      // Categorias
      if (!acc[key].categories[transaction.category]) {
        acc[key].categories[transaction.category] = 0
      }
      acc[key].categories[transaction.category] += transaction.amount

      return acc
    }, {} as Record<string, any>)

    return Object.entries(report)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 12)
  }

  const exportToCSV = () => {
    const report = generateReport()
    const headers = ['Período', 'Receitas', 'Despesas', 'Saldo']
    const rows = report.map(([period, data]) => [
      period,
      data.income.toFixed(2),
      data.expense.toFixed(2),
      data.balance.toFixed(2)
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Relatório Financeiro</CardTitle>
        <div className="flex items-center gap-4">
          <Select
            value={period}
            onValueChange={(value: 'monthly' | 'yearly') => setPeriod(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="yearly">Anual</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={exportToCSV}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {generateReport().map(([period, data]) => (
            <div key={period} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">{period}</h3>
                <span className={cn(
                  "font-bold",
                  data.balance >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  R$ {data.balance.toFixed(2)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Receitas</p>
                  <p className="text-green-600">R$ {data.income.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Despesas</p>
                  <p className="text-red-600">R$ {data.expense.toFixed(2)}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Top Categorias</p>
                <ul className="space-y-1">
                  {Object.entries(data.categories)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .slice(0, 3)
                    .map(([category, amount]) => (
                      <li key={category} className="flex justify-between text-sm">
                        <span>{category}</span>
                        <span>R$ {(amount as number).toFixed(2)}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 