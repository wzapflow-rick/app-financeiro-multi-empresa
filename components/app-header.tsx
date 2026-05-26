'use client'

import { useRouter } from 'next/navigation'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useEmpresas, useUser } from '@/hooks/use-data'
import { LogOut, User } from 'lucide-react'

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
  const { user } = useUser()
  
  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

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
                <SelectItem key={empresa.id} value={empresa.id.toString()}>
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
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
              <span className="sr-only">Menu do usuario</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {user && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                {user.nome}
              </div>
            )}
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
