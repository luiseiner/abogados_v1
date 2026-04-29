export interface AttendanceQueryParams {
  user_id?: number ;
  month?: number;
  year?: number;
}

// 1. Tipos para Horas Extras Semanales (Detalle por semana)
export interface WeeklyOvertimeResult {
  id_usuario: number;
  week_id: string;
  horas_trabajadas: number;
  horas_extra_total: number;
}

export interface WeeklyOvertime {
  mes: number;
  anio: number;
  desde: string;
  hasta: string;
  resultados: WeeklyOvertimeResult[];
}

// 2. Tipos para Horas Extras Mensuales (Resumen por usuario)
export interface MonthlyOvertimeResult {
  id_usuario: number;
  horas_trabajadas_total: number;
  horas_extra_total: number;
}

export interface MonthlyOvertime {
  mes: number;
  anio: number;
  desde: string;
  hasta: string;
  resultados: MonthlyOvertimeResult[];
}
