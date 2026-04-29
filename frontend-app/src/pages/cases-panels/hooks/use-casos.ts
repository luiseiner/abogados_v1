import { casosAPI } from "@/services/casesSrevice";
import { useQuery } from '@tanstack/react-query';

export function useCasos(skip: number, limit: number) {
  return useQuery({
    queryKey: ["casos", skip, limit],
    queryFn: () =>
      casosAPI.getAll({ skip, limit }), 
  });
}