"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditSolicitudForm } from "@/pages/tables/requests-data-table/edit-solicitud-form";
import type { Solicitud } from "../../../types/requestsTypes";

interface Props {
  solicitud: Solicitud | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditSolicitudDialog({ solicitud, open, onOpenChange, onSuccess }: Props) {
  const handleSuccess = () => {
    onSuccess?.();
    onOpenChange(false);
  };

  if (!solicitud) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Editar Solicitud N°{solicitud.id}</DialogTitle>
          <DialogDescription>
            Modifique los campos que desea actualizar. Solo se pueden editar solicitudes pendientes.
          </DialogDescription>
        </DialogHeader>
        <EditSolicitudForm 
          solicitud={solicitud}
          onSuccess={handleSuccess} 
          onCancel={() => onOpenChange(false)} 
        />
      </DialogContent>
    </Dialog>
  );
}