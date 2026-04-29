import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause } from "lucide-react";
import { casosAPI } from "@/services/casesSrevice";
import type { TiempoResumen } from "@/types/caseTypes";
import { cn } from "@/lib/utils";
import { useTimer } from "@/context/TimerContext";
import { toast } from "sonner";

interface TimerFieldProps {
  casoId: number;
  tareaId: number;
  initialData?: TiempoResumen | null;
  disabled?: boolean;
  onUpdate?: (data: TiempoResumen) => void;
  onTaskStateChange?: (estado: string) => void;
  triggerStart?: boolean;
  onTriggerStartConsumed?: () => void;
  onNoTimeRegistered?: () => void;
  tareaTitle?: string;
}

function formatSeconds(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function TimerField({
  casoId,
  tareaId,
  initialData,
  disabled = false,
  onUpdate,
  triggerStart,
  onTriggerStartConsumed,
  onNoTimeRegistered,
}: TimerFieldProps) {
  const [data, setData] = useState<TiempoResumen | null>(initialData ?? null);
  const [loading, setLoading] = useState(!initialData);
  const [actionLoading, setActionLoading] = useState(false);
  const [localExtra, setLocalExtra] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { startTimer, setActiveTimer } = useTimer();

  // 1. handleToggle primero — los useEffect que lo usan van después
  const handleToggle = useCallback(async () => {
    if (!data || actionLoading || disabled) return;
    setActionLoading(true);
    try {
      const updated = data.en_curso
        ? await casosAPI.pauseTaskTimer(casoId, tareaId)
        : await casosAPI.startTaskTimer(casoId, tareaId);
      setData(updated);
      if (!data.en_curso) {
        // acabamos de iniciar
        await startTimer({
          casoId,
          tareaId,
          tareaTitle:  "...",
          startedAt: new Date(),
        });
      } else {
        // acabamos de pausar
        setActiveTimer(null);
      }
      onUpdate?.(updated);
    } catch {
      toast.error("No puedes iniciar una tarea si no estas asignado")
    } finally {
      setActionLoading(false);
    }
  }, [data, actionLoading, disabled, casoId, tareaId, onUpdate]);

  // 2. Ref para poder llamar handleToggle desde useEffect sin problemas de dependencias
  const handleToggleRef = useRef(handleToggle);
  useEffect(() => {
    handleToggleRef.current = handleToggle;
  }, [handleToggle]);

  // 3. Cargar datos del backend si no vienen como prop
  useEffect(() => {
    if (initialData) {
      setData(initialData);
      setLoading(false);
      return;
    }
    casosAPI
      .getTaskTime(casoId, tareaId)
      .then(setData)
      .finally(() => setLoading(false));
  }, [casoId, tareaId, initialData]);

  // 4. Emitir cuando termina de cargar y no hay tiempo registrado
  useEffect(() => {
    if (!loading && data && data.tiempo_total_segundos === 0 && !data.en_curso) {
      onNoTimeRegistered?.();
    }
  }, [loading]); // solo dispara cuando loading cambia a false

  // 5. Arrancar timer cuando el sheet lo pide desde el banner
  useEffect(() => {
    if (triggerStart) {
      handleToggleRef.current();
      onTriggerStartConsumed?.();
    }
  }, [triggerStart]);

  // 6. Tick local
  useEffect(() => {
    if (data?.en_curso) {
      setLocalExtra(data.segundos_sesion_activa ?? 0);
      intervalRef.current = setInterval(() => {
        setLocalExtra((prev) => prev + 1);
      }, 1000);
    } else {
      setLocalExtra(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [data?.en_curso, data?.sesion_activa?.id]);

  const totalVisible = (data?.tiempo_total_segundos ?? 0) + localExtra;
  const isRunning = data?.en_curso ?? false;

  if (loading) {
    return <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />;
  }

  return (
    <div className="flex items-center gap-1.5">
      {!disabled && (
        <button
          type="button"
          onClick={handleToggle}
          disabled={actionLoading}
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full transition-colors",
            isRunning
              ? "bg-orange-100 text-orange-600 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400"
              : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            actionLoading && "opacity-50 cursor-not-allowed",
          )}
        >
          {isRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </button>
      )}

      <span
        className={cn(
          "font-mono text-sm tabular-nums",
          isRunning
            ? "text-orange-600 dark:text-orange-400"
            : totalVisible > 0
              ? "text-foreground"
              : "text-muted-foreground",
        )}
      >
        {totalVisible > 0 ? formatSeconds(totalVisible) : "0:00"}
      </span>

      {isRunning && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
        </span>
      )}
    </div>
  );
}