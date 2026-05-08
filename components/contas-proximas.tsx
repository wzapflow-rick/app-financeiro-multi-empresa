'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, getDaysUntilDue, getStatusBgColor } from '@/lib/format'
import type { Lancamento } from '@/lib/types'

interface ContasProximasProps {
  lancamentos: Lancamento[]
}

export function ContasProximas({ lancamentos }: ContasProximasProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contas a Vencer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lancamentos.length > 0 ? (
            lancamentos.map((lancamento) => {
              const dias = getDaysUntilDue(lancamento.data_vencimento || lancamento.data)
              const statusText =
                dias === 0 ? 'Hoje' : dias === 1 ? 'Amanhã' : `${dias} dias`

              return (
                <div
                  key={lancamento.Id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{lancamento.descricao}</p>
                    <p className="text-sm text-muted-foreground">
                      Vence em {formatDate(lancamento.data_vencimento || lancamento.data)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span
                      className={`font-semibold ${
                        lancamento.tipo === 'entrada'
                          ? 'text-emerald-500'
                          : 'text-red-500'
                      }`}
                    >
                      {lancamento.tipo === 'entrada' ? '+' : '-'}
                      {formatCurrency(lancamento.valor)}
                    </span>
                    <Badge
                      variant="secondary"
                      className={getStatusBgColor(
                        dias < 0 ? 'vencido' : dias <= 2 ? 'pendente' : 'pendente'
                      )}
                    >
                      {statusText}
                    </Badge>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Nenhuma conta próxima do vencimento
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
