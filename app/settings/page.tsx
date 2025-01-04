'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Header from '@/components/Header'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useToast } from '@/contexts/ToastContext'
import type { Database } from '@/types/supabase'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Settings() {
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    currency: 'BRL',
    notifications: true,
    weekStartsOn: 'monday'
  })
  const { showToast } = useToast()
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error) throw error

        setProfile({
          ...profile,
          name: data.name || '',
          email: session.user.email || '',
          currency: data.currency || 'BRL',
          notifications: data.notifications !== false,
          weekStartsOn: data.week_starts_on || 'monday'
        })
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
        showToast('Erro', 'Não foi possível carregar as configurações', 'error')
      }
    }

    loadProfile()
  }, [supabase])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          currency: profile.currency,
          notifications: profile.notifications,
          week_starts_on: profile.weekStartsOn,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id)

      if (error) throw error

      showToast('Sucesso', 'Configurações atualizadas com sucesso', 'success')
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      showToast('Erro', 'Não foi possível atualizar as configurações', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // Buscar transações
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id)

      // Buscar metas
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', session.user.id)

      const data = {
        transactions,
        goals,
        exportDate: new Date().toISOString(),
        user: {
          name: profile.name,
          email: profile.email
        }
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `zard-finance-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      showToast('Sucesso', 'Dados exportados com sucesso', 'success')
    } catch (error) {
      console.error('Erro ao exportar dados:', error)
      showToast('Erro', 'Não foi possível exportar os dados', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container max-w-[1216px] py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
            <p className="text-muted-foreground">
              Gerencie suas preferências e configurações da conta
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="preferences">Preferências</TabsTrigger>
              <TabsTrigger value="data">Dados</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Perfil</CardTitle>
                  {/* <CardDescription>Atualize suas informações pessoais</CardDescription> */}
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        placeholder="Seu nome"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={profile.email}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Salvando...' : 'Salvar alterações'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Preferências</CardTitle>
                  <CardDescription>
                    Personalize sua experiência no sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Moeda</Label>
                    <Select
                      value={profile.currency}
                      onValueChange={(value) => setProfile({ ...profile, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a moeda" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRL">Real (R$)</SelectItem>
                        <SelectItem value="USD">Dólar ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weekStartsOn">Início da Semana</Label>
                    <Select
                      value={profile.weekStartsOn}
                      onValueChange={(value) => setProfile({ ...profile, weekStartsOn: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o dia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sunday">Domingo</SelectItem>
                        <SelectItem value="monday">Segunda-feira</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notificações</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba alertas sobre suas metas e orçamento
                      </p>
                    </div>
                    <Switch
                      checked={profile.notifications}
                      onCheckedChange={(checked) => 
                        setProfile({ ...profile, notifications: checked })
                      }
                    />
                  </div>

                  <Button 
                    onClick={handleUpdateProfile}
                    disabled={loading}
                  >
                    {loading ? 'Salvando...' : 'Salvar preferências'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciamento de Dados</CardTitle>
                  <CardDescription>
                    Exporte ou gerencie seus dados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Exportar Dados</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Baixe uma cópia de todos os seus dados em formato JSON
                      </p>
                      <Button
                        variant="outline"
                        onClick={handleExportData}
                        disabled={loading}
                      >
                        {loading ? 'Exportando...' : 'Exportar todos os dados'}
                      </Button>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2 text-destructive">Zona de Perigo</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Ações irreversíveis para sua conta
                      </p>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          // Implementar lógica de exclusão de conta
                          showToast('Aviso', 'Funcionalidade em desenvolvimento', 'info')
                        }}
                      >
                        Excluir minha conta
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 