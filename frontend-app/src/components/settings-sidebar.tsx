"use client"
import * as React from "react"
import { Users, Shield, SquareArrowLeft, Building2, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link } from "react-router-dom"

export function SettingsSidebar(props: React.ComponentProps<typeof Sidebar>) {
 const navigate = useNavigate();
  const items = [
    {
      title: "Usuarios",
      url: "/settings/users",
      icon: Users,
    },
    {
      title: "Roles",
      url: "/settings/roles",
      icon: Shield,
    },
    {
      title: "Áreas",
      url: "/settings/areas",
      icon: Building2,
    },
    {
      title: "Papelera",
      url: "/settings/papelera",
      icon: Trash2,
    },
  ]

  return (
    <Sidebar {...props} className="hidden md:flex">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" onClick={() => navigate("/home")}>
            <SquareArrowLeft />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Configuración</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
