import api from "@/lib/api";

export const usersAPI = {
  getAll: async () => {
    const response = await api.get("/usuarios");
    return response.data;
  },
};
