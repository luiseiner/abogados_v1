import { useAuth } from "@/context/AuthContext";
import type { AccesoCaso } from "@/types/caseTypes";

const ACCESS_LEVELS: Record<AccesoCaso, number> = {
  can_view: 1,
  can_edit: 2,
  can_manage: 3,
};

export function useCasePermissions(members: { usuario: { id: number }; acceso: AccesoCaso }[]) {
  const { user } = useAuth();

  const myAccess = members.find((m) => m.usuario.id === user?.id)?.acceso ?? "can_view";
  const level = ACCESS_LEVELS[myAccess];

  return {
    myAccess,
    canView:   level >= ACCESS_LEVELS.can_view,
    canEdit:   level >= ACCESS_LEVELS.can_edit,
    canManage: level >= ACCESS_LEVELS.can_manage,
  };
}