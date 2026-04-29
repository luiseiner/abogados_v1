import { createContext, useContext, useState, useCallback } from "react";
import { casosAPI } from "@/services/casesSrevice";

interface ActiveTimer {
  casoId: number;
  tareaId: number;
  tareaTitle: string;
  startedAt: Date;
}

interface TimerContextValue {
  activeTimer: ActiveTimer | null;
  setActiveTimer: (timer: ActiveTimer | null) => void;
  startTimer: (timer: ActiveTimer) => Promise<void>;
  stopTimer: () => Promise<void>;
}

const TimerContext = createContext<TimerContextValue | null>(null);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);

  // Al montar, verificar si hay sesión activa en el backend
  // Necesitarás un endpoint GET /tareas/tiempo/activo que devuelva la sesión activa del usuario
  // Si no lo tienes aún, puedes omitir esto por ahora
  
  const stopTimer = useCallback(async () => {
    if (!activeTimer) return;
    await casosAPI.pauseTaskTimer(activeTimer.casoId, activeTimer.tareaId);
    setActiveTimer(null);
  }, [activeTimer]);

  const startTimer = useCallback(async (newTimer: ActiveTimer) => {
    // Si hay uno activo y es diferente, pausarlo primero
    if (activeTimer && activeTimer.tareaId !== newTimer.tareaId) {
      await casosAPI.pauseTaskTimer(activeTimer.casoId, activeTimer.tareaId);
    }
    setActiveTimer(newTimer);
  }, [activeTimer]);

  return (
    <TimerContext.Provider value={{ activeTimer, setActiveTimer, startTimer, stopTimer }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimer must be used within TimerProvider");
  return ctx;
}