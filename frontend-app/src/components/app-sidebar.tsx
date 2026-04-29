"use client";

import * as React from "react";
import { Command } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { NavMain } from "@/components/nav-menus/nav-main";
import { NavPersons } from "@/components/nav-menus/nav-persons";
import { NavUser } from "@/components/nav-menus/nav-user";
import { NavSecondary } from "@/components/nav-menus/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { navigationConfig } from "@/config/navigation";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, loading } = useAuth();

  const navigation = navigationConfig;

  // Si estamos cargando o no hay usuario, mostrar skeleton
  if (loading || !user) {
    return (
      <Sidebar {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">CapitalFarmer</span>
                  <span className="truncate text-xs">v1.2.1</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          {/* Skeleton loading */}
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  const userData = {
    name:
      user.nombre && user.apellido
        ? `${user.nombre} ${user.apellido}`
        : "Nombre del Usuario",
    email: user.correo || "Correo",
    avatar: "/avatars/shadcn.jpg",
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Command className="size-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">CapitalFarmer</span>
              <span className="text-xs text-sidebar-foreground/70">v1.2.1</span>
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          <NavMain items={navigation.navMain} />
          <NavPersons persons={navigation.navPersons} />
          <NavSecondary items={navigation.navSecondary} className="mt-auto" />
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
