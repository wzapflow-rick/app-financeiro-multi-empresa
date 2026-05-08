'use client'

import { useState, useMemo } from 'react'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useLancamentos, useEmpresas, updateLancamento } from '@/hooks/use-data'
import { formatCurrency, formatDate, getDaysUntilDue, getStatusBgColor } from '@/lib/format'
import type { Lancamento } from '@/lib/types'

export default function ContasPage() {
  const [selectedEmpresa, setSelectedEmpresa] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState('todas')
  const { lancamentos, isLoading, mutate } = useLancamentos({
    empresa_id: selectedEmpresa || undefined,
  })
  const { empresas } = useEmpresas()

  const getEmpresaNome = (id: number) =>
    empresas.find((e) => e.Id === id)?.nome || '-'
  
  const getEmpresaCor = (id: number) =>
    empresas.find((e) => e.Id === id)?.cor || '#3b82f6'

  // Agrupar contas por status
  const { vencidas, hoje, proximas, futuras, pagas } = useMemo(() => {
    const todayDate = new Date()
    todayDate.setHours(0, 0, 0, 0)

    const grupos = {
      vencidas: [] as Lancamento[],
      hoje: [] as Lancamento[],
      proximas: [] as Lancamento[], // próximos 7 dias
      futuras: [] as Lancamento[],
      pagas: [] as Lancamento[],
    }

    lancamentos.forEach((l) => {
      if (l.status === 'pago') {
        grupos.pagas.push(l)
        return
      }

      const vencimento = new Date(l.data_vencimento || l.data)
      vencimento.setHours(0, 0, 0, 0)
      const dias = getDaysUntilDue(l.data_vencimento || l.data)

      if (dias < 0) {
        grupos.vencidas.push(l)
      } else if (dias === 0) {
        grupos.hoje.push(l)
      } else if (dias <= 7) {
        grupos.proximas.push(l)
      } else {
        grupos.futuras.push(l)
      }
    })

    return grupos
  }, [lancamentos])

  const marcarComoPago = async (id: number) => {
    try {
      await updateLancamento(id, { status: 'pago' })
      mutate()
    } catch (error) {
      console.error('Erro ao marcar como pago:', error)
    }
  }

  const ContaItem = ({ lancamento }: { lancamento: Lancamento }) => {
    const dias = getDaysUntilDue(lancamento.data_vencimento || lancamento.data)
    let statusText = ''
    if (lancamento.status === 'pago') {
      statusText = 'Pago'
    } else if (dias < 0) {
      statusText = `${Math.abs(dias)} dia${Math.abs(dias) !== 1 ? 's' : ''} atrasado`
    } else if (dias === 0) {
      statusText = 'Vence hoje'
    } else if (dias === 1) {
      statusText = 'Vence amanhã'
    } else {
      statusText = `Vence em ${dias} dias`
    }

    return (
      <div className="flex items-center gap-4 rounded-lg border p-4">
        <div className="flex-shrink-0">
          {lancamento.tipo === 'entrada' ? (
            <ArrowUpCircle className="h-8 w-8 text-emerald-500" />
          ) : (
            <ArrowDownCircle className="h-8 w-8 text-red-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{lancamento.descricao}</p>
            <Badge
              variant="secondary"
              className={getStatusBgColor(
                lancamento.status === 'pago'
                  ? 'pago'
                  : dias < 0
                  ? 'vencido'
                  : 'pendente'
              )}
            >
              {statusText}
            </Badge>
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: getEmpresaCor(lancamento.empresa_id) }}
              />
              {getEmpresaNome(lancamento.empresa_id)}
            </span>
            <span>
              Venc.: {formatDate(lancamento.data_vencimento || lancamento.data)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span
            className={`text-lg font-bold ${
              lancamento.tipo === 'entrada' ? 'text-emerald-500' : 'text-red-500'
            }`}
          >
            {lancamento.tipo === 'entrada' ? '+' : '-'}
            {formatCurrency(lancamento.valor)}
          </span>
          {lancamento.status !== 'pago' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => marcarComoPago(lancamento.Id)}
            >
              <CheckCircle2 className="mr-1 h-4 w-4" />
              Pagar
            </Button>
          )}
        </div>
      </div>
    )
  }

  const ContasList = ({ items, emptyMessage }: { items: Lancamento[]; emptyMessage: string }) => (
    <div className="space-y-3">
      {items.length > 0 ? (
        items.map((l) => <ContaItem key={l.Id} lancamento={l} />)
      ) : (
        <div className="py-12 text-center text-muted-foreground">{emptyMessage}</div>
      )}
    </div>
  )

  if (isLoading) {
    return (
      <>
        <AppHeader
          title="Contas"
          selectedEmpresa={selectedEmpresa}
          onEmpresaChange={setSelectedEmpresa}
        />
        <div className="flex-1 p-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="mt-6 h-[400px]" />
        </div>
      </>
    )
  }

  return (
    <>
      <AppHeader
        title="Contas"
        selectedEmpresa={selectedEmpresa}
        onEmpresaChange={setSelectedEmpresa}
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-red-500/20 bg-red-500/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{vencidas.length}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(vencidas.reduce((s, l) => s + l.valor, 0))}
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Vencem Hoje</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">{hoje.length}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(hoje.reduce((s, l) => s + l.valor, 0))}
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Próximos 7 dias</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{proximas.length}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(proximas.reduce((s, l) => s + l.valor, 0))}
              </p>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pagas</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">{pagas.length}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(pagas.reduce((s, l) => s + l.valor, 0))}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList>
            <TabsTrigger value="todas">
              Todas ({lancamentos.filter((l) => l.status !== 'pago').length})
            </TabsTrigger>
            <TabsTrigger value="vencidas" className="text-red-500">
              Vencidas ({vencidas.length})
            </TabsTrigger>
            <TabsTrigger value="hoje">Hoje ({hoje.length})</TabsTrigger>
            <TabsTrigger value="proximas">7 dias ({proximas.length})</TabsTrigger>
            <TabsTrigger value="pagas">Pagas ({pagas.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="todas" className="mt-4">
            <ContasList
              items={[...vencidas, ...hoje, ...proximas, ...futuras]}
              emptyMessage="Nenhuma conta pendente"
            />
          </TabsContent>

          <TabsContent value="vencidas" className="mt-4">
            <ContasList
              items={vencidas}
              emptyMessage="Nenhuma conta vencida"
            />
          </TabsContent>

          <TabsContent value="hoje" className="mt-4">
            <ContasList
              items={hoje}
              emptyMessage="Nenhuma conta vence hoje"
            />
          </TabsContent>

          <TabsContent value="proximas" className="mt-4">
            <ContasList
              items={proximas}
              emptyMessage="Nenhuma conta para os próximos 7 dias"
            />
          </TabsContent>

          <TabsContent value="pagas" className="mt-4">
            <ContasList
              items={pagas}
              emptyMessage="Nenhuma conta paga"
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
