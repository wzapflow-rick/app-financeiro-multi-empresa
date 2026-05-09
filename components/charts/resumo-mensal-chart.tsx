'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

interface FluxoCaixaMensal {
  mes: string
  entradas: number
  saidas: number
}

interface ResumoMensalChartProps {
  data: FluxoCaixaMensal[]
}

export function ResumoMensalChart({ data }: ResumoMensalChartProps) {
  // Calcular totais dos últimos 6 meses
  const totalEntradas = data.reduce((sum, item) => sum + item.entradas, 0)
  const totalSaidas = data.reduce((sum, item) => sum + item.saidas, 0)
  const saldo = totalEntradas - totalSaidas
  
  // Calcular média mensal
  const mediaEntradas = totalEntradas / (data.length || 1)
  const mediaSaidas = totalSaidas / (data.length || 1)
  
  // Encontrar melhor e pior mês
  const melhorMes = data.reduce((best, item) => {
    const saldoAtual = item.entradas - item.saidas
    const saldoBest = best.entradas - best.saidas
    return saldoAtual > saldoBest ? item : best
  }, data[0] || { mes: '-', entradas: 0, saidas: 0 })
  
  const piorMes = data.reduce((worst, item) => {
    const saldoAtual = item.entradas - item.saidas
    const saldoWorst = worst.entradas - worst.saidas
    return saldoAtual < saldoWorst ? item : worst
  }, data[0] || { mes: '-', entradas: 0, saidas: 0 })

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          Análise dos Últimos 6 Meses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Entradas */}
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Total de Entradas
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-500">
              {formatCurrency(totalEntradas)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Média: {formatCurrency(mediaEntradas)}/mês
            </p>
          </div>
          
          {/* Total Saídas */}
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Total de Saídas
            </div>
            <p className="mt-2 text-2xl font-bold text-red-500">
              {formatCurrency(totalSaidas)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Média: {formatCurrency(mediaSaidas)}/mês
            </p>
          </div>
          
          {/* Saldo do Período */}
          <div className={`rounded-lg border p-4 ${
            saldo >= 0 
              ? 'border-emerald-500/20 bg-emerald-500/5' 
              : 'border-red-500/20 bg-red-500/5'
          }`}>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {saldo >= 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              Saldo do Período
            </div>
            <p className={`mt-2 text-2xl font-bold ${
              saldo >= 0 ? 'text-emerald-500' : 'text-red-500'
            }`}>
              {formatCurrency(saldo)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {saldo >= 0 ? 'Lucro' : 'Prejuízo'} acumulado
            </p>
          </div>
          
          {/* Melhor/Pior Mês */}
          <div className="rounded-lg border p-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Melhor mês</p>
                <p className="font-semibold text-emerald-500">
                  {melhorMes?.mes} ({formatCurrency((melhorMes?.entradas || 0) - (melhorMes?.saidas || 0))})
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pior mês</p>
                <p className="font-semibold text-red-500">
                  {piorMes?.mes} ({formatCurrency((piorMes?.entradas || 0) - (piorMes?.saidas || 0))})
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Detalhamento por mês */}
        <div className="mt-6">
          <h4 className="mb-3 text-sm font-medium text-muted-foreground">Detalhamento Mensal</h4>
          <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-6">
            {data.map((item) => {
              const saldoMes = item.entradas - item.saidas
              return (
                <div key={item.mes} className="rounded-lg border p-3 text-center">
                  <p className="text-sm font-medium capitalize">{item.mes}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-emerald-500">+{formatCurrency(item.entradas)}</p>
                    <p className="text-xs text-red-500">-{formatCurrency(item.saidas)}</p>
                    <p className={`text-sm font-semibold ${
                      saldoMes >= 0 ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                      {formatCurrency(saldoMes)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
