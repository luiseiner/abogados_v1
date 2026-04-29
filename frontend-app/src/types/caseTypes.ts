import type { UsuarioSimple } from "./userTypes";


export interface ClienteSimple {
  nombre: string;
  apellido?: string;
}

export interface Objetivo {
  objetivo: string;
  estrategia: string;
  dificultades: string;
  tiempo: string;
  planb: string;
}

export type AccesoCaso = "can_view" | "can_edit" | "can_manage";

export interface AsignadoCaso {
  usuario: UsuarioSimple;
  acceso: AccesoCaso;
  invitado_por: UsuarioSimple | null;
  created_at: string;
}

// --- TOPOS DE TAREAS (V1) ---
export interface SesionTiempo {
  id: number;
  usuario_id: number | null;
  inicio: string;        
  fin: string | null;    
  duracion_segundos: number | null;
}
export interface TiempoResumen {
  tiempo_estimado_minutos: number | null;
  tiempo_total_segundos: number;
  sesion_activa: SesionTiempo | null;
  segundos_sesion_activa: number | null;
  en_curso: boolean;
  tiempo_total_con_activa_segundos: number;
  porcentaje_completado: number | null;
}
export interface Tarea {
  entidad_tipo?: string | null;
  entidad_id?: number | null;
  id?: number;
  titulo: string;
  descripcion: string | null;
  asignados_ids?: number[] | null;
  asignados?: UsuarioSimple[];
  estado: 'pendiente' | 'en_progreso' | 'completado' | 'cancelado';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  fecha_inicio: string | null;
  fecha_fin: string | null;
  tiempo_estimado_minutos?: number | null;
  tiempo_total_segundos?: number;
  created_at?: string;
  updated_at?: string;
}

// --- TOPOS DE TAREAS (V2) ---
// export interface TareaRequest {
//   titulo: string;
//   descripcion?: string | null;
//   asignados_ids?: number[] | null; // solo para enviar
//   estado?: string;
//   prioridad?: string;
//   fecha_inicio?: string | null;
//   fecha_fin?: string | null;
// }

// export interface Tarea extends TareaRequest {
//   id: number;
//   entidad_tipo: string;
//   entidad_id: number;
//   asignados?: UsuarioSimple[];     // solo en respuesta
//   created_at: string;
//   updated_at: string;
// }

export interface Caso {
  id: number;
  cliente_id: number;
  cliente?: ClienteSimple;           
  creador?: UsuarioSimple | null;   
  expediente: string;
  resumen?: string | null;          
  asignados?: AsignadoCaso[] | null;
  objetivo?: Objetivo | null;       
  plazo?: string | null;            
  prioridad?: string | null;        
  estado?: string | null;           
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Archivo {
  id: number;
  name: string;
  minio_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  is_deleted: boolean;
}

export interface Activity {
  id: number;
  accion: string;
  descripcion: string;
  entidad_tipo: 'caso' | string;
  entidad_id: number;
  usuario_id: number;
  ip_origen: string | null;
  datos_antes: Record<string, any> | null;
  datos_despues: Record<string, any> | null;
  created_at: string;
}

export interface EstadoHistorialResumen {
  estado: string;
  estado_anterior: string | null;
  iniciado_at: string;
  finalizado_at: string | null;
  duracion_segundos: number | null;
  duracion_legible: string | null;
}

export interface ResumenUsuarioCaso {
  nombre: string;
  tareas_totales: number;
  tiempo_total_real_segundos: number;
  tiempo_total_real_str: string;      // ej: "45h", "2h 30m"
  promedio_por_tarea_segundos: number;
  promedio_por_tarea_str: string;     // ej: "3.75h"
  porcentaje_cumplimiento: number;     // 0-100
}

export interface CasoDashboard {
  caso_id: number;
  expediente: string;
  estado_actual: string;
  created_at: string;
  tiempo_en_estado_actual_segundos: number;
  historial_estados: EstadoHistorialResumen[];
  tiempo_total_abierto_segundos: number;
  total_tareas: number;
  tareas_por_estado: Record<string, number>;
  porcentaje_completado: number;
  tiempo_estimado_total_segundos: number;
  tiempo_real_total_segundos: number;
  desviacion_segundos: number;
  eficiencia_porcentaje: number | null;
  resumen_por_usuario: ResumenUsuarioCaso[];
}