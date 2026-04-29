// tabs/case-overview-tab/dashboard/state-history-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EstadoHistorialResumen } from "@/types/caseTypes";

interface StateHistoryCardProps {
  historial: EstadoHistorialResumen[];
}

export function StateHistoryCard({ historial }: StateHistoryCardProps) {
  const reversed = [...historial].reverse();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 border-b ">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold tracking-tight">
            Historial de estados
          </CardTitle>
          {historial.length > 0 && (
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
              {historial.length} {historial.length === 1 ? "estado" : "estados"}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[168px]">
          {historial.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[168px] gap-2 text-muted-foreground">
              <Clock className="w-7 h-7 opacity-30" />
              <p className="text-xs">Sin historial de estados</p>
            </div>
          ) : (
            <ol className="flex flex-col py-3 px-4">
              {reversed.map((h, i) => {
                const isActive = h.finalizado_at == null;
                const isLast = i === reversed.length - 1;

                return (
                  <li key={i} className="relative flex gap-3 group">
                    {/* Connector line */}
                    {!isLast && (
                      <span
                        className={cn(
                          "absolute left-[11px] top-6 bottom-0 w-px",
                          isActive
                            ? "bg-gradient-to-b from-emerald-500/60 to-border/40"
                            : "bg-border/60"
                        )}
                      />
                    )}

                    {/* Icon */}
                    <div className="relative z-10 mt-0.5 shrink-0">
                      {isActive ? (
                        <span className="relative flex items-center justify-center">
                          <span className="absolute w-5 h-5 rounded-full bg-emerald-500/20 animate-ping" />
                          <CheckCircle2 className="w-[22px] h-[22px] text-emerald-600 dark:text-emerald-400 fill-emerald-50 dark:fill-emerald-950" />
                        </span>
                      ) : (
                        <Circle className="w-[22px] h-[22px] text-muted-foreground/40 fill-muted/50" />
                      )}
                    </div>

                    {/* Content */}
                    <div
                      className={cn(
                        "flex-1 pb-4 min-w-0",
                        isLast && "pb-1"
                      )}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <p
                          className={cn(
                            "text-xs font-medium capitalize leading-tight",
                            isActive
                              ? "text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {h.estado}
                        </p>
                        {isActive && (
                          <Badge
                            variant="outline"
                            className="text-[9px] h-4 px-1.5 py-0 border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 font-medium"
                          >
                            En curso
                          </Badge>
                        )}
                      </div>

                      <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 opacity-60 shrink-0" />
                        <span>
                          {h.duracion_legible
                            ? h.duracion_legible
                            : isActive
                            ? "Iniciado recientemente"
                            : "—"}
                        </span>
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}