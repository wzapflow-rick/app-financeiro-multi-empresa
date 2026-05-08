'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts'
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Despesas por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="valor"
                  nameKey="categoria"
                  label={({ categoria, percent }) =>
                    `${categoria} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={false}
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
                  }}
                />
                <Legend />
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
  )
}
