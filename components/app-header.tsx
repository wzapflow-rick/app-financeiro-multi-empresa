'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEmpresas } from '@/hooks/use-data'

interface AppHeaderProps {
  title: string
  selectedEmpresa?: number | null
  onEmpresaChange?: (empresaId: number | null) => void
  showEmpresaFilter?: boolean
}

export function AppHeader({
  title,
  selectedEmpresa,
  onEmpresaChange,
  showEmpresaFilter = true,
}: AppHeaderProps) {
  const { empresas } = useEmpresas()

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <h1 className="text-lg font-semibold">{title}</h1>
      
      <div className="ml-auto flex items-center gap-4">
        {showEmpresaFilter && empresas.length > 0 && (
          <Select
            value={selectedEmpresa?.toString() || 'all'}
            onValueChange={(value) =>
              onEmpresaChange?.(value === 'all' ? null : parseInt(value))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Todas empresas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas empresas</SelectItem>
              {empresas.map((empresa) => (
                <SelectItem key={empresa.Id} value={empresa.Id.toString()}>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: empresa.cor || '#3b82f6' }}
                    />
                    {empresa.nome}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </header>
  )
}
