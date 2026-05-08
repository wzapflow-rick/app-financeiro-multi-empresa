'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'
import type { DespesaCategoria } from '@/lib/types'

interface DespesasCategoriaChartProps {
  data: DespesaCategoria[]
}

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

export function DespesasCategoriaChart({ data }: DespesasCategoriaChartProps) {
  const total = data.reduce((acc, item) => acc + item.valor, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Despesas por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="flex flex-col gap-4">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="valor"
                    nameKey="categoria"
                  >
                    {data.map((_, index) => (
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
                      color: 'hsl(var(--foreground))',
                    }}
                    labelStyle={{
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
              {data.map((item, index) => (
                <div key={item.categoria} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-foreground">
                    {item.categoria}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(item.valor)}
                  </span>
                </div>
              ))}
            </div>
            {total > 0 && (
              <div className="text-center text-sm text-muted-foreground">
                Total: {formatCurrency(total)}
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            Nenhuma despesa registrada
          </div>
        )}
      </CardContent>
    </Card>
  )
}
