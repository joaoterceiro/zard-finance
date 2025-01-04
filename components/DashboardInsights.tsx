'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Database } from '@/types/supabase'

type Transaction = Database['public']['Tables']['transactions']['Row']

interface DashboardInsightsProps {
  transactions: Transaction[]
}

export function DashboardInsights({ transactions }: DashboardInsightsProps) {
  const getTopCategories = () => {
    const categories = transactions.reduce((acc, transaction) => {
      const category = transaction.category
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category] += transaction.amount
      return acc
    }, {} as Record<string, number>)

    return Object.entries(categories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
  }

  const getDailyAverage = () => {
    const total = transactions.reduce((acc, t) => acc + t.amount, 0)
    const days = new Set(transactions.map(t => t.date.split('T')[0])).size
    return total / (days || 1)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Top Categorias</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {getTopCategories().map(([category, amount]) => (
              <li key={category} className="flex justify-between">
                <span>{category}</span>
                <span>R$ {amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Média Diária</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            R$ {getDailyAverage().toFixed(2)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 