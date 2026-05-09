'use client'

import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'
import { AppHeader } from '@/components/app-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useLancamentos, useEmpresas, useCategorias } from '@/hooks/use-data'
import { formatCurrency, formatCurrencyCompact } from '@/lib/format'

const COLORS = [
  '#3b82f6', // Azul
  '#22c55e', // Verde
  '#f59e0b', // Laranja
  '#8b5cf6', // Roxo
  '#ef4444', // Vermelho
  '#06b6d4', // Ciano
  '#ec4899', // Rosa
  '#84cc16', // Lima
]

export default function RelatoriosPage() {
  const [selectedEmpresa, setSelectedEmpresa] = useState<number | null>(null)
  const { lancamentos, isLoading } = useLancamentos({
    empresa_id: selectedEmpresa || undefined,
  })
  const { empresas } = useEmpresas()
  const { categorias } = useCategorias()

  // Dados para gráfico de evolução mensal
  const evolucaoMensal = useMemo(() => {
    const meses: Record<string, { mes: string; entradas: number; saidas: number; saldo: number }> = {}
    
    lancamentos.forEach((l) => {
      if (l.status !== 'pago') return
      const mes = l.data?.slice(0, 7) || ''
      if (!meses[mes]) {
        meses[mes] = { mes, entradas: 0, saidas: 0, saldo: 0 }
      }
      if (l.tipo === 'entrada') {
        meses[mes].entradas += l.valor
      } else {
        meses[mes].saidas += l.valor
      }
      meses[mes].saldo = meses[mes].entradas - meses[mes].saidas
    })

    return Object.values(meses)
      .sort((a, b) => a.mes.localeCompare(b.mes))
      .slice(-12)
      .map((m) => ({
        ...m,
        mes: new Date(m.mes + '-01').toLocaleDateString('pt-BR', {
          month: 'short',
          year: '2-digit',
        }),
      }))
  }, [lancamentos])

  // Dados para gráfico de categorias
  const despesasPorCategoria = useMemo(() => {
    const cats: Record<number, number> = {}
    
    lancamentos
      .filter((l) => l.tipo === 'saida' && l.status === 'pago')
      .forEach((l) => {
        cats[l.categoria_id] = (cats[l.categoria_id] || 0) + l.valor
      })

    return Object.entries(cats)
      .map(([id, valor]) => ({
        categoria: categorias.find((c) => c.Id === parseInt(id))?.nome || 'Outros',
        valor,
      }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 8)
  }, [lancamentos, categorias])

  // Dados para gráfico de empresas
  const dadosPorEmpresa = useMemo(() => {
    const emps: Record<number, { entradas: number; saidas: number }> = {}
    
    lancamentos
      .filter((l) => l.status === 'pago')
      .forEach((l) => {
        if (!emps[l.empresa_id]) {
          emps[l.empresa_id] = { entradas: 0, saidas: 0 }
        }
        if (l.tipo === 'entrada') {
          emps[l.empresa_id].entradas += l.valor
        } else {
          emps[l.empresa_id].saidas += l.valor
        }
      })

    return Object.entries(emps).map(([id, dados]) => ({
      empresa: empresas.find((e) => e.Id === parseInt(id))?.nome || 'Desconhecida',
      cor: empresas.find((e) => e.Id === parseInt(id))?.cor || '#3b82f6',
      ...dados,
      saldo: dados.entradas - dados.saidas,
    }))
  }, [lancamentos, empresas])

  // Totais
  const totais = useMemo(() => {
    const pagos = lancamentos.filter((l) => l.status === 'pago')
    const entradas = pagos.filter((l) => l.tipo === 'entrada').reduce((s, l) => s + l.valor, 0)
    const saidas = pagos.filter((l) => l.tipo === 'saida').reduce((s, l) => s + l.valor, 0)
    return { entradas, saidas, saldo: entradas - saidas }
  }, [lancamentos])

  if (isLoading) {
    return (
      <>
        <AppHeader
          title="Relatórios"
          selectedEmpresa={selectedEmpresa}
          onEmpresaChange={setSelectedEmpresa}
        />
        <div className="flex-1 p-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
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
        title="Relatórios"
        selectedEmpresa={selectedEmpresa}
        onEmpresaChange={setSelectedEmpresa}
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Resumo Geral */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Entradas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">
                {formatCurrency(totais.entradas)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Saídas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {formatCurrency(totais.saidas)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Saldo Final
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  totais.saldo >= 0 ? 'text-emerald-500' : 'text-red-500'
                }`}
              >
                {formatCurrency(totais.saldo)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <Tabs defaultValue="evolucao" className="mt-6">
          <TabsList>
            <TabsTrigger value="evolucao">Evolução Mensal</TabsTrigger>
            <TabsTrigger value="categorias">Por Categoria</TabsTrigger>
            <TabsTrigger value="empresas">Por Empresa</TabsTrigger>
          </TabsList>

          <TabsContent value="evolucao" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Evolução do Fluxo de Caixa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  {evolucaoMensal.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={evolucaoMensal}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="mes"
                          stroke="#a1a1aa"
                          tick={{ fill: '#a1a1aa' }}
                          fontSize={12}
                        />
                        <YAxis
                          stroke="#a1a1aa"
                          tick={{ fill: '#a1a1aa' }}
                          fontSize={12}
                          tickFormatter={(v) => formatCurrencyCompact(v)}
                        />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="entradas"
                          name="Entradas"
                          stroke="#22c55e"
                          strokeWidth={3}
                          dot={{ r: 5, fill: '#22c55e' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="saidas"
                          name="Saídas"
                          stroke="#ef4444"
                          strokeWidth={3}
                          dot={{ r: 5, fill: '#ef4444' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="saldo"
                          name="Saldo"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{ r: 5, fill: '#3b82f6' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      Nenhum dado disponível
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categorias" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Despesas por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    {despesasPorCategoria.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={despesasPorCategoria}
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            dataKey="valor"
                            nameKey="categoria"
                            label={({ categoria, percent }) =>
                              `${categoria} (${(percent * 100).toFixed(0)}%)`
                            }
                          >
                            {despesasPorCategoria.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        Nenhuma despesa registrada
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ranking de Despesas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {despesasPorCategoria.map((cat, i) => (
                      <div key={cat.categoria} className="flex items-center gap-3">
                        <span className="w-6 text-sm font-medium text-muted-foreground">
                          {i + 1}.
                        </span>
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span className="flex-1 truncate">{cat.categoria}</span>
                        <span className="font-semibold">{formatCurrency(cat.valor)}</span>
                      </div>
                    ))}
                    {despesasPorCategoria.length === 0 && (
                      <div className="py-8 text-center text-muted-foreground">
                        Nenhuma despesa registrada
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="empresas" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Comparativo por Empresa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  {dadosPorEmpresa.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dadosPorEmpresa} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          type="number"
                          stroke="#a1a1aa"
                          tick={{ fill: '#a1a1aa' }}
                          fontSize={12}
                          tickFormatter={(v) => formatCurrencyCompact(v)}
                        />
                        <YAxis
                          type="category"
                          dataKey="empresa"
                          stroke="#a1a1aa"
                          tick={{ fill: '#a1a1aa' }}
                          fontSize={12}
                          width={100}
                        />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                        <Bar
                          dataKey="entradas"
                          name="Entradas"
                          fill="#22c55e"
                          radius={[0, 4, 4, 0]}
                        />
                        <Bar
                          dataKey="saidas"
                          name="Saídas"
                          fill="#ef4444"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      Nenhum dado disponível
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
