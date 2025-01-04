'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Header from '@/components/Header'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useToast } from '@/contexts/ToastContext'
import { MoreVertical, Pencil, Trash2 } from "lucide-react"
import GoalForm from '@/components/GoalForm'
import type { Database } from '@/types/supabase'

type Goal = Database['public']['Tables']['goals']['Row']

export default function Goals() {
  const [loading, setLoading] = useState(true)
  const [goals, setGoals] = useState<Goal[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | undefined>(undefined)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null)
  const supabase = createClientComponentClient<Database>()
  const { showToast } = useToast()

  const fetchGoals = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setGoals(data || [])
    } catch (error) {
      console.error('Erro ao carregar metas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGoals()
  }, [])

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const handleGoalSuccess = () => {
    setShowForm(false)
    fetchGoals()
  }

  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal)
    setFormMode('edit')
    setShowForm(true)
  }
  
  const handleDeleteClick = (goalId: string) => {
    setGoalToDelete(goalId)
  }

  const handleConfirmDelete = async () => {
    if (!goalToDelete) return

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalToDelete)

      if (error) throw error
      
      fetchGoals()
      showToast('Meta excluída', 'A meta foi excluída com sucesso', 'success')
    } catch (error) {
      console.error('Erro ao deletar meta:', error)
      showToast('Erro ao excluir', 'Não foi possível excluir a meta', 'error')
    } finally {
      setGoalToDelete(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container max-w-[1216px] py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Metas Financeiras</h1>
          <Button onClick={() => setShowForm(true)}>
            Nova Meta
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {goals.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Você ainda não tem nenhuma meta financeira
                  </p>
                  <Button onClick={() => setShowForm(true)}>
                    Criar primeira meta
                  </Button>
                </CardContent>
              </Card>
            ) : (
              goals.map((goal) => (
                <Card key={goal.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{goal.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {goal.category}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditGoal(goal)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar Meta
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(goal.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir Meta
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium">
                            {calculateProgress(goal.current_amount, goal.target_amount).toFixed(0)}%
                          </span>
                        </div>
                        <Progress 
                          value={calculateProgress(goal.current_amount, goal.target_amount)} 
                          className="h-2"
                        />
                      </div>
                      <div className="flex justify-between items-baseline">
                        <div className="text-sm text-muted-foreground">
                          Atual
                        </div>
                        <div className="text-2xl font-bold">
                          R$ {goal.current_amount.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <div className="text-sm text-muted-foreground">
                          Meta
                        </div>
                        <div className="text-lg text-muted-foreground">
                          R$ {goal.target_amount.toFixed(2)}
                        </div>
                      </div>
                      {goal.deadline && (
                        <div className="text-sm text-muted-foreground text-right">
                          Prazo: {new Date(goal.deadline).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle>
                  {formMode === 'create' ? 'Nova Meta' : 
                   formMode === 'edit' ? 'Editar Meta' : 
                   'Atualizar Progresso'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GoalForm
                  goal={selectedGoal}
                  mode={formMode}
                  onSuccess={() => {
                    setShowForm(false)
                    setSelectedGoal(undefined)
                    fetchGoals()
                  }}
                  onCancel={() => {
                    setShowForm(false)
                    setSelectedGoal(undefined)
                  }}
                />
              </CardContent>
            </Card>
          </div>
        )}

        <ConfirmDialog
          open={!!goalToDelete}
          onOpenChange={() => setGoalToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Excluir Meta"
          description="Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita."
        />
      </div>
    </div>
  )
} 