// components/ticket-sheet.tsx
import { useState } from "react";
import { TicketRegistrationForm } from "./tickets-form";
import type { TicketCreate } from "@/types/ticketTypes";
import { ticketsAPI } from "@/services/ticketsService";
import { toast } from "sonner";
import { Sheet, SheetClose, SheetContent, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface TicketSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket?: any; // O usa el tipo 'Ticket' de tus types si lo tienes importado
  onSuccess?: (data: any) => void;
}

export function TicketSheet({ open, onOpenChange, ticket, onSuccess }: TicketSheetProps) {
  const isEditMode = !!ticket;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuccess = async (formData: TicketCreate) => {
    setIsSubmitting(true);
    try {
      const result = isEditMode
        ? await ticketsAPI.update(ticket!.id, formData)
        : await ticketsAPI.create(formData);
      toast.success(isEditMode ? "Ticket actualizado" : "Ticket creado");
      onSuccess?.(result);
      onOpenChange(false);
    } catch {
      toast.error("Error al guardar el ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto md:max-w-xl w-full">
        <div className="px-4 pt-8 pb-4">
          <TicketRegistrationForm
          initialData={ticket}
          isEditMode={isEditMode}
          onSuccess={handleSuccess}
        />
        </div>
        

        <SheetFooter>
          <Button type="submit" form="ticket-registration-form" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : isEditMode ? "Actualizar" : "Crear Ticket"}
          </Button>
          <SheetClose asChild>
            <Button variant="outline" type="button">Cerrar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}