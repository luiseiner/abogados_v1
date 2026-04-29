// tabs/case-overview-tab/dashboard/user-time-summary-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, CheckCircle2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResumenUsuarioCaso } from "@/types/caseTypes";

interface UserTimeSummaryCardProps {
  resumenPorUsuario: ResumenUsuarioCaso[];
}

export function UserTimeSummaryCard({
  resumenPorUsuario,
}: UserTimeSummaryCardProps) {
  const totalUsuarios = resumenPorUsuario.length;

  // Calcular totales globales para la barra apilada
  const totalTareasGlobal = resumenPorUsuario.reduce((sum, u) => sum + u.tareas_totales, 0);
  const totalTiempoGlobal = resumenPorUsuario.reduce((sum, u) => sum + u.tiempo_total_real_segundos, 0);

  // Construir segmentos para la barra apilada (por tiempo de cada usuario)
  const segments = resumenPorUsuario.map((usuario) => ({
    nombre: usuario.nombre,
    tiempoSegundos: usuario.tiempo_total_real_segundos,
    pct: totalTiempoGlobal > 0 
      ? (usuario.tiempo_total_real_segundos / totalTiempoGlobal) * 100 
      : 0,
    cumplimiento: usuario.porcentaje_cumplimiento,
  }));

  // Colores para los segmentos (ciclo de 8 colores)
  const COLORES = [
    "bg-blue-500 dark:bg-blue-400",
    "bg-emerald-500 dark:bg-emerald-400",
    "bg-violet-500 dark:bg-violet-400",
    "bg-amber-500 dark:bg-amber-400",
    "bg-rose-500 dark:bg-rose-400",
    "bg-cyan-500 dark:bg-cyan-400",
    "bg-orange-500 dark:bg-orange-400",
    "bg-indigo-500 dark:bg-indigo-400",
  ];

  const getColor = (index: number) => COLORES[index % COLORES.length];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold tracking-tight">
            Resumen por usuario
          </CardTitle>
          {totalUsuarios > 0 && (
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
              {totalUsuarios} {totalUsuarios === 1 ? "usuario" : "usuarios"}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 flex flex-col gap-4">
        {totalUsuarios === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 gap-2 text-muted-foreground">
            <Users className="w-7 h-7 opacity-30" />
            <p className="text-xs">Sin usuarios asignados</p>
          </div>
        ) : (
          <>
            {/* Totales globales */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold tabular-nums leading-none text-foreground">
                  {totalTareasGlobal}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  tareas en total
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold tabular-nums leading-none text-foreground">
                  {Math.round((resumenPorUsuario.reduce((sum, u) => sum + u.porcentaje_cumplimiento, 0) / totalUsuarios) * 10) / 10}%
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  cumplimiento promedio
                </p>
              </div>
            </div>

            {/* Barra apilada por tiempo de cada usuario */}
            <div className="flex h-2 w-full rounded-full overflow-hidden bg-muted gap-px">
              {segments.map(({ nombre, pct }, idx) => (
                <div
                  key={nombre}
                  className={cn("h-full transition-all duration-500", getColor(idx))}
                  style={{ width: `${pct}%` }}
                  title={`${nombre}: ${Math.round(pct * 10) / 10}% del tiempo total`}
                />
              ))}
            </div>

            {/* Tabla de usuarios */}
            <div className="rounded-lg border bg-muted/20 divide-y text-xs">
              {/* Header */}
              <div className="flex items-center px-3 py-2 font-medium text-muted-foreground bg-muted/40">
                <span className="flex-1">Usuario</span>
                <span className="w-12 text-center">Tareas</span>
                <span className="w-16 text-center">Tiempo</span>
                <span className="w-14 text-center">Prom.</span>
                <span className="w-14 text-right">Cump.</span>
              </div>

              {/* Filas */}
              {resumenPorUsuario.map((usuario, idx) => (
                <div
                  key={usuario.nombre}
                  className="flex items-center px-3 py-2.5 hover:bg-muted/30 transition-colors"
                >
                  {/* Nombre + indicador de color */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={cn("w-2 h-2 rounded-full shrink-0", getColor(idx))} />
                    <span className="truncate font-medium text-foreground">
                      {usuario.nombre}
                    </span>
                  </div>

                  {/* Tareas totales */}
                  <div className="w-12 text-center flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-muted-foreground opacity-50" />
                    <span className="tabular-nums">{usuario.tareas_totales}</span>
                  </div>

                  {/* Tiempo total */}
                  <div className="w-16 text-center flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground opacity-50" />
                    <span className="tabular-nums">{usuario.tiempo_total_real_str}</span>
                  </div>

                  {/* Promedio por tarea */}
                  <div className="w-14 text-center">
                    <span className="tabular-nums text-muted-foreground">
                      {usuario.promedio_por_tarea_str}
                    </span>
                  </div>

                  {/* Cumplimiento con badge de color */}
                  <div className="w-14 text-right">
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 font-semibold tabular-nums",
                        usuario.porcentaje_cumplimiento >= 90
                          ? "text-emerald-600 dark:text-emerald-400"
                          : usuario.porcentaje_cumplimiento >= 70
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-rose-600 dark:text-rose-400"
                      )}
                    >
                      <TrendingUp className="w-3 h-3" />
                      {usuario.porcentaje_cumplimiento}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}