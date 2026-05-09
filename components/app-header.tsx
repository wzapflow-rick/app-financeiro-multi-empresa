'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
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
  const router = useRouter()
  const { empresas } = useEmpresas()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-2 sm:px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4 hidden sm:block" />
      <h1 className="text-base sm:text-lg font-semibold truncate">{title}</h1>
      
      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        {showEmpresaFilter && empresas.length > 0 && (
          <Select
            value={selectedEmpresa?.toString() || 'all'}
            onValueChange={(value) =>
              onEmpresaChange?.(value === 'all' ? null : parseInt(value))
            }
          >
            <SelectTrigger className="w-[120px] sm:w-[180px] text-xs sm:text-sm">
              <SelectValue placeholder="Todas" />
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
                    <span className="truncate">{empresa.nome}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          title="Sair"
          className="text-muted-foreground hover:text-red-500"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
