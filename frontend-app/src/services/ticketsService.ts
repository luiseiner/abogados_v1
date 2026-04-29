import api from "@/lib/api";
import type { TicketCreate, TicketUpdate } from "@/types/ticketTypes";

export const ticketsAPI = {
  // --- CRUD ---

  getAll: async ({
    skip = 0,
    limit = 10,
  }: { skip?: number; limit?: number } = {}) => {
    const response = await api.get("/tickets/all", {
      params: { skip, limit },
    });
    return response.data;
  },

  getMyTickets: async ({
    skip = 0,
    limit = 10,
  }: { skip?: number; limit?: number } = {}) => {
    const response = await api.get("/tickets/mis-tickets", {
      params: { skip, limit },
    });
    return response.data;
  },

  getById: async (ticketId: number) => {
    const response = await api.get(`/tickets/${ticketId}`);
    return response.data;
  },

  create: async (data: TicketCreate) => {
    const response = await api.post("/tickets/", data);
    return response.data;
  },

  update: async (ticketId: number, data: TicketUpdate) => {
    const response = await api.patch(`/tickets/${ticketId}`, data);
    return response.data;
  },

  delete: async (ticketId: number) => {
    const response = await api.delete<{ mensaje: string }>(
      `/tickets/${ticketId}`,
    );
    return response.data;
  },

  // --- ACCIONES DE ESTADO ---

  iniciar: async (ticketId: number) => {
    const response = await api.patch(`/tickets/${ticketId}/iniciar`);
    return response.data;
  },

  pausar: async (ticketId: number) => {
    const response = await api.post(`/tickets/${ticketId}/pausar`);
    return response.data;
  },

  reanudar: async (ticketId: number) => {
    const response = await api.post(`/tickets/${ticketId}/reanudar`);
    return response.data;
  },

  finalizar: async (ticketId: number) => {
    const response = await api.patch(`/tickets/${ticketId}/finalizar`);
    return response.data;
  },

  aprobar: async (ticketId: number) => {
    const response = await api.patch(`/tickets/${ticketId}/aprobar`);
    return response.data;
  },

  rechazar: async (ticketId: number) => {
    const response = await api.patch(`/tickets/${ticketId}/rechazar`);
    return response.data;
  },
};
