// tabs/case-overview-tab/dashboard/efficiency-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, Timer } from "lucide-react";

function formatSeconds(seconds: number): string {
  if (seconds <= 0) return "0m";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

interface EfficiencyCardProps {
  eficiencia: number | null;
  desviacionSegundos: number;
  tiempoEstimadoSegundos: number;
  tiempoRealSegundos: number;
}

export function EfficiencyCard({
  eficiencia,
  desviacionSegundos,
  tiempoEstimadoSegundos,
  tiempoRealSegundos,
}: EfficiencyCardProps) {
  const sinDatos = tiempoEstimadoSegundos === 0 && tiempoRealSegundos === 0;
  const pasado = desviacionSegundos > 0;
  const adelanto = desviacionSegundos < 0;

  // Porcentaje de la barra de progreso (cap a 150% para no distorsionar)
  const barPct =
    eficiencia != null && tiempoEstimadoSegundos > 0
      ? Math.min((tiempoRealSegundos / tiempoEstimadoSegundos) * 100, 150)
      : 0;

  const isGood = eficiencia != null && eficiencia >= 100;
  const isOver = eficiencia != null && eficiencia < 100;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-sm font-semibold tracking-tight">
          Eficiencia
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 flex flex-col gap-4">
        {sinDatos ? (
          <div className="flex flex-col items-center justify-center py-6 gap-2 text-muted-foreground">
            <Timer className="w-7 h-7 opacity-30" />
            <p className="text-xs">Sin datos de cronómetro aún</p>
          </div>
        ) : (
          <>
            {/* Indicador principal */}
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl shrink-0",
                  eficiencia == null && "bg-muted text-muted-foreground",
                  isGood &&
                    "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
                  isOver &&
                    "bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400"
                )}
              >
                {eficiencia == null ? (
                  <Minus className="w-4 h-4" />
                ) : isGood ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <p
                    className={cn(
                      "text-2xl font-bold tabular-nums leading-none",
                      isGood && "text-emerald-600 dark:text-emerald-400",
                      isOver && "text-red-600 dark:text-red-400"
                    )}
                  >
                    {eficiencia != null ? `${eficiencia}%` : "—"}
                  </p>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {eficiencia == null
                    ? "Sin datos suficientes"
                    : isGood
                    ? "Dentro del tiempo estimado"
                    : "Por encima del estimado"}
                </p>
              </div>
            </div>

            {/* Barra de progreso comparativa */}
            {eficiencia != null && (
              <div className="space-y-1">
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  {/* Segmento real */}
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      isGood
                        ? "bg-emerald-500 dark:bg-emerald-400"
                        : "bg-red-500 dark:bg-red-400"
                    )}
                    style={{ width: `${Math.min(barPct, 100)}%` }}
                  />
                </div>
                {/* Marcador de estimado (solo visible si está por encima) */}
                {isOver && (
                  <p className="text-[10px] text-muted-foreground text-right">
                    Estimado: 100%
                  </p>
                )}
              </div>
            )}

            {/* Desglose */}
            <div className="rounded-lg border bg-muted/20 divide-y text-xs">
              <div className="flex justify-between items-center px-3 py-2">
                <span className="text-muted-foreground">Estimado</span>
                <span className="font-medium tabular-nums">
                  {formatSeconds(tiempoEstimadoSegundos)}
                </span>
              </div>
              <div className="flex justify-between items-center px-3 py-2">
                <span className="text-muted-foreground">Real</span>
                <span className="font-medium tabular-nums">
                  {formatSeconds(tiempoRealSegundos)}
                </span>
              </div>
              <div className="flex justify-between items-center px-3 py-2">
                <span className="text-muted-foreground">Desviación</span>
                <span
                  className={cn(
                    "font-semibold tabular-nums",
                    pasado && "text-red-600 dark:text-red-400",
                    adelanto && "text-emerald-600 dark:text-emerald-400",
                    !pasado && !adelanto && "text-muted-foreground"
                  )}
                >
                  {pasado ? "+" : adelanto ? "−" : ""}
                  {formatSeconds(Math.abs(desviacionSegundos))}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}