'use client'

import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertTriangle,
  Clock,
} from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { StatCard } from '@/components/stat-card'
import { FluxoCaixaChart } from '@/components/charts/fluxo-caixa-chart'
import { DespesasCategoriaChart } from '@/components/charts/despesas-categoria-chart'
import { ContasProximas } from '@/components/contas-proximas'
import { useDashboard } from '@/hooks/use-data'
import { formatCurrency } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const [selectedEmpresa, setSelectedEmpresa] = useState<number | null>(null)
  const { data, isLoading } = useDashboard(selectedEmpresa || undefined)

  if (isLoading) {
    return (
      <>
        <AppHeader
          title="Dashboard"
          selectedEmpresa={selectedEmpresa}
          onEmpresaChange={setSelectedEmpresa}
        />
        <div className="flex-1 p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <Skeleton className="col-span-2 h-[380px]" />
            <Skeleton className="h-[380px]" />
          </div>
        </div>
      </>
    )
  }

  const stats = data?.stats || {
    totalEntradas: 0,
    totalSaidas: 0,
    saldo: 0,
    contasPendentes: 0,
    contasVencidas: 0,
  }

  return (
    <>
      <AppHeader
        title="Dashboard"
        selectedEmpresa={selectedEmpresa}
        onEmpresaChange={setSelectedEmpresa}
      />
      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Total Entradas"
            value={formatCurrency(stats.totalEntradas)}
            icon={TrendingUp}
            iconClassName="bg-emerald-500/10 text-emerald-500"
          />
          <StatCard
            title="Total Saídas"
            value={formatCurrency(stats.totalSaidas)}
            icon={TrendingDown}
            iconClassName="bg-red-500/10 text-red-500"
          />
          <StatCard
            title="Saldo"
            value={formatCurrency(stats.saldo)}
            icon={Wallet}
            iconClassName={
              stats.saldo >= 0
                ? 'bg-emerald-500/10 text-emerald-500'
                : 'bg-red-500/10 text-red-500'
            }
          />
          <StatCard
            title="Contas Pendentes"
            value={stats.contasPendentes.toString()}
            description="aguardando pagamento"
            icon={Clock}
            iconClassName="bg-amber-500/10 text-amber-500"
          />
          <StatCard
            title="Contas Vencidas"
            value={stats.contasVencidas.toString()}
            description="precisam atenção"
            icon={AlertTriangle}
            iconClassName="bg-red-500/10 text-red-500"
          />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <FluxoCaixaChart data={data?.fluxoCaixa || []} />
          <DespesasCategoriaChart data={data?.despesasPorCategoria || []} />
        </div>

        <div className="mt-6">
          <ContasProximas lancamentos={data?.contasProximas || []} />
        </div>
      </div>
    </>
  )
}
