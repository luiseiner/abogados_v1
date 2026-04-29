"use client";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  CalendarCheck,
  CircleDot,
  Clock,
  User2,
  BarChart2,
  CalendarClock,
  Hourglass,
  ClockFading,
  PlayCircle,
} from "lucide-react";
import type { Tarea } from "@/types/caseTypes";
import { DatePickerField } from "@/components/date-piker-field";
import { AssigneePickerField } from "@/components/assignee-piker-field";
import { PickerField } from "@/components/picker-field";
import { PRIORITIES, TASK_STATUSES } from "@/constants/picker-options";
import { EditableText } from "@/components/editable-text";
import type { UsuarioSimple } from "@/types/userTypes";
import { TimerField } from "./timer-field";
import { EstimatedTimeField } from "./estimated-time-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface TaskDetailsSheetProps {
  task: Tarea | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members?: UsuarioSimple[];
  casoId: number;
  onUpdate?: (data: Partial<Tarea>) => void;
  onTimerUpdate?: (tiempo: { tiempo_total_segundos: number }) => void;
}

function PropertyRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex items-center gap-2 w-36 shrink-0 text-muted-foreground">
        <span className="h-4 w-4 shrink-0">{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex-1 text-sm">{children}</div>
    </div>
  );
}

export function TaskDetailsSheet({
  task,
  open,
  onOpenChange,
  members = [],
  casoId,
  onUpdate,
  onTimerUpdate,
}: TaskDetailsSheetProps) {
  const [triggerStart, setTriggerStart] = useState(false); // +
  const [showBanner, setShowBanner] = useState(false); // +

  useEffect(() => {
    setShowBanner(false);
    setTriggerStart(false);
  }, [task?.id]);

  if (!task) return null;

  const canEdit = !!onUpdate;

  const handleStartFromBanner = () => {
    setTriggerStart(true); // le dice al TimerField que arranque
    setShowBanner(false);
  };

  

  const lastEdited = task.updated_at
    ? new Date(task.updated_at).toLocaleString("es-PE", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;
  return (
    <Sheet
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          setShowBanner(false); 
          setTriggerStart(false);
        }
        onOpenChange(val);
      }}
    >
      <SheetContent className="flex flex-col w-full md:max-w-xl overflow-hidden p-0">
        <div className="flex-1 overflow-y-auto">
          {canEdit && showBanner && (
            <Alert className="rounded-none border-x-0 border-t-0 border-b bg-amber-500/10 dark:bg-amber-500/5 px-8 py-3 flex items-center justify-between gap-4 transition-all">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500/20 p-1.5 rounded-full">
                  <PlayCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 animate-pulse" />
                </div>
                <AlertDescription className="text-xs font-medium text-amber-800 dark:text-amber-200">
                  Esta tarea no tiene tiempo registrado. ¿Deseas iniciarla?
                </AlertDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  className="h-8 bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={handleStartFromBanner}
                >
                  Iniciar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-amber-800/70 dark:text-amber-200/70"
                  onClick={() => setShowBanner(false)}
                >
                  Ahora no
                </Button>
              </div>
            </Alert>
          )}

          {/* Título y descripción */}
          <div className="px-8 pt-8 pb-4">
            <SheetTitle className="text-2xl font-semibold mb-4 leading-snug">
              <EditableText
                value={task.titulo}
                variant="title"
                onSave={
                  onUpdate ? (val) => onUpdate({ titulo: val }) : undefined
                }
              />
            </SheetTitle>
            <EditableText
              value={task.descripcion ?? ""}
              rows={5}
              onSave={
                onUpdate ? (val) => onUpdate({ descripcion: val }) : undefined
              }
            />
          </div>

          {/* Last edited */}
          {lastEdited && (
            <div className="px-8 pb-4 flex justify-end">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Última edición {lastEdited}
              </span>
            </div>
          )}

          <div className="mx-8 border-t border-border/60" />

          {/* Properties */}
          <div className="px-8 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Propiedades
            </p>

            <PropertyRow
              icon={<CircleDot className="h-4 w-4" />}
              label="Estado"
            >
              <PickerField
                value={task.estado}
                // onChange={(value) => onUpdate?.({ estado: value })}
                onChange={(value) =>
                  onUpdate?.({ estado: value as Tarea["estado"] })
                }
                options={TASK_STATUSES}
                placeholder="Sin estado"
                disabled={!onUpdate}
              />
            </PropertyRow>

            <PropertyRow icon={<User2 className="h-4 w-4" />} label="Asigandos">
              <AssigneePickerField
                value={task.asignados ?? []}
                members={members}
                onChange={(users) => onUpdate?.({ asignados: users })}
                disabled={!onUpdate}
              />
            </PropertyRow>

            <PropertyRow
              icon={<BarChart2 className="h-4 w-4" />}
              label="Prioridad"
            >
              <PickerField
                value={task.prioridad}
                // onChange={(value) => onUpdate?.({ prioridad: value })}
                onChange={(value) =>
                  onUpdate?.({ prioridad: value as Tarea["prioridad"] })
                }
                options={PRIORITIES}
                placeholder="Sin prioridad"
                disabled={!onUpdate}
              />
            </PropertyRow>

            <PropertyRow
              icon={<CalendarClock className="h-4 w-4" />}
              label="Fecha inicio"
            >
              <DatePickerField
                value={task.fecha_inicio}
                onChange={(date) => onUpdate?.({ fecha_inicio: date })}
                placeholder="Agregar fecha inicio"
                disabled={!onUpdate}
              />
            </PropertyRow>

            <PropertyRow
              icon={<CalendarCheck className="h-4 w-4" />}
              label="Fecha límite"
            >
              <DatePickerField
                value={task.fecha_fin}
                onChange={(date) => onUpdate?.({ fecha_fin: date })}
                placeholder="Agregar fecha límite"
                disabled={!onUpdate}
              />
            </PropertyRow>
            <PropertyRow
              icon={<ClockFading className="h-4 w-4" />}
              label="Tiempo registrado"
            >
              <TimerField
                casoId={casoId}
                tareaId={task.id!}
                tareaTitle={task.titulo}
                disabled={!onUpdate}
                triggerStart={triggerStart} // +
                onTriggerStartConsumed={() => setTriggerStart(false)} // +
                onNoTimeRegistered={() => canEdit && setShowBanner(true)} // +
                onUpdate={(tiempo) => onTimerUpdate?.(tiempo)}
              />
            </PropertyRow>
            <PropertyRow
              icon={<Hourglass className="h-4 w-4" />}
              label="Tiempo estiamdo"
            >
              <EstimatedTimeField
                value={task.tiempo_estimado_minutos}
                onChange={(minutes) =>
                  onUpdate?.({ tiempo_estimado_minutos: minutes })
                }
                disabled={!onUpdate}
              />
            </PropertyRow>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
