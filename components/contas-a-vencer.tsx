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
                  className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 p-3 gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-sm sm:text-base">{lancamento.descricao}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Vence em {formatDate(lancamento.data_vencimento || lancamento.data)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                    <span className="font-semibold text-red-500 text-sm sm:text-base">
                      -{formatCurrency(lancamento.valor)}
                    </span>
                    <Badge
                      variant="secondary"
                      className={`${getStatusBgColor(
                        dias < 0 ? 'vencido' : dias <= 2 ? 'pendente' : 'pendente'
                      )} text-xs`}
                    >
                      {statusText}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePagar(lancamento)}
                      disabled={isPagando}
                      className="gap-1 text-xs sm:text-sm"
                    >
                      {isPagando ? (
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      ) : (
                        <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                      )}
                      <span className="hidden sm:inline">{isPagando ? 'Pagando...' : 'Pagar'}</span>
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
