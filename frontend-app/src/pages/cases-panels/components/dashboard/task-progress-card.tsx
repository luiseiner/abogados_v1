// tabs/case-overview-tab/dashboard/task-progress-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const ESTADO_CONFIG: Record<string, { label: string; bar: string; dot: string }> = {
  completado:  { label: "Completado",  bar: "bg-emerald-500 dark:bg-emerald-400", dot: "bg-emerald-500 dark:bg-emerald-400" },
  en_progreso: { label: "En progreso", bar: "bg-yellow-500 dark:bg-yellow-400",   dot: "bg-yellow-500 dark:bg-yellow-400" },
  pendiente:   { label: "Pendiente",   bar: "bg-slate-400 dark:bg-slate-500",     dot: "bg-slate-400 dark:bg-slate-500" },
  cancelado:   { label: "Cancelado",   bar: "bg-red-500 dark:bg-red-400",         dot: "bg-red-500 dark:bg-red-400" },
};

interface TaskProgressCardProps {
  totalTareas: number;
  tareasPorEstado: Record<string, number>;
  porcentajeCompletado: number;
}

export function TaskProgressCard({
  totalTareas,
  tareasPorEstado,
  porcentajeCompletado,
}: TaskProgressCardProps) {
  // Construir segmentos de la barra apilada en orden definido
  const order = ["completado", "en_progreso", "pendiente", "cancelado"];
  const segments = order
    .filter((e) => (tareasPorEstado[e] ?? 0) > 0)
    .map((e) => ({
      estado: e,
      count: tareasPorEstado[e],
      pct: totalTareas > 0 ? (tareasPorEstado[e] / totalTareas) * 100 : 0,
      config: ESTADO_CONFIG[e],
    }));

  // Estados que no están en el order definido
  const extraEntries = Object.entries(tareasPorEstado).filter(
    ([e]) => !order.includes(e)
  );

  const completadas = tareasPorEstado["completado"] ?? 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold tracking-tight">
            Progreso de tareas
          </CardTitle>
          {totalTareas > 0 && (
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
              {totalTareas} {totalTareas === 1 ? "tarea" : "tareas"}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 flex flex-col gap-4">
        {totalTareas === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 gap-2 text-muted-foreground">
            <CheckSquare className="w-7 h-7 opacity-30" />
            <p className="text-xs">Sin tareas registradas</p>
          </div>
        ) : (
          <>
            {/* Porcentaje + label */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold tabular-nums leading-none text-foreground">
                  {porcentajeCompletado}%
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {completadas} de {totalTareas} completadas
                </p>
              </div>
              {porcentajeCompletado === 100 && (
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 pb-0.5">
                  ✓ Todo completado
                </span>
              )}
            </div>

            {/* Barra apilada segmentada */}
            <div className="flex h-2 w-full rounded-full overflow-hidden bg-muted gap-px">
              {segments.map(({ estado, pct, config }) => (
                <div
                  key={estado}
                  className={cn("h-full transition-all duration-500", config.bar)}
                  style={{ width: `${pct}%` }}
                />
              ))}
            </div>

            {/* Leyenda */}
            <div className="rounded-lg border bg-muted/20 divide-y text-xs">
              {[...segments, ...extraEntries.map(([e, count]) => ({
                estado: e,
                count,
                pct: totalTareas > 0 ? (count / totalTareas) * 100 : 0,
                config: ESTADO_CONFIG[e] ?? { label: e, bar: "bg-gray-400", dot: "bg-gray-400" },
              }))].map(({ estado, count, config }) => (
                <div key={estado} className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full shrink-0", config.dot)} />
                    <span className="text-muted-foreground">{config.label}</span>
                  </div>
                  <span className="font-semibold tabular-nums text-foreground">{count}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}