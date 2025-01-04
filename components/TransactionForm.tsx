'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useToast } from '@/contexts/ToastContext'

type TransactionFormProps = {
  onSuccess: () => void
  onCancel: () => void
  transaction?: Database['public']['Tables']['transactions']['Row']
  mode?: 'create' | 'edit'
}

const categories = [
  { value: 'salary', label: 'Salário' },
  { value: 'investment', label: 'Investimento' },
  { value: 'food', label: 'Alimentação' },
  { value: 'transport', label: 'Transporte' },
  { value: 'housing', label: 'Moradia' },
  { value: 'utilities', label: 'Contas' },
  { value: 'entertainment', label: 'Lazer' },
  { value: 'other', label: 'Outros' },
]

export function TransactionForm({ 
  onSuccess, 
  onCancel, 
  transaction, 
  mode = 'create' 
}: TransactionFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient<Database>()
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Usuário não autenticado')
      }

      const transactionData = {
        user_id: session.user.id,
        description: formData.get('description') as string,
        amount: parseFloat(formData.get('amount') as string),
        type: formData.get('type') as 'income' | 'expense',
        category: formData.get('category') as string,
        date: formData.get('date') as string,
      }

      if (mode === 'create') {
        const { error } = await supabase
          .from('transactions')
          .insert(transactionData)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('transactions')
          .update(transactionData)
          .eq('id', transaction?.id)
        if (error) throw error
      }

      form.reset()
      onSuccess()
      showToast(
        mode === 'create' ? 'Transação criada' : 'Transação atualizada',
        mode === 'create' ? 'Transação criada com sucesso' : 'Transação atualizada com sucesso',
        'success'
      )
    } catch (error) {
      console.error('Erro ao salvar transação:', error)
      showToast('Erro', 'Não foi possível salvar a transação', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            name="description"
            required
            defaultValue={transaction?.description}
            placeholder="Ex: Salário mensal"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={transaction?.amount}
                className="pl-10"
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select name="type" required defaultValue={transaction?.type || "expense"}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select name="category" required defaultValue={transaction?.category || "other"}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Input
            type="date"
            id="date"
            name="date"
            required
            defaultValue={transaction?.date}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Salvando...' : mode === 'create' ? 'Criar' : 'Atualizar'}
        </Button>
      </div>
    </form>
  )
} 