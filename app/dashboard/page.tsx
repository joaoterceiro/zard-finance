'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Header from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from '@/contexts/ToastContext'
import type { Database } from '@/types/supabase'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Trash2 } from "lucide-react"

type Transaction = Database['public']['Tables']['transactions']['Row']

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const supabase = createClientComponentClient<Database>()
  const { showToast } = useToast()

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
        showToast('Erro', 'Não foi possível carregar as transações', 'error')
      }
    }

    fetchTransactions()
  }, [supabase])

  // Resumo financeiro
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0)

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0)

  const balance = totalIncome - totalExpense

  // Filtrando transações
  const filteredTransactions = transactions.filter(transaction => {
    const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter
    return matchesCategory && matchesType
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-[1216px] py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Dashboard</h1>

        {/* Resumo das Transações */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Total de Receitas</CardTitle>
            </CardHeader>
            <CardContent>
              <h2 className="text-2xl font-bold text-green-600">R$ {totalIncome.toFixed(2)}</h2>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total de Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <h2 className="text-2xl font-bold text-red-600">R$ {totalExpense.toFixed(2)}</h2>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <h2 className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {balance.toFixed(2)}
              </h2>
            </CardContent>
          </Card>
        </div>

        {/* Filtros para Receitas e Despesas Recentes */}
        <div className="mb-4 flex gap-4">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="income">Receitas</SelectItem>
              <SelectItem value="expense">Despesas</SelectItem>
              {/* Adicione mais categorias conforme necessário */}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="income">Receitas</SelectItem>
              <SelectItem value="expense">Despesas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Receitas e Despesas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <p className="text-center py-4 text-gray-500">Nenhuma transação encontrada</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.category}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        R$ {transaction.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button variant="ghost" onClick={() => {/* Editar lógica */}}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" onClick={() => {/* Deletar lógica */}}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 