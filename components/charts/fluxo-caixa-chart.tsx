'use client'

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrencyCompact } from '@/lib/format'
import type { FluxoCaixaMensal } from '@/lib/types'

interface FluxoCaixaChartProps {
  data: FluxoCaixaMensal[]
}

export function FluxoCaixaChart({ data }: FluxoCaixaChartProps) {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-2">
        <CardTitle className="text-base sm:text-lg">Fluxo de Caixa</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="h-[200px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="mes"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                stroke="#a1a1aa"
                tick={{ fill: '#a1a1aa', fontSize: 10 }}
              />
              <YAxis
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrencyCompact(value)}
                stroke="#a1a1aa"
                tick={{ fill: '#a1a1aa', fontSize: 10 }}
                width={50}
              />
              <Tooltip
                formatter={(value: number) => formatCurrencyCompact(value)}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Bar
                dataKey="entradas"
                name="Entradas"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="saidas"
                name="Saídas"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
