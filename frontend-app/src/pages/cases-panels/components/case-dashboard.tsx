import { useEffect, useState } from "react";
import { casosAPI } from "@/services/casesSrevice";
import type { CasoDashboard } from "@/types/caseTypes";
import { TimeStatCard } from "./dashboard/time-stat-card";
import { TaskProgressCard } from "./dashboard/task-progress-card";
import { StateHistoryCard } from "./dashboard/state-history-card";
import { EfficiencyCard } from "./dashboard/efficiency-card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserTimeSummaryCard } from "./dashboard/user-time-case-sumary";
interface CaseDashboardTabProps {
  casoId: number;
}

export function CaseDashboardTab({ casoId }: CaseDashboardTabProps) {
  const [data, setData] = useState<CasoDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      try {
        const response = await casosAPI.getDashboard(casoId);
        setData(response);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, [casoId]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Fila 1: métricas rápidas */}
      <div className="grid grid-cols-2 gap-2">
        <TimeStatCard
          label="Tiempo trabajado"
          seconds={data.tiempo_real_total_segundos}
          description="Cronómetro acumulado en tareas"
          variant="default"
        />

        <StateHistoryCard historial={data.historial_estados} />
      </div>

      {/* Fila 2: progreso + eficiencia + historial */}
      <div className="grid grid-cols-1 md:grid-cols- gap-4">
        <TaskProgressCard
          totalTareas={data.total_tareas}
          tareasPorEstado={data.tareas_por_estado}
          porcentajeCompletado={data.porcentaje_completado}
        />
        <UserTimeSummaryCard 
  resumenPorUsuario={data.resumen_por_usuario} 
/>
        <EfficiencyCard
          eficiencia={data.eficiencia_porcentaje}
          desviacionSegundos={data.desviacion_segundos}
          tiempoEstimadoSegundos={data.tiempo_estimado_total_segundos}
          tiempoRealSegundos={data.tiempo_real_total_segundos}
        />
      </div>
    </div>
  );
}
