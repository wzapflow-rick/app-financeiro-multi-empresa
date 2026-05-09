'use client'

import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertTriangle,
  Clock,
  ArrowDownCircle,
  ArrowUpCircle,
} from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { StatCard } from '@/components/stat-card'
import { FluxoCaixaChart } from '@/components/charts/fluxo-caixa-chart'
import { DespesasCategoriaChart } from '@/components/charts/despesas-categoria-chart'
import { ResumoMensalChart } from '@/components/charts/resumo-mensal-chart'
import { ContasAVencer } from '@/components/contas-a-vencer'
import { ContasAReceber } from '@/components/contas-a-receber'
import { useDashboard } from '@/hooks/use-data'
import { formatCurrency } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const [selectedEmpresa, setSelectedEmpresa] = useState<number | null>(null)
  const { data, isLoading, mutate } = useDashboard(selectedEmpresa || undefined)

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
            {[...Array(6)].map((_, i) => (
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
    saldoReal: 0,
    saldoPrevisto: 0,
    entradasPendentes: 0,
    saidasPendentes: 0,
    contasPendentes: 0,
    contasVencidas: 0,
    contasAReceber: 0,
    contasAReceberVencidas: 0,
  }

  return (
    <>
      <AppHeader
        title="Dashboard"
        selectedEmpresa={selectedEmpresa}
        onEmpresaChange={setSelectedEmpresa}
      />
      <div className="flex-1 overflow-auto p-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
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
            title="Saldo Atual"
            value={formatCurrency(stats.saldoReal)}
            description="somente pagos"
            icon={Wallet}
            iconClassName={
              stats.saldoReal >= 0
                ? 'bg-emerald-500/10 text-emerald-500'
                : 'bg-red-500/10 text-red-500'
            }
          />
          <StatCard
            title="Saldo Previsto"
            value={formatCurrency(stats.saldoPrevisto)}
            description="inclui pendentes"
            icon={Wallet}
            iconClassName={
              stats.saldoPrevisto >= 0
                ? 'bg-blue-500/10 text-blue-500'
                : 'bg-orange-500/10 text-orange-500'
            }
          />
          <StatCard
            title="A Receber"
            value={stats.contasAReceber.toString()}
            description="entradas pendentes"
            icon={ArrowDownCircle}
            iconClassName="bg-emerald-500/10 text-emerald-500"
          />
          <StatCard
            title="A Vencer"
            value={stats.contasPendentes.toString()}
            description="saídas pendentes"
            icon={Clock}
            iconClassName="bg-amber-500/10 text-amber-500"
          />
          <StatCard
            title="Vencidas"
            value={(stats.contasVencidas + stats.contasAReceberVencidas).toString()}
            description="precisam atenção"
            icon={AlertTriangle}
            iconClassName="bg-red-500/10 text-red-500"
          />
        </div>

        {/* Gráficos */}
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <FluxoCaixaChart data={data?.fluxoCaixa || []} />
          <DespesasCategoriaChart data={data?.despesasPorCategoria || []} />
        </div>

        {/* Análise dos Últimos 6 Meses */}
        <div className="mt-6">
          <ResumoMensalChart data={data?.fluxoCaixa || []} />
        </div>

        {/* Contas a Receber e a Vencer */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <ContasAReceber 
            lancamentos={data?.contasAReceberProximas || []} 
            onReceber={mutate} 
          />
          <ContasAVencer 
            lancamentos={data?.contasAVencer || []} 
            onPagar={mutate} 
          />
        </div>
      </div>
    </>
  )
}
