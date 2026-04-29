// components/ticket-detail-sheet.tsx
"use client";

import { useState } from "react";
import {
  ArrowDown, ArrowRight, ArrowUp,
  Clock, Pause, Play, CheckCircle2, XCircle,
  PauseCircle,
} from "lucide-react";

import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectGroup,
  SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";

import { EditableText } from "@/components/editable-text";
import { ComboboxAreas } from "@/components/areas-combobox";
import { ComboboxUsuarios } from "@/components/users-combobox";
import { MultiUserCombobox } from "@/components/multi-users-combobox";

import { ticketsAPI } from "@/services/ticketsService";
import type { Ticket, PrioridadTicket } from "@/types/ticketTypes";
import type { UsuarioSimple } from "@/types/userTypes";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// ── Tipos ──────────────────────────────────────────────────────────────────

type EstadoTicket =
  | "asignado" | "en_progreso" | "pausado"
  | "en_revision" | "por_corregir" | "resuelto" | "cancelado";

interface TicketDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket ;
  currentUserId: number;
  onUpdate?: (ticket: Ticket) => void;
}

// ── Helpers visuales ───────────────────────────────────────────────────────

const ESTADO_BADGE: Record<EstadoTicket, { label: string; variant: string }> = {
  asignado:     { label: "Asignado",     variant: "secondary" },
  en_progreso:  { label: "En progreso",  variant: "default"   },
  pausado:      { label: "Pausado",      variant: "warning"   },
  en_revision:  { label: "En revisión",  variant: "info"      },
  por_corregir: { label: "Por corregir", variant: "destructive" },
  resuelto:     { label: "Resuelto",     variant: "success"   },
  cancelado:    { label: "Cancelado",    variant: "outline"   },
};

const PRIORIDAD_ICON: Record<PrioridadTicket, React.ReactNode> = {
  baja:  <ArrowDown className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />,
  media: <ArrowRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
  alta:  <ArrowUp className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />,
};

function formatDateTime(date?: string | null) {
  if (!date) return "—";
  return format(new Date(date), "dd MMM yyyy, HH:mm", { locale: es });
}

