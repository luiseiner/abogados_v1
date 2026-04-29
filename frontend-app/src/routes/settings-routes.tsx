import { Routes, Route } from "react-router-dom"

import { SettingsSidebar } from "@/components/settings-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import ManagmentRolesPanel from "@/pages/settings-panels/roles-panel"
import UsersPanel from "@/pages/settings-panels/users-panel"
import CreateEditRolesPanel from "@/pages/settings-panels/create-edit-roles-panel"
import AreasManagement from "@/pages/settings-panels/areas-panel"
import TrashBinPanel from "@/pages/settings-panels/papelera"
import { SiteHeader } from "@/components/site-header"


export default function Settings() {
    return (

        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <SettingsSidebar/>
            <SidebarInset>
                <SiteHeader/>
                <Routes>
                    <Route path="/roles" element={<ManagmentRolesPanel />} />
                    <Route path="/users" element={<UsersPanel />} />
                    <Route path="/roles/create" element={<CreateEditRolesPanel />} />
                    <Route path="/roles/edit/:id" element={<CreateEditRolesPanel />} />
                    <Route path="/areas" element={<AreasManagement />} />
                    <Route path="/papelera" element={<TrashBinPanel />} />
                </Routes>
            </SidebarInset>
        </SidebarProvider>

    )
}

