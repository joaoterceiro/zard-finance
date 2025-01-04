'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import type { Database } from '@/types/supabase'

type Transaction = Database['public']['Tables']['transactions']['Row']

type Props = {
  transactions: Transaction[]
  type: 'income' | 'expense'
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
  '#8884D8', '#82CA9D', '#FDB462', '#B3DE69'
]

export function CashflowPieChart({ transactions, type }: Props) {
  const data = transactions
    .filter(t => t.type === type)
    .reduce((acc: { name: string; value: number }[], transaction) => {
      const existingCategory = acc.find(item => item.name === transaction.category)
      if (existingCategory) {
        existingCategory.value += transaction.amount
      } else {
        acc.push({
          name: transaction.category,
          value: transaction.amount
        })
      }
      return acc
    }, [])
    .sort((a, b) => b.value - a.value)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={({ name, percent }) => 
            `${name} ${(percent * 100).toFixed(0)}%`
          }
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => `R$ ${value.toFixed(2)}`}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
} 