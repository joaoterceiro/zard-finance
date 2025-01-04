'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import type { Database } from '@/types/supabase'

type Transaction = Database['public']['Tables']['transactions']['Row']

type Props = {
  transactions: Transaction[]
}

export function CashflowChart({ transactions }: Props) {
  const data = transactions.reduce((acc: any[], transaction) => {
    const date = new Date(transaction.date).getDate()
    const existingDay = acc.find(item => item.day === date)

    if (existingDay) {
      if (transaction.type === 'income') {
        existingDay.income += transaction.amount
      } else {
        existingDay.expense += transaction.amount
      }
      existingDay.balance = existingDay.income - existingDay.expense
    } else {
      acc.push({
        day: date,
        income: transaction.type === 'income' ? transaction.amount : 0,
        expense: transaction.type === 'expense' ? transaction.amount : 0,
        balance: transaction.type === 'income' ? transaction.amount : -transaction.amount
      })
    }

    return acc.sort((a, b) => a.day - b.day)
  }, [])

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip
          formatter={(value: number) => `R$ ${value.toFixed(2)}`}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="income"
          stroke="#22c55e"
          name="Receitas"
        />
        <Line
          type="monotone"
          dataKey="expense"
          stroke="#ef4444"
          name="Despesas"
        />
        <Line
          type="monotone"
          dataKey="balance"
          stroke="#3b82f6"
          name="Saldo"
        />
      </LineChart>
    </ResponsiveContainer>
  )
} 