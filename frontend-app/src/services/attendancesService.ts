import api from "@/lib/api";
import type { AttendanceQueryParams, MonthlyOvertime, WeeklyOvertime } from "@/types/attendanceTypes";

export const attendanceAPI = {

  getWeeklyExtraHours: async (params: AttendanceQueryParams): Promise<WeeklyOvertime> => {
    const response = await api.get('/asistencias/horas-extras-semanales', { 
      params 
    });
    return response.data;
  },

  getMonthlyExtraHours: async (params: AttendanceQueryParams): Promise<MonthlyOvertime> => {
    const response = await api.get('/asistencias/horas-extras-mensuales', { 
      params 
    });
    return response.data;
  }
};