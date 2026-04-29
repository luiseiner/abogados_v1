"use client";

import { type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";

export function NavPersons({
  persons,
}: {
  persons: {
    title: string;
    url: string;
    icon: LucideIcon;
    permission?: string;
    isActive?: boolean;
    badge?: string;
  }[];
}) {
  const { hasPermission } = useAuth();
  const visibleItems = persons.filter((item) =>
    hasPermission(item.permission!),
  );

  if (visibleItems.length === 0) return null;
  return (
    <SidebarGroup className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <SidebarGroupLabel>Gestion</SidebarGroupLabel>
      <SidebarMenu>
        {persons.map((item) => {
          if (!hasPermission(item.permission!)) return;
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link to={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
              {item.badge && (
                <SidebarMenuBadge className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-medium border-sky-600 bg-sky-600/10 text-sky-600 dark:border-sky-400 dark:bg-sky-400/10 dark:text-sky-400">
                  {item.badge}
                </SidebarMenuBadge>
              )}
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
