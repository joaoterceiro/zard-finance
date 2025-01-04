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
import { useToast } from '@/contexts/ToastContext'

type GoalFormProps = {
  onSuccess: () => void
  onCancel: () => void
  goal?: Database['public']['Tables']['goals']['Row']
  mode?: 'create' | 'edit' | 'update'
}

const categories = [
  { value: 'emergency', label: 'Fundo de Emergência' },
  { value: 'retirement', label: 'Aposentadoria' },
  { value: 'house', label: 'Casa Própria' },
  { value: 'car', label: 'Veículo' },
  { value: 'travel', label: 'Viagem' },
  { value: 'education', label: 'Educação' },
  { value: 'investment', label: 'Investimento' },
  { value: 'other', label: 'Outro' },
]

export function GoalForm({ onSuccess, onCancel, goal, mode = 'create' }: GoalFormProps) {
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

      const goalData = {
        user_id: session.user.id,
        title: formData.get('title') as string,
        target_amount: parseFloat(formData.get('target_amount') as string),
        current_amount: parseFloat(formData.get('current_amount') as string || '0'),
        category: formData.get('category') as string,
        deadline: formData.get('deadline') as string || null,
        status: mode === 'update' 
          ? (formData.get('status') as 'in_progress' | 'completed' | 'cancelled')
          : 'in_progress'
      }

      if (mode === 'create') {
        const { error } = await supabase.from('goals').insert(goalData)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('goals')
          .update(goalData)
          .eq('id', goal?.id)
        if (error) throw error
      }

      form.reset()
      onSuccess()
      showToast(
        mode === 'create' ? 'Meta criada' : 'Meta atualizada',
        mode === 'create' ? 'Meta criada com sucesso' : 'Meta atualizada com sucesso',
        'success'
      )
    } catch (error) {
      console.error('Erro ao salvar meta:', error)
      showToast('Erro', 'Não foi possível salvar a meta', 'error')
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
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            name="title"
            required
            defaultValue={goal?.title}
            placeholder="Ex: Fundo de emergência"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="target_amount">Valor da Meta</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <Input
                id="target_amount"
                name="target_amount"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={goal?.target_amount}
                className="pl-10"
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_amount">Valor Atual</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <Input
                id="current_amount"
                name="current_amount"
                type="number"
                step="0.01"
                min="0"
                defaultValue={goal?.current_amount}
                className="pl-10"
                placeholder="0,00"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select name="category" required defaultValue={goal?.category || 'other'}>
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

        {mode === 'update' && (
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" required defaultValue={goal?.status || 'in_progress'}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_progress">Em Progresso</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="deadline">Prazo</Label>
          <Input
            type="date"
            id="deadline"
            name="deadline"
            defaultValue={goal?.deadline ?? undefined}
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