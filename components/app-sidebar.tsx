'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ArrowUpDown,
  Receipt,
  BarChart3,
  Settings,
  Building2,
  LogOut,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { useEmpresas } from '@/hooks/use-data'

const menuItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Lançamentos',
    url: '/lancamentos',
    icon: ArrowUpDown,
  },
  {
    title: 'Contas',
    url: '/contas',
    icon: Receipt,
  },
  {
    title: 'Relatórios',
    url: '/relatorios',
    icon: BarChart3,
  },
  {
    title: 'Configurações',
    url: '/configuracoes',
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { empresas } = useEmpresas()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Gestão Financeira</span>
            <span className="text-xs text-muted-foreground">
              {empresas.length} empresa{empresas.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {empresas.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Empresas</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {empresas.map((empresa) => (
                    <SidebarMenuItem key={empresa.Id}>
                      <SidebarMenuButton asChild tooltip={empresa.nome}>
                        <Link href={`/?empresa=${empresa.Id}`}>
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: empresa.cor || '#3b82f6' }}
                          />
                          <span className="truncate">{empresa.nome}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Sair">
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
