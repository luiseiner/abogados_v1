// NuevaSolicitudDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SolicitudForm } from "./solicitud-form";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function NuevaSolicitudDialog({ open, onOpenChange, onSuccess }: Props) {
  const handleSuccess = () => {
    onSuccess?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh)] sm:max-w-2xl">
        <ScrollArea className='flex-1 max-h-full flex-col overflow-hidden'>
          
        <div className="pr-4">
        <DialogHeader>
          <DialogTitle>Crear Nueva Solicitud</DialogTitle>
          <DialogDescription>
            Complete el formulario para crear una nueva solicitud
          </DialogDescription>
        </DialogHeader>
        <SolicitudForm 
          onSuccess={handleSuccess} 
          onCancel={() => onOpenChange(false)} 
        />
        </div>
        </ScrollArea>
      </DialogContent>
      
    </Dialog>
  );
}