"use client";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import { CaseRegistrationForm } from "./case-form";
import type { Caso } from "@/types/caseTypes";

interface CaseRegistrationSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (formData: any) => Promise<void> | void;
  editingCase?: Caso | null;
}

export function CaseRegistrationSheet({
  open,
  onOpenChange,
  onSubmit,
  editingCase,
}: CaseRegistrationSheetProps) {
  const isEditing = !!editingCase;

  const handleSuccess = async (formData: any) => {
    await onSubmit?.(formData);
    onOpenChange?.(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? "Editar caso" : "Registrar un nuevo caso"}
          </SheetTitle>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <CaseRegistrationForm
            key={editingCase?.id ?? "new"}
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange?.(false)}
            initialData={editingCase ?? undefined}
          />
        </div>
        <SheetFooter>
          <Button type="submit" form="case-registration-form">
             {isEditing ? "Guardar cambios" : "Crear caso"}
          </Button>
          <SheetClose asChild>
            <Button variant="outline">Cerrar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
