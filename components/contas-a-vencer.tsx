'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, Loader2, TrendingDown } from 'lucide-react'
import { formatCurrency, formatDate, getDaysUntilDue, getStatusBgColor } from '@/lib/format'
import { updateLancamento } from '@/hooks/use-data'
import type { Lancamento } from '@/lib/types'

interface ContasAVencerProps {
  lancamentos: Lancamento[]
  onPagar?: () => void
}

export function ContasAVencer({ lancamentos, onPagar }: ContasAVencerProps) {
  const [pagando, setPagando] = useState<number | null>(null)

  async function handlePagar(lancamento: Lancamento) {
    setPagando(lancamento.Id)
    try {
      await updateLancamento(lancamento.Id, { status: 'pago' })
      onPagar?.()
    } catch (error) {
      console.error('Erro ao marcar como pago:', error)
    } finally {
      setPagando(null)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-red-500" />
          Contas a Vencer
        </CardTitle>
        <span className="text-sm text-muted-foreground">Saídas pendentes</span>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lancamentos.length > 0 ? (
            lancamentos.map((lancamento) => {
              const dias = getDaysUntilDue(lancamento.data_vencimento || lancamento.data)
              const statusText =
                dias === 0 ? 'Hoje' : dias === 1 ? 'Amanhã' : `${dias} dias`
              const isPagando = pagando === lancamento.Id

              return (
                <div
                  key={lancamento.Id}
                  className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{lancamento.descricao}</p>
                    <p className="text-sm text-muted-foreground">
                      Vence em {formatDate(lancamento.data_vencimento || lancamento.data)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="font-semibold text-red-500">
                      -{formatCurrency(lancamento.valor)}
                    </span>
                    <Badge
                      variant="secondary"
                      className={getStatusBgColor(
                        dias < 0 ? 'vencido' : dias <= 2 ? 'pendente' : 'pendente'
                      )}
                    >
                      {statusText}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePagar(lancamento)}
                      disabled={isPagando}
                      className="gap-1"
                    >
                      {isPagando ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      {isPagando ? 'Pagando...' : 'Pagar'}
                    </Button>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Nenhuma conta a vencer nos próximos dias
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
