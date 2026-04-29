import api from "@/lib/api";


export const solicitudesAPI = {
  
  getTipos: async () => {
    const response = await api.get("/solicitudes/tipos");
    return response.data;
  },

  getAll: async () => {
    const response = await api.get("/solicitudes/all");
    return response.data;
  },

  getMyRequest: async () => {
    const response = await api.get("/solicitudes/mis-solicitudes");
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/solicitudes/${id}`);
    return response.data;
  },

  create: async (data: {
    tipo_id: number;
    fecha_inicio?: string;
    fecha_fin?: string;
    monto_solicitado?: number;
    motivo?: string;
    archivos?: File[];
  }) => {
    const formData = new FormData();
    formData.append("tipo_id", String(data.tipo_id));
    if (data.fecha_inicio)     formData.append("fecha_inicio", data.fecha_inicio);
    if (data.fecha_fin)        formData.append("fecha_fin", data.fecha_fin);
    if (data.monto_solicitado) formData.append("monto_solicitado", String(data.monto_solicitado));
    if (data.motivo)           formData.append("motivo", data.motivo);
    data.archivos?.forEach(file => formData.append("archivos", file));

    const response = await api.post("/solicitudes/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /**
   * Actualiza una solicitud existente
   */
  update: async (id: number, data: {
    tipo_id?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
    monto_solicitado?: number;
    motivo?: string;
  }) => {
    const response = await api.put(`/solicitudes/${id}`, data);
    return response.data;
  },

  // ========== ACCIONES DE ESTADO ==========

  /**
   * Aprueba una solicitud
   */
  approve: async (id: number) => {
    const response = await api.patch(`/solicitudes/${id}/estado`, {
      estado: "aprobado",
    });
    return response.data;
  },

  /**
   * Rechaza una solicitud
   */
  reject: async (id: number) => {
    const response = await api.patch(`/solicitudes/${id}/estado`, {
      estado: "rechazado",
    });
    return response.data;
  },

  /**
   * Anula una solicitud
   */
  cancel: async (id: number) => {
    const response = await api.patch(`/solicitudes/${id}/estado`, {
      estado: "anulado",
    });
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/solicitudes/${id}`);
    return response.data;
  },

  // ========== RESUMEN MENSUAL ==========

  getMensualResume: async () => {
    const response = await api.get("/solicitudes/resumen-mensual");
    return response.data;
  },

  getMyMensualResume: async () => {
    const response = await api.get("/solicitudes/mi-resumen-mensual");
    return response.data;
  },
};