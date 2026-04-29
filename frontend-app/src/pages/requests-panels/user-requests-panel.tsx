import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { solicitudesAPI } from "@/services/requestsService";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CircleCheck, CircleDollarSign, CircleDot, Plane } from "lucide-react";

import { columns } from "@/pages/tables/requests-data-table/columns";
import { type Solicitud as Request } from "@/types/requestsTypes";
import { useDetailsSheet } from "@/pages/tables/requests-data-table/use-details-sheet";
import { useEditDialog } from "@/pages/tables/requests-data-table/use-edit-dialog";
import { SolicitudDetailsSheet } from "@/pages/tables/requests-data-table/solicitud-sheet";
import { DataTable } from "@/pages/tables/requests-data-table/data-table";
import { NuevaSolicitudDialog } from "../tables/requests-data-table/solicitud-dialog";
import { EditSolicitudDialog } from "@/pages/tables/requests-data-table/edit-solicitud-dialog";

export default function UserRequestPanel() {
  const [requestData, setRequestData] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const detailsSheet = useDetailsSheet();
  const editDialog = useEditDialog();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );

  interface DashboardData {
    resumen: {
      solicitudes_pendientes: number;
      porcentaje_pendientes: number;
      monto_aprobado: number;
      monto_pendiente: number;
      dias_vacaciones_usados: number;
      dias_vacaciones_restantes: number;
      total_dias_vacaciones: number;
      porcentaje_vacaciones: number;
      solicitudes_aprobadas: number;
      porcentaje_aprobadas: number;
      total_solicitudes: number;
    };
    periodo_inicio: string;
    periodo_fin: string;
  }

  const fetchRequestData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await solicitudesAPI.getMyRequest();
      setRequestData(response);
    } catch (error: any) {
      toast.error(
        error.response?.data?.detail || "Error al cargar las solicitudes",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchResumenMensual = useCallback(async () => {
    try {
      const response = await solicitudesAPI.getMyMensualResume();
      setDashboardData(response);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Error al cargar el resumen");
    }
  }, []);

  const handleDelete = async (solicitud: Request) => {
    try {
      await solicitudesAPI.delete(solicitud.id); // Tu servicio API
      toast.success("Solicitud eliminada correctamente");
      
      // Refrescar datos
      fetchRequestData();
      fetchResumenMensual();
    } catch (error: any) {
      toast.error(
        error.response?.data?.detail || "No se pudo eliminar la solicitud"
      );
    }
  };

  useEffect(() => {
    fetchRequestData();
    fetchResumenMensual();
  }, [fetchRequestData, fetchResumenMensual]);

  const handleCreateSuccess = () => {
    fetchRequestData();
    fetchResumenMensual();
    setIsDialogOpen(false);
  };

  const handleEditSuccess = () => {
    fetchRequestData();
    fetchResumenMensual();
  };

  return (
    <div className="flex">
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex flex-col gap-6 mb-8 md:flex-row">
            <Card className="flex-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm">
                  Solicitudes pendientes
                </CardTitle>
                <CircleDot className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData?.resumen.solicitudes_pendientes || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData?.resumen.porcentaje_pendientes || 0}% del total
                </p>
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm">Monto aprobado</CardTitle>
                <CircleDollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  S/{" "}
                  {dashboardData?.resumen.monto_aprobado.toFixed(2) || "0.00"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Pendiente: S/{" "}
                  {dashboardData?.resumen.monto_pendiente.toFixed(2) || "0.00"}
                </p>
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm">Vacaciones</CardTitle>
                <Plane className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData?.resumen.dias_vacaciones_usados || 0} de{" "}
                  {dashboardData?.resumen.total_dias_vacaciones || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData?.resumen.dias_vacaciones_restantes || 0} días
                  restantes ({dashboardData?.resumen.porcentaje_vacaciones || 0}
                  % usado)
                </p>
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm">Solicitudes aprobadas</CardTitle>
                <CircleCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData?.resumen.solicitudes_aprobadas || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData?.resumen.porcentaje_aprobadas || 0}% de éxito
                  (Total: {dashboardData?.resumen.total_solicitudes})
                </p>
              </CardContent>
            </Card>
          </div>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Registros de Solicitudes</CardTitle>
              <CardDescription>Lista de solicitudes</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={requestData}
                isLoading={isLoading}
                onNewRequest={() => setIsDialogOpen(true)}
                meta={{
                  openDetails: detailsSheet.openDetails,
                  openEdit: editDialog.openEdit, 
                  onDelete: handleDelete,
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      <NuevaSolicitudDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleCreateSuccess}
      />
      {detailsSheet.selectedId && (
        <SolicitudDetailsSheet
          solicitudId={detailsSheet.selectedId}
          open={detailsSheet.isOpen}
          onOpenChange={detailsSheet.closeDetails}
          onUpdate={fetchRequestData}
        />
      )}

      <EditSolicitudDialog
        solicitud={editDialog.selectedSolicitud}
        open={editDialog.isOpen}
        onOpenChange={editDialog.closeEdit}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
