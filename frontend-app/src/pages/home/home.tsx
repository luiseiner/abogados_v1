import { Routes, Route } from "react-router-dom";
import type { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import ControlPanel from "@/pages/home/control-panel";
import QuotationManagementPanel from "@/pages/home/quotes-panel";
import DetailsQuotesPanel from "@/pages/quotes-panels/quotes-details-panel";
import ClientsManagmentPanel from "@/pages/home/clients-panel";
import FilesPanel from "@/pages/home/files-panel";
import FilesExplorerPanel from "@/pages/files-panels/file-explorer";
import AttendancePanel from "../attendance-panels/attendance-panel";
import AttendanceControlPanel from "../attendance-panels/attendance-control-panel";
import OvertimePanel from "../attendance-panels/overtime-panel";
import AdminRequestPanel from "../requests-panels/admin-requests-panel";
import UserRequestPanel from "../requests-panels/user-requests-panel";
import VacationsPanel from "./vacations-panel";
import HolidaysPanel from "../settings-panels/holidays-panel";
import ManagementCasesPanel from "../cases-panels/case-management-panel";
import CasePanel from "../cases-panels/case-details-panel";

import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/context/AuthContext";
import { NotificationsPanel } from "./notifictions-panel";
import CreateEditAreasPanel from "../settings-panels/create-edit-areas-panel";
import TicketsManagementPanel from "../tickets-panels/tickets-mangement-panel";

export default function Home() {
  return (
    <div className="min-h-screen">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar />

        <SidebarInset>
          <SiteHeader />
          <Routes>
            <Route path="/" element={<ControlPanel />} />
            <Route path="/quotes" element={<QuotationManagementPanel />} />
            <Route path="/quotes/details/:id" element={<DetailsQuotesPanel />} />
            <Route path="/clients" element={<ClientsManagmentPanel />} />
            <Route path="/files" element={<FilesPanel />} />
            <Route path="/files/folder/:id" element={<FilesExplorerPanel />} />
            <Route path="/areas/create" element={<CreateEditAreasPanel />} />
            <Route path="/areas/edit/:id" element={<CreateEditAreasPanel />} />
            <Route path="/attendance" element={<AttendancePanel />} />
            <Route
              path="/attendance-control"
              element={<AttendanceControlPanel />}
            />
            <Route path="/overtime" element={<OvertimePanel />} />
            <Route path="/admin-requests" element={<AdminRequestPanel />} />
            <Route path="/user-requests" element={<UserRequestPanel />} />
            <Route path="/vacations" element={<VacationsPanel />} />
            <Route path="/notifications" element={<NotificationsPanel />} />
            <Route path="/holidays" element={<HolidaysPanel />} />
            <Route
              path="/ticket-management"
              element={
                <PermissionGuard
                  permission="tickets.view_all"
                  fallback={<TicketsManagementPanel mode="mine" />} 
                >
                  <TicketsManagementPanel mode="all" />
                </PermissionGuard>
              }
            />
            <Route
              path="/my-tickets"
              element={
                <PermissionGuard
                  permission="tickets.view_own"
                  fallback={<div>No tienes acceso</div>}
                >
                  <TicketsManagementPanel mode="mine" />
                </PermissionGuard>
              }
            />
            <Route
              path="/case-management"
              element={
                <PermissionGuard
                  permission="cases.view_all"
                  fallback={<ManagementCasesPanel mode="mine" />} 
                >
                  <ManagementCasesPanel mode="all" />
                </PermissionGuard>
              }
            />
            <Route
              path="/my-cases"
              element={
                <PermissionGuard
                  permission="cases.view_assigned"
                  fallback={<div>No tienes acceso</div>}
                >
                  <ManagementCasesPanel mode="mine" />
                </PermissionGuard>
              }
            />
            <Route path="/management-cases/case/:id" element={<CasePanel />} />
          </Routes>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

interface PermissionGuardProps {
  permission?: string;
  permissions?: string[];
  module?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  permissions,
  children,
  fallback = null,
}) => {
  const { hasPermission, hasAnyPermission, loading } = useAuth();

  if (loading) return null;

  let hasAccess = true;

  if (permission && !hasPermission(permission)) {
    hasAccess = false;
  }

  if (permissions && !hasAnyPermission(permissions)) {
    hasAccess = false;
  }
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};
