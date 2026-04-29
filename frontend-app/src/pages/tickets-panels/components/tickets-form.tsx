// components/ticket-registration-form.tsx
"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CircleHelp,
  CircleQuestionMark,
  Flame,
  Lightbulb,
  Puzzle,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";

import { EditableText } from "@/components/editable-text";
import { ComboboxAreas } from "@/components/areas-combobox";
import { ComboboxUsuarios } from "@/components/users-combobox";
import { MultiUserCombobox } from "@/components/multi-users-combobox";

import type {
  Ticket,
  TicketCreate,
  PrioridadTicket,
  TipoTicket,
} from "@/types/ticketTypes";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface TicketRegistrationFormProps {
  onSuccess?: (formData: TicketCreate) => void;
  onCancel?: () => void;
  initialData?: Partial<Ticket>;
  isEditMode?: boolean;
}

export function TicketRegistrationForm({
  onSuccess,
  initialData,
  isEditMode = false,
}: TicketRegistrationFormProps) {
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre ?? "",
    descripcion: initialData?.descripcion ?? "",
    prioridad: initialData?.prioridad ?? null,
    area_id: initialData?.area_id ?? null,
    tipo: initialData?.tipo ?? null,
    responsable_id: initialData?.responsable_id ?? null,
    revision: (initialData?.revision ?? 0) === 1,
    asignados_ids: initialData?.asignados
      ? initialData.asignados.map((u: any) => u.usuario_id ?? u.id)
      : [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof typeof formData>(
    key: K,
    value: (typeof formData)[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.nombre) newErrors.nombre = "El nombre es obligatorio";
    if (!formData.area_id) newErrors.area_id = "El área es obligatoria";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    onSuccess?.({
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      prioridad: formData.prioridad ?? undefined,
      area_id: formData.area_id!,
      tipo: formData.tipo ?? undefined,
      responsable_id: formData.responsable_id ?? undefined,
      revision: formData.revision ? 1 : 0,
      asignados: formData.asignados_ids,
    });
  };

  return (
    <form id="ticket-registration-form" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4">
        {/* Nombre */}
        <Field>
          <FieldLabel htmlFor="nombre">Nombre del Ticket</FieldLabel>
          {isEditMode ? (
            <EditableText
              variant="title"
              value={formData.nombre}
              onSave={(val) => set("nombre", val)}
            />
          ) : (
            <Input
              id="nombre"
              placeholder="Ingrese el nombre del ticket"
              value={formData.nombre}
              onChange={(e) => set("nombre", e.target.value)}
            />
          )}
          {errors.nombre && (
            <FieldDescription className="text-sm text-red-600 dark:text-red-400">
              {errors.nombre}
            </FieldDescription>
          )}
        </Field>

        {/* Prioridad */}
        <Field>
          <FieldLabel>Prioridad</FieldLabel>
          <div className="grid grid-cols-3 gap-2">
            {(["baja", "media", "alta"] as PrioridadTicket[]).map((p) => (
              <Button
                key={p}
                type="button"
                variant={formData.prioridad === p ? "default" : "outline"}
                onClick={() => set("prioridad", p)}
              >
                {p === "baja" && <ArrowDown className="w-4 h-4 mr-1" />}
                {p === "media" && <ArrowRight className="w-4 h-4 mr-1" />}
                {p === "alta" && <ArrowUp className="w-4 h-4 mr-1" />}
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Button>
            ))}
          </div>
        </Field>

        {/* Área + Tipo */}
        <div className="flex flex-col md:flex-row gap-2">
          <Field className="flex-1">
            <FieldLabel>Área</FieldLabel>
            <ComboboxAreas
              value={formData.area_id ?? ""}
              onChange={(id) => set("area_id", id as number)}
            />
            {errors.area_id && (
              <FieldDescription className="text-sm text-red-600 dark:text-red-400">
                {errors.area_id}
              </FieldDescription>
            )}
          </Field>

          <Field className="flex-1">
            <FieldLabel>Tipo</FieldLabel>
            <Select
              value={formData.tipo ?? ""}
              onValueChange={(val) => set("tipo", val as TipoTicket)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="incidente">
                    <Flame className="text-amber-600 dark:text-amber-400" />
                    Incidente
                  </SelectItem>
                  <SelectItem value="problema">
                    <Puzzle className="text-green-600 dark:text-green-400" />
                    Problema
                  </SelectItem>
                  <SelectItem value="pregunta">
                    <CircleQuestionMark className="text-cyan-600 dark:text-cyan-400" />
                    Pregunta
                  </SelectItem>
                  <SelectItem value="sugerencia">
                    <Lightbulb className="text-purple-600 dark:text-purple-400" />
                    Sugerencia
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </div>

        {/* Responsable */}
        <Field>
          <FieldLabel>Responsable</FieldLabel>
          <ComboboxUsuarios
            value={formData.responsable_id ?? ""}
            onChange={(id) => set("responsable_id", id as number)}
          />
        </Field>

        {/* Asignados */}
        <Field>
          <FieldLabel>Asignar a</FieldLabel>
          <MultiUserCombobox
            value={formData.asignados_ids}
            onChange={(ids) => set("asignados_ids", ids as number[])}
          />
        </Field>

        {/* Descripción */}
        <Field>
          <FieldLabel>Descripción</FieldLabel>
          <Textarea
            id="descripcion"
            placeholder="Escribe la descripción del ticket aquí..."
            value={formData.descripcion}
            rows={4}
            onChange={(e) => set("descripcion", e.target.value)}
            className="resize-none" // Opcional: evita que el usuario cambie el tamaño manualmente
          />
        </Field>
        <Field>
          <div className="flex items-center justify-between w-full h-12 px-3 border rounded-lg bg-card shadow-sm">
            <div className="flex items-center gap-2">
              {/* Label con ayuda contextual al lado */}
              <Label
                htmlFor="revision"
                className="text-sm font-medium cursor-pointer"
              >
                ¿Requiere revisión?
              </Label>

              <HoverCard openDelay={200}>
                <HoverCardTrigger asChild>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <CircleHelp className="h-4 w-4" />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent side="top" align="start" className="w-80 p-4">
                  <div className="flex flex-col gap-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Proceso de Verificación
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Si activas esta opción, el ticket pasará por una etapa de
                      validación antes de marcarse como resuelto. Ideal para
                      tareas críticas.
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>

            <Switch
              id="revision"
              checked={formData.revision}
              onCheckedChange={(checked) => set("revision", checked)}
            />
          </div>
        </Field>
      </div>
    </form>
  );
}
