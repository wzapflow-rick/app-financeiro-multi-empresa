'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, Loader2, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDate, getDaysUntilDue, getStatusBgColor } from '@/lib/format'
import { updateLancamento } from '@/hooks/use-data'
import type { Lancamento } from '@/lib/types'

interface ContasAReceberProps {
  lancamentos: Lancamento[]
  onReceber?: () => void
}

export function ContasAReceber({ lancamentos, onReceber }: ContasAReceberProps) {
  const [recebendo, setRecebendo] = useState<number | null>(null)

  async function handleReceber(lancamento: Lancamento) {
    setRecebendo(lancamento.Id)
    try {
      await updateLancamento(lancamento.Id, { status: 'pago' })
      onReceber?.()
    } catch (error) {
      console.error('Erro ao marcar como recebido:', error)
    } finally {
      setRecebendo(null)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-500" />
          Contas a Receber
        </CardTitle>
        <span className="text-sm text-muted-foreground">Entradas pendentes</span>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lancamentos.length > 0 ? (
            lancamentos.map((lancamento) => {
              const dias = getDaysUntilDue(lancamento.data_vencimento || lancamento.data)
              const statusText =
                dias === 0 ? 'Hoje' : dias === 1 ? 'Amanhã' : `${dias} dias`
              const isRecebendo = recebendo === lancamento.Id

              return (
                <div
                  key={lancamento.Id}
                  className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3"
                >
                  {/* Mobile Layout */}
                  <div className="sm:hidden space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-sm">{lancamento.descricao}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(lancamento.data_vencimento || lancamento.data)}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`${getStatusBgColor(
                          dias < 0 ? 'vencido' : dias <= 2 ? 'pendente' : 'pendente'
                        )} text-xs shrink-0`}
                      >
                        {statusText}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-500 text-sm">
                        +{formatCurrency(lancamento.valor)}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReceber(lancamento)}
                        disabled={isRecebendo}
                        className="gap-1 text-xs h-7 border-emerald-500/30 hover:bg-emerald-500/10"
                      >
                        {isRecebendo ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                        {isRecebendo ? 'Recebendo...' : 'Receber'}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Desktop Layout */}
                  <div className="hidden sm:flex sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{lancamento.descricao}</p>
                      <p className="text-sm text-muted-foreground">
                        Receber em {formatDate(lancamento.data_vencimento || lancamento.data)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-semibold text-emerald-500">
                        +{formatCurrency(lancamento.valor)}
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
                        onClick={() => handleReceber(lancamento)}
                        disabled={isRecebendo}
                        className="gap-1 border-emerald-500/30 hover:bg-emerald-500/10"
                      >
                        {isRecebendo ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        {isRecebendo ? 'Recebendo...' : 'Receber'}
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Nenhuma conta a receber nos próximos dias
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
