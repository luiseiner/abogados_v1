import api from "@/lib/api";
import type { AccesoCaso, CasoDashboard, Tarea, TiempoResumen } from "@/types/caseTypes";
import type { File } from "@/types/fileTypes";

export const casosAPI = {
  getAll: async ({
    skip = 0,
    limit = 10,
  }: { skip?: number; limit?: number } = {}) => {
    const response = await api.get("/casos/", {
      params: { skip, limit },
    });
    return response.data;
  },

  getMyCases: async ({
    skip = 0,
    limit = 10,
  }: { skip?: number; limit?: number } = {}) => {
    const response = await api.get("/casos/mis-casos", {
      params: { skip, limit },
    });
    return response.data;
  },

  create: async (data: {
    cliente_id: number;
    expediente: string;
    resumen: string;
    asignados?: { usuario_id: number; acceso: AccesoCaso }[] | null;
    objetivo?: {
      estrategia: string;
      tiempo: string;
      dificultad: string;
      planb: string;
    } | null;
    plazo?: string | null;
    prioridad: string;
    estado: string;
  }) => {
    const response = await api.post("/casos/", data);
    return response.data;
  },

  update: async (
    casoId: number,
    data: {
      expediente?: string;
      resumen?: string;
      asignados_ids?: number[] | null;
      objetivo?: {
        objetivo?: string;
        estrategia?: string;
        tiempo?: string;
        dificultades?: string;
        planb?: string;
      } | null;
      plazo?: string | null;
      prioridad?: string;
      estado?: string;
    },
  ) => {
    const response = await api.put(`/casos/${casoId}`, data);
    return response.data;
  },

  getCaseDetails: async (caseId: number) => {
    const response = await api.get(`/casos/${caseId}`);
    return response.data;
  },

  deleteCase: async (casoId: number) => {
    const response = await api.delete(`/casos/${casoId}`);
    return response.data;
  },

  // --- RUTAS DE TAREAS ---

  getCaseTasks: async (caseId: number) => {
    const response = await api.get(`/casos/${caseId}/tareas`);
    return response.data;
  },

  createCaseTask: async (casoId: number, data: Omit<Tarea, "id">) => {
    const response = await api.post<Tarea>(`/casos/${casoId}/tareas`, data);
    return response.data;
  },

  updateCaseTask: async (
    casoId: number,
    tareaId: number,
    data: Partial<Tarea>,
  ) => {
    const response = await api.put<Tarea>(
      `/casos/${casoId}/tareas/${tareaId}`,
      data,
    );
    return response.data;
  },

  deleteCasteTask: async (casoId: number, tareaId: number) => {
    const response = await api.delete(`/casos/${casoId}/tareas/${tareaId}`);
    return response.data;
  },

  // --- RUTAS DE TIEMPO DE TAREAS ---

  getTaskTime: async (
    casoId: number,
    tareaId: number,
  ): Promise<TiempoResumen> => {
    const response = await api.get(`/casos/${casoId}/tareas/${tareaId}/time`);
    return response.data;
  },

  startTaskTimer: async (
    casoId: number,
    tareaId: number,
  ): Promise<TiempoResumen> => {
    const response = await api.post(
      `/casos/${casoId}/tareas/${tareaId}/time/start`,
    );
    return response.data;
  },

  pauseTaskTimer: async (
    casoId: number,
    tareaId: number,
  ): Promise<TiempoResumen> => {
    const response = await api.post(
      `/casos/${casoId}/tareas/${tareaId}/time/pause`,
    );
    return response.data;
  },

  // --- RUTAS DE MIEMBROS (v2) ---

  addMembers: async (
    casoId: number,
    usuarioIds: number[],
    acceso: "can_view" | "can_edit" | "can_manage" = "can_view",
  ) => {
    const response = await api.post(`/casos/${casoId}/miembros`, {
      usuario_ids: usuarioIds,
      acceso,
    });
    return response.data;
  },

  listMembers: async (casoId: number) => {
    const response = await api.get(`/casos/${casoId}/miembros`);
    return response.data;
  },

  updateMemberAccess: async (
    casoId: number,
    usuarioId: number,
    acceso: "can_view" | "can_edit" | "can_manage",
  ) => {
    const response = await api.patch(`/casos/${casoId}/miembros/${usuarioId}`, {
      acceso,
    });
    return response.data;
  },

  removeMember: async (casoId: number, usuarioId: number) => {
    const response = await api.delete(`/casos/${casoId}/miembros/${usuarioId}`);
    return response.data;
  },

  // --- RUTAS DE DASHBOARDS ---

  getDashboard: async (casoId: number): Promise<CasoDashboard> => {
    const response = await api.get(`/casos/${casoId}/dashboard`);
    return response.data;
  },

  // --- RUTAS DE ARCHIVOS ---

  getCaseFiles: async (casoId: number) => {
    const response = await api.get<File[]>(`/casos/${casoId}/archivos`);
    return response.data;
  },

  uploadCaseFile: async (casoId: number, formData: FormData) => {
    const response = await api.post<{ msg: string; archivo_id: number }>(
      `/casos/${casoId}/archivos`,
      formData,
      {
        headers: {
          // Nota: Axios suele configurar el boundary del FormData automáticamente
          // al no definir el Content-Type, pero lo dejo por si la config lo requiere.
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  renameFile: async (fileId: number, newName: string) => {
    const response = await api.put(`/files/rename/${fileId}`, null, {
      params: { new_name: newName },
    });
    return response.data;
  },

  getFilePreviewUrl: async (archivoId: number) => {
    const response = await api.get<{ url: string }>(
      `/casos/archivos/${archivoId}/preview`,
    );
    return response.data;
  },

  deleteCaseFile: async (casoId: number, archivoId: number) => {
    const response = await api.delete(`/casos/${casoId}/archivos/${archivoId}`);
    return response.data;
  },

  // --- RUTAS DE ACTIVIDAD ---

  getCaseActivcity: async (casoId: number) => {
    const response = await api.get(`/casos/${casoId}/actividad`);
    return response.data;
  },
};
