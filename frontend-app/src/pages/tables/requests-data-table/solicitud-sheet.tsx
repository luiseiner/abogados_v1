"use client";
import { useState, useEffect } from "react";
import type { Solicitud } from "../../../types/requestsTypes";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Paperclip,

  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getBadgeStyles, formatFullDate, formatHours } from "./utils";
import { solicitudesAPI } from "@/services/requestsService";
import { toast } from "sonner";

export function SolicitudDetailsSheet({
  solicitudId,
  open,
  onOpenChange,
  onUpdate,
}: {
  solicitudId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}) {
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch al abrir
  useEffect(() => {
    if (!open || !solicitudId) return;

    const fetchSolicitud = async () => {
      setIsLoadingData(true);
      try {
        const data = await solicitudesAPI.getById(solicitudId);
        setSolicitud(data);
      } catch {
        toast.error("Error al cargar los detalles de la solicitud");
        onOpenChange(false);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchSolicitud();
  }, [open, solicitudId]);

  const handleApprove = async () => {
    if (!solicitud) return;
    try {
      setIsLoading(true);
      await solicitudesAPI.approve(solicitud.id);
      toast.success("Solicitud aprobada exitosamente");
      onOpenChange(false);
      onUpdate?.();
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      toast.error(
        typeof detail === "object"
          ? detail.mensaje
          : detail || "Error al aprobar",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!solicitud) return;
    try {
      setIsLoading(true);
      await solicitudesAPI.reject(solicitud.id);
      toast.success("Solicitud rechazada");
      onOpenChange(false);
      onUpdate?.();
    } catch (error: any) {
      const detail = error.response?.data?.detail;
      toast.error(
        typeof detail === "object"
          ? detail.mensaje
          : detail || "Error al rechazar",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full md:max-w-lg overflow-hidden p-0">
        <SheetHeader>
          {isLoadingData || !solicitud ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-5 w-24" />
            </div>
          ) : (
            <div className="flex gap-6 items-center">
              <SheetTitle className="text-xl">
                Solicitud N°{solicitud.id}
              </SheetTitle>
              <Badge
                variant="outline"
                className={`${getBadgeStyles(solicitud.estado)} capitalize px-3 py-1`}
              >
                {solicitud.estado}
              </Badge>
            </div>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto ps-4 pe-4 space-y-6">
          {isLoadingData || !solicitud ? (
            // Skeleton de carga
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <>
              {/* Solicitante */}
              <section className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Solicitante
                </h4>
                <div className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {solicitud.usuario.nombre[0]}
                    {solicitud.usuario.apellido[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {solicitud.usuario.nombre} {solicitud.usuario.apellido}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">
                      {solicitud.tipo.nombre} • {solicitud.tipo.categoria}
                    </p>
                  </div>
                </div>
              </section>

              {/* Detalles */}
              <section className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Detalles de la Solicitud
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {solicitud.tipo.categoria === "tiempo" ? (
                    <>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Inicio
                        </p>
                        <p className="text-sm font-medium">
                          {formatFullDate(solicitud.fecha_inicio)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Fin
                        </p>
                        <p className="text-sm font-medium">
                          {formatFullDate(solicitud.fecha_fin)}
                        </p>
                      </div>
                      <div className="col-span-2 space-y-1 border-t pt-2">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Duración Total
                        </p>
                        <p className="text-sm font-bold text-primary">
                          {solicitud.total_horas
                            ? formatHours(parseFloat(solicitud.total_horas))
                            : "--"}
                        </p>
                        <p className="text-sm font-bold text-primary">
                          {solicitud.total_dias
                            ? `${solicitud.total_dias} días`
                            : "--"}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-2 space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <DollarSign className="h-3 w-3" /> Monto Solicitado
                      </p>
                      <p className="text-2xl font-bold">
                        S/ {parseFloat(solicitud.monto_solicitado).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                    <FileText className="h-3 w-3" /> Motivo del empleado
                  </p>
                  <p className="text-sm italic text-foreground/80 leading-relaxed">
                    "{solicitud.motivo || "Sin motivo especificado"}"
                  </p>
                </div>
              </section>

              {/* Archivos adjuntos */}
              {solicitud.archivos.length > 0 && (
                <section className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Paperclip className="h-3 w-3" />
                    Documentos adjuntos ({solicitud.archivos.length})
                  </h4>
                  <ul className="space-y-2">
                    {solicitud.archivos.map((archivo) => (
                      <li
                        key={archivo.id}
                        className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <div className="min-w-0">
                            <p className="truncate text-foreground text-xs font-medium">
                              {archivo.name}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-foreground"
                          
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Auditoría */}
              <section className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Aprobador:</span>
                  <span className="font-medium">
                    {solicitud.aprobador
                      ? `${solicitud.aprobador.nombre} ${solicitud.aprobador.apellido}`
                      : "Pendiente"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Creada el:</span>
                  <span>{formatFullDate(solicitud.fecha_creacion)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Actualizada el:</span>
                  <span>{formatFullDate(solicitud.actualizado_en)}</span>
                </div>
              </section>
            </>
          )}
        </div>

        {solicitud && (
          <SheetFooter>
            {!["aprobado", "rechazado", "anulado"].includes(
              solicitud.estado,
            ) && (
              <Button onClick={handleApprove} disabled={isLoading}>
                {isLoading ? "Procesando..." : "Aprobar Solicitud"}
              </Button>
            )}
            <Button
              variant="outline"
              className="flex-1"
              disabled={isLoading}
              onClick={() => {
                if (solicitud.estado === "aprobado") {
                  onOpenChange(false);
                } else {
                  handleReject();
                }
              }}
            >
              {["aprobado", "rechazado", "anulado"].includes(solicitud.estado)
                ? "Cerrar"
                : isLoading
                  ? "Procesando..."
                  : "Rechazar"}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
    
  );
  
}
