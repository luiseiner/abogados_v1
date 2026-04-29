"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  FilePlus2,
  UserPlus,
  Trash2,
  PencilLine,
  CalendarClock,
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  Upload,
  RefreshCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface Log {
  accion: string;
  descripcion: string;
  usuario_id: number;
  created_at: string;
  // Los campos ignorados (entidad_tipo, entidad_id, id, datos_antes, datos_despues, ip_origen)
  // se aceptan pero no se muestran
  [key: string]: unknown;
}

interface ActivityLogProps {
  logs: Log[];
  /** Mapa opcional usuario_id → nombre de usuario */
  users?: Record<number, string>;
  className?: string;
}

// ─── Configuración de acciones ────────────────────────────────────────────────

interface ActionConfig {
  icon: React.ElementType;
  iconClass: string;
  bgClass: string;
  label: (desc: string) => React.ReactNode;
}

const ACTION_CONFIG: Record<string, ActionConfig> = {
  TAREA_CREADA: {
    icon: FilePlus2,
    iconClass: "text-violet-400",
    bgClass: "bg-violet-500/10 border-violet-500/20",
    label: (desc) => <span className="text-foreground">{desc}</span>,
  },
  TAREA_ACTUALIZADA: {
    icon: PencilLine,
    iconClass: "text-blue-400",
    bgClass: "bg-blue-500/10 border-blue-500/20",
    label: (desc) => <span className="text-foreground">{desc}</span>,
  },
  TAREA_ELIMINADA: {
    icon: Trash2,
    iconClass: "text-red-400",
    bgClass: "bg-red-500/10 border-red-500/20",
    label: (desc) => <span className="text-foreground">{desc}</span>,
  },
  MIEMBRO_AGREGADO: {
    icon: UserPlus,
    iconClass: "text-emerald-400",
    bgClass: "bg-emerald-500/10 border-emerald-500/20",
    label: (desc) => <span className="text-foreground">{desc}</span>,
  },
  ARCHIVO_SUBIDO: {
    icon: Upload,
    iconClass: "text-sky-400",
    bgClass: "bg-sky-500/10 border-sky-500/20",
    label: (desc) => <span className="text-foreground">{desc}</span>,
  },
  ARCHIVO_A_PAPELERA: {
    icon: Trash2,
    iconClass: "text-orange-400",
    bgClass: "bg-orange-500/10 border-orange-500/20",
    label: (desc) => <span className="text-foreground">{desc}</span>,
  },
  CASO_CREADO: {
    icon: FolderOpen,
    iconClass: "text-amber-400",
    bgClass: "bg-amber-500/10 border-amber-500/20",
    label: (desc) => <span className="text-foreground">{desc}</span>,
  },
  CASO_ACTUALIZADO: {
    icon: RefreshCcw,
    iconClass: "text-cyan-400",
    bgClass: "bg-cyan-500/10 border-cyan-500/20",
    label: (desc) => <span className="text-foreground">{desc}</span>,
  },
  ESTADO_CAMBIADO: {
    icon: CheckCircle2,
    iconClass: "text-green-400",
    bgClass: "bg-green-500/10 border-green-500/20",
    label: (desc) => <span className="text-foreground">{desc}</span>,
  },
  FECHA_ESTABLECIDA: {
    icon: CalendarClock,
    iconClass: "text-pink-400",
    bgClass: "bg-pink-500/10 border-pink-500/20",
    label: (desc) => <span className="text-foreground">{desc}</span>,
  },
};

const FALLBACK_CONFIG: ActionConfig = {
  icon: AlertCircle,
  iconClass: "text-muted-foreground",
  bgClass: "bg-muted/40 border-border",
  label: (desc) => <span className="text-foreground">{desc}</span>,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getConfig(accion: string): ActionConfig {
  return ACTION_CONFIG[accion] ?? FALLBACK_CONFIG;
}

function relativeTime(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), {
      addSuffix: true,
      locale: es,
    });
  } catch {
    return dateStr;
  }
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function ActivityLog({ logs, users = {}, className }: ActivityLogProps) {
  if (!logs || logs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        Sin actividad registrada.
      </p>
    );
  }

  return (
    <ol className={cn("relative space-y-0", className)}>
      {logs.map((log, index) => {
        const config = getConfig(log.accion);
        const Icon = config.icon;
        const username = users[log.usuario_id] ?? `Usuario #${log.usuario_id}`;
        const isLast = index === logs.length - 1;

        return (
          <li key={index} className="flex gap-4 group">
            {/* Línea vertical + ícono */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border",
                  config.bgClass,
                )}
              >
                <Icon className={cn("h-4 w-4", config.iconClass)} />
              </div>
              {!isLast && (
                <div className="mt-1 w-px flex-1 bg-border/60 min-h-6" />
              )}
            </div>

            {/* Contenido */}
            <div className={cn("pb-5 pt-0.5 flex-1", isLast && "pb-0")}>
              <p className="text-sm leading-snug text-muted-foreground">
                <span className="font-semibold text-foreground mr-1">
                  {username}
                </span>
                {config.label(log.descripcion)}
              </p>
              <time className="mt-1 block text-xs text-muted-foreground/60">
                {relativeTime(log.created_at)}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}