function formatTiempo(segundos?: number | null) {
  if (!segundos) return "—";
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function UserChip({ user }: { user: UsuarioSimple }) {
  const initials = user.nombre
    ?.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase() ?? "?";
  return (
    <span className="inline-flex items-center gap-1.5 bg-muted rounded-full px-2.5 py-1 text-xs">
      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 flex items-center justify-center text-[9px] font-medium">
        {initials}
      </span>
      {user.nombre}
    </span>
  );
}

// ── Lógica de botones de acción ────────────────────────────────────────────

interface AccionBtn {
  label: string;
  icon: React.ReactNode;
  variant: "default" | "outline" | "destructive" | "secondary";
  action: string;
}

function getAcciones(
  estado: EstadoTicket,
  isResponsable: boolean,
): AccionBtn[] {
  const map: Partial<Record<EstadoTicket, AccionBtn[]>> = {
    asignado: [
      { label: "Iniciar", icon: <Play className="w-4 h-4" />, variant: "default", action: "iniciar" },
    ],
    en_progreso: [
      { label: "Pausar",    icon: <PauseCircle className="w-4 h-4" />, variant: "outline",     action: "pausar"    },
      { label: "Finalizar", icon: <CheckCircle2 className="w-4 h-4" />, variant: "default",    action: "finalizar" },
    ],
    pausado: [
      { label: "Reanudar", icon: <Play className="w-4 h-4" />, variant: "default", action: "reanudar" },
    ],
    en_revision: isResponsable ? [
      { label: "Rechazar", icon: <XCircle className="w-4 h-4" />,     variant: "destructive", action: "rechazar" },
      { label: "Aprobar",  icon: <CheckCircle2 className="w-4 h-4" />, variant: "default",    action: "aprobar"  },
    ] : [],
    por_corregir: [
      { label: "Iniciar corrección", icon: <Play className="w-4 h-4" />, variant: "default", action: "iniciar" },
    ],
  };
  return map[estado] ?? [];
}

// ── Componente principal ───────────────────────────────────────────────────

export function TicketDetailSheet({
  open,
  onOpenChange,
  ticket,
  currentUserId,
  onUpdate,
}: TicketDetailSheetProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  if (!ticket) return null;

  const estado = (ticket.estado ?? "asignado") as EstadoTicket;
  const isResponsable = ticket.responsable_id === currentUserId;
  const acciones = getAcciones(estado, isResponsable);

  // ── Field save helpers ─────────────────────────────────────────────────

  const saveField = async (field: string, value: unknown) => {
    try {
      const updated = await ticketsAPI.update(ticket.id, { [field]: value } as any);
      onUpdate?.(updated);
      toast.success("Campo actualizado");
    } catch {
      toast.error("Error al actualizar");
    }
  };

  // ── Acciones de estado ─────────────────────────────────────────────────

  const handleAccion = async (action: string) => {
    setIsLoading(action);
    try {
      let updated: Ticket;
      switch (action) {
        case "iniciar":
          updated = await ticketsAPI.iniciar(ticket.id);
          break;
        case "pausar":
          updated = await ticketsAPI.pausar(ticket.id);
          break;
        case "reanudar":
          updated = await ticketsAPI.reanudar(ticket.id);
          break;
        case "finalizar":
          updated = await ticketsAPI.finalizar(ticket.id);
          break;
        case "aprobar":
          updated = await ticketsAPI.aprobar(ticket.id);
          break;
        case "rechazar":
          updated = await ticketsAPI.rechazar(ticket.id);
          break;
        default:
          return;
      }
      onUpdate?.(updated);
      toast.success("Estado actualizado");
    } catch {
      toast.error("Error al cambiar estado");
    } finally {
      setIsLoading(null);
    }
  };

  const badgeInfo = ESTADO_BADGE[estado] ?? { label: estado, variant: "secondary" };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto md:max-w-xl w-full">

        {/* ── Header ── */}
        <SheetHeader className="px-5 pt-5 pb-4 border-b shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground font-mono">{ticket.codigo}</span>
            <Badge variant={badgeInfo.variant as any}>{badgeInfo.label}</Badge>
          </div>
          <SheetTitle className="text-left">
            <EditableText
              variant="title"
              value={ticket.nombre ?? ""}
              onSave={(val) => saveField("nombre", val)}
            />
          </SheetTitle>
        </SheetHeader>

        {/* ── Body (scrollable) ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Detalles */}
          <section className="space-y-1">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Detalles
            </p>

            {/* Prioridad — botones inline */}
            <div className="flex items-center justify-between py-1.5 border-b">
              <span className="text-xs text-muted-foreground">Prioridad</span>
              <div className="flex gap-1">
                {(["baja", "media", "alta"] as PrioridadTicket[]).map((p) => (
                  <Button
                    key={p}
                    size="sm"
                    variant={ticket.prioridad === p ? "default" : "ghost"}
                    className="h-7 px-2 text-xs gap-1"
                    onClick={() => saveField("prioridad", p)}
                  >
                    {PRIORIDAD_ICON[p]}
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Tipo */}
            <div className="flex items-center justify-between py-1.5 border-b">
              <span className="text-xs text-muted-foreground">Tipo</span>
              <Select
                value={ticket.tipo ?? ""}
                onValueChange={(val) => saveField("tipo", val)}
              >
                <SelectTrigger className="h-7 w-36 text-xs border-0 bg-transparent p-0 focus:ring-0 justify-end gap-1">
                  <SelectValue placeholder="Sin tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Tipo</SelectLabel>
                    <SelectItem value="incidente">Incidente</SelectItem>
                    <SelectItem value="problema">Problema</SelectItem>
                    <SelectItem value="pregunta">Pregunta</SelectItem>
                    <SelectItem value="sugerencia">Sugerencia</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Área */}
            <div className="flex items-center justify-between py-1.5 border-b">
              <span className="text-xs text-muted-foreground">Área</span>
              <div className="w-44">
                <ComboboxAreas
                  value={ticket.area_id ?? ""}
                  onChange={(id) => saveField("area_id", id)}
                />
              </div>
            </div>

            {/* Responsable */}
            <div className="flex items-center justify-between py-1.5 border-b">
              <span className="text-xs text-muted-foreground">Responsable</span>
              <div className="w-44">
                <ComboboxUsuarios
                  value={ticket.responsable_id ?? ""}
                  onChange={(id) => saveField("responsable_id", id)}
                />
              </div>
            </div>

            {/* Revisión */}
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-muted-foreground">Requiere revisión</span>
              <Switch
                checked={ticket.revision === 1}
                onCheckedChange={(checked) => saveField("revision", checked ? 1 : 0)}
              />
            </div>
          </section>

          <Separator />

          {/* Descripción */}
          <section>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Descripción
            </p>
            <EditableText
              value={ticket.descripcion ?? ""}
              rows={3}
              onSave={(val) => saveField("descripcion", val)}
            />
          </section>

          <Separator />

          {/* Asignados */}
          <section>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Asignados
            </p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {ticket.asignados?.map((u) => <UserChip key={u.id} user={u} />)}
            </div>
            <MultiUserCombobox
              value={ticket.asignados?.map((u) => u.id) ?? []}
              onChange={(ids) => saveField("asignados", ids)}
            />
          </section>

          <Separator />

          {/* Tiempos */}
          <section>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Tiempos
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-[11px] text-muted-foreground mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Inicio
                </p>
                <p className="text-sm font-medium leading-tight">
                  {ticket.fecha_inicio
                    ? format(new Date(ticket.fecha_inicio), "HH:mm")
                    : "—"}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {ticket.fecha_inicio
                    ? format(new Date(ticket.fecha_inicio), "dd MMM yy", { locale: es })
                    : ""}
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-[11px] text-muted-foreground mb-1 flex items-center gap-1">
                  <Pause className="w-3 h-3" /> Pausas
                </p>
                <p className="text-2xl font-semibold">{ticket.pausas?.length ?? 0}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">interrupciones</p>
              </div>

              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-[11px] text-muted-foreground mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Activo
                </p>
                <p className="text-sm font-medium leading-tight">
                  {formatTiempo(ticket.tiempo_total)}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {estado === "resuelto" ? "total" : "hasta ahora"}
                </p>
              </div>
            </div>

            {ticket.fecha_finalizacion && (
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-md px-3 py-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400 shrink-0" />
                Finalizado el {formatDateTime(ticket.fecha_finalizacion as any)}
              </div>
            )}
          </section>

          <Separator />

          {/* Observaciones */}
          <section>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Observaciones
            </p>
            <EditableText
              value={ticket.observaciones ?? ""}
              rows={3}
              onSave={(val) => saveField("observaciones", val)}
            />
          </section>
        </div>

        {/* ── Footer con acciones ── */}
        {acciones.length > 0 && (
          <SheetFooter className="flex-col gap-2 px-5 py-4 border-t shrink-0">
            <div className="flex gap-2 w-full">
              {acciones.map((accion) => (
                <Button
                  key={accion.action}
                  variant={accion.variant}
                  className="flex-1 gap-2"
                  disabled={isLoading !== null}
                  onClick={() => handleAccion(accion.action)}
                >
                  {isLoading === accion.action ? (
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : accion.icon}
                  {accion.label}
                </Button>
              ))}
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}