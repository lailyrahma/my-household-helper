import { useState } from "react"
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Users, 
  FileText, 
  Clock, 
  TrendingUp,
  Bell,
  ChevronRight
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const items = [
  { title: "Dashboard", url: "/house/:id", icon: Home },
  { title: "Stok Barang", url: "/house/:id/stock", icon: Package },
  { title: "Daftar Belanja", url: "/house/:id/shopping", icon: ShoppingCart },
  { title: "Anggota", url: "/house/:id/members", icon: Users },
  { title: "Laporan & Insight", url: "/house/:id/reports", icon: FileText },
  { title: "Timeline Aktivitas", url: "/house/:id/timeline", icon: Clock },
  { title: "Prediksi Barang Habis", url: "/house/:id/predictions", icon: TrendingUp },
  { title: "Notifikasi", url: "/house/:id/notifications", icon: Bell },
]

interface AppSidebarProps {
  houseId: string
}

export function AppSidebar({ houseId }: AppSidebarProps) {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"

  const isActive = (url: string) => {
    const actualUrl = url.replace(':id', houseId)
    return currentPath === actualUrl || 
           (actualUrl.includes('/house/') && currentPath.startsWith(actualUrl))
  }

  const getNavCls = (url: string) => {
    const active = isActive(url)
    return active ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : ""
  }

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const actualUrl = item.url.replace(':id', houseId)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive(item.url)}
                      tooltip={collapsed ? item.title : undefined}
                    >
                      <NavLink to={actualUrl} className={getNavCls(item.url)}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}