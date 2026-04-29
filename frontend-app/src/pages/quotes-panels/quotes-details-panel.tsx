"use client"

import { ChevronLeft, ExternalLink, MoreHorizontal, Copy, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  ContextMenu,
  ContextMenuSeparator,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import { useAuth } from "@/context/AuthContext"

interface Cotizacion {
  id?: number;
  codigo_cotizacion?: string; 
  cliente: {
    id?: number;
    nombre: string;
    apellido: string;
  };
  fecha_vencimiento?: string; 
  servicio?: string;
  precio?: number; 
  comentarios?: string;
  exclusiones?: string; 
  estado?: string; 
  detalle_servicio?: string; 
  cuotas?: Array<{
    id: number;
    nombre_cuota: string;
    porcentaje: number;
    monto: number;
    fecha_vencimiento: string;
    estado_pago: string;
  }>; 
}


export default function QuotationDetailPanel() {
  const { id } = useParams(); 
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);
  const {token} = useAuth();
  const [alertOpen, setAlertOpen] = useState(false);
  const [pendingCuota, setPendingCuota] = useState<{ id: number; estado: string } | null>(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchCotizacion = async () => {
      try {
        const response = await axios.get(`${API_URL}/capitalfarmer.co/api/v1/cotizaciones/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCotizacion(response.data); 
      } catch (error) {
        console.error("Error al obtener la cotización:", error);
      }
    };

    if (id) {
      fetchCotizacion(); 
    }
  }, [id, API_URL, token]);

  if (!cotizacion) {
    return <p className="text-center text-gray-500">Cargando cotización...</p>;
  }

  const handleChangeQuoteState = async (cuotaId: number, nuevoEstado: string) => {
    if (!cotizacion?.cuotas) return;
    // Prepara todas las cuotas, cambiando solo la seleccionada
    const cuotasPayload = cotizacion.cuotas.map((c) =>
      c.id === cuotaId ? { ...c, estado_pago: nuevoEstado } : c
    );
    try {
      await axios.put(
        `${API_URL}/capitalfarmer.co/api/v1/cotizaciones/${cotizacion.id}`,
        {
          cuotas: cuotasPayload
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCotizacion((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          cuotas: prev.cuotas?.map((c) =>
            c.id === cuotaId ? { ...c, estado_pago: nuevoEstado } : c
          ),
        };
      });
    } catch (error) {
      alert("Error al actualizar el estado de la cuota");
    }
  };

  const handleRequestChangeState = (cuotaId: number, nuevoEstado: string) => {
    setPendingCuota({ id: cuotaId, estado: nuevoEstado });
    setAlertOpen(true);
  };

  const handleConfirmChangeState = async () => {
    if (pendingCuota) {
      await handleChangeQuoteState(pendingCuota.id, pendingCuota.estado);
      setAlertOpen(false);
      setPendingCuota(null);
    }
  };

  const getStateBadgeColor = (state: string) => {
    switch (state) {
      case "Cancelada":
        return "border-red-600/10 bg-red-600/10 text-red-600 dark:bg-red-400/10 dark:text-red-400"
      case "Pendiente":
        return "border-yellow-600/10 bg-yellow-600/10 text-yellow-600 dark:bg-yellow-400/10 dark:text-yellow-400"
      case "Aprobada":
        return "border-green-600/10 bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400"
      default:
        return "border-gray-600/10 bg-gray-600/10 text-gray-600 dark:bg-gray-400/10 dark:text-gray-400"
    }
  }


  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <div className=" border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="/home/quotes" className="flex items-center gap-2 text-sm">
              <ChevronLeft className="w-4 h-4" />
              Cotizaciones
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {/* Title Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold "></h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm ">
              Propietario: <span className="font-medium"></span>
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Acciones
                  <MoreHorizontal className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Eye className="w-4 h-4 mr-2" />
                  Vista previa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm">
              <Copy className="w-4 h-4 mr-2" />
              Copiar enlace
            </Button>
            <Button size="sm">
              Ver cotización
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document Preview */}
          <div className="lg:col-span-1">
            <div className=" rounded-2xl border p-2">
              <div className="relative aspect-square  rounded-lg overflow">
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                  <Button variant="secondary" size="sm">
                    Ver cotización
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Panel principal de detalles */}
            <div className=" rounded-lg border">
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Column 1 */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-1">Codigo de cotización</h3>
                      <p className="text-sm font-mono ">{cotizacion.codigo_cotizacion}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Cliente</h3>
                      <div className="flex items-center gap-2">
                        <a href="#" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                          {`${cotizacion.cliente?.nombre || ''} ${cotizacion.cliente?.apellido || ''}`.trim() || "Sin nombre"}
                          <ExternalLink className="w-3 h-3 ml-1 inline" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium  mb-1">Valor de la cotización</h3>
                      <p className="text-sm font-semibold ">S/{cotizacion.precio}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-1">Cuotas</h3>
                      <p className="text-sm font-semibold">{cotizacion.cuotas?.length || 0} cuotas</p>
                    </div>
                  </div>

                  {/* Column 3 */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-mediummb-1">Fecha de vencimiento</h3>
                      <p className="text-sm">{cotizacion.fecha_vencimiento}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-1">Estado</h3>
                      <Badge className={getStateBadgeColor(cotizacion.estado || "Sin estado")}>{cotizacion.estado}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel de cuotas debajo, solo si existen */}
            {cotizacion.cuotas && cotizacion.cuotas.length > 0 && (
              <div className="rounded-lg border">
                <div className="p-6">
                  <h2 className="text-sm font-medium  mb-1">Detalle de cuotas</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-sm font-medium mb-1 px-4 py-2 text-left">Nombre</th>
                          <th className="text-sm font-medium mb-1 px-4 py-2 text-left">Porcentaje</th>
                          <th className="text-sm font-medium mb-1 px-4 py-2 text-left">Monto</th>
                          <th className="text-sm font-medium mb-1 px-4 py-2 text-left">Fecha de vencimiento</th>
                          <th className="text-sm font-medium mb-1 px-4 py-2 text-left">Estado</th>
                        </tr>
                      </thead>

                      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción cambiará el estado de la cuota a <b>{pendingCuota?.estado}</b>. ¿Deseas continuar?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setAlertOpen(false)}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleConfirmChangeState}>Confirmar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      
                      <tbody>
                        {cotizacion.cuotas.map((cuota, idx) => (
                          <ContextMenu key={idx}>
                            <ContextMenuTrigger asChild>
                              <tr className="border-t align-middl cursor-pointer">
                                <td className="text-sm mb-1 px-4 py-2 align-middle">{cuota.nombre_cuota}</td>
                                <td className="text-sm mb-1 px-4 py-2 align-middle">{cuota.porcentaje}%</td>
                                <td className="text-sm mb-1 px-4 py-2 align-middle">S/{cuota.monto}</td>
                                <td className="text-sm mb-1 px-4 py-2 align-middle">{cuota.fecha_vencimiento}</td>
                                <td className="align-middle">
                                  <Badge className={getStateBadgeColor(cuota.estado_pago)}>
                                    {cuota.estado_pago}
                                  </Badge>
                                </td>
                              </tr>
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                              <ContextMenuItem>Editar cuota</ContextMenuItem>
                              <ContextMenuSeparator />
                              <ContextMenuItem onClick={() => handleRequestChangeState(cuota.id, "Pagada")}>
                                Marcar como pagado
                              </ContextMenuItem>
                              <ContextMenuItem onClick={() => handleRequestChangeState(cuota.id, "Anulada")}>
                                Marcar como anulada
                              </ContextMenuItem>
                            </ContextMenuContent>
                          </ContextMenu>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
