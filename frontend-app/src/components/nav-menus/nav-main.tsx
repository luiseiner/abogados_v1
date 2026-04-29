"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";

const badgeStyles = {
  alpha: "border-red-600 bg-red-600/10 text-red-600 dark:border-red-400 dark:bg-red-400/10 dark:text-red-400",
  beta: "border-sky-600 bg-sky-600/10 text-sky-600 dark:border-sky-400 dark:bg-sky-400/10 dark:text-sky-400",
  default: "border-gray-600 bg-gray-600/10 text-gray-600 dark:border-gray-400 dark:bg-gray-400/10 dark:text-gray-400"
};

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    permission?: string;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
      permission?: string;
      badge?: string;
    }[];
  }[];
}) {
  const { hasPermission } = useAuth();
  const visibleItems = items.filter((item) => hasPermission(item.permission!));

  if (visibleItems.length === 0) return null;
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          if (!hasPermission(item.permission!)) return;
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title} asChild>
                    {item.items ? (
                      <div>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      </div>
                    ) : (
                      <Link to={item.url}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items
                      ?.filter(
                        (sub) =>
                          !sub.permission || hasPermission(sub.permission),
                      )
                      .map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link to={subItem.url}>
                              <span>{subItem.title}</span>
                              {subItem.badge && (
                                <SidebarMenuBadge
                                  className={`ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-medium ${
                                    subItem.badge.toLowerCase() === "alpha"
                                      ? badgeStyles.alpha
                                      : subItem.badge.toLowerCase() === "beta"
                                        ? badgeStyles.beta
                                        : badgeStyles.default
                                  }`}
                                >
                                  {subItem.badge}
                                </SidebarMenuBadge>
                              )}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
