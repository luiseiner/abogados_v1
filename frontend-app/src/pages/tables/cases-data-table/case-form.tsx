"use client";

import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Calendar } from "@/components/ui/calendar";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CircleArrowDown,
  CircleArrowRight,
  CircleArrowUp,
  CircleCheck,
  CircleDot,
  CircleDotDashed,
  CircleX,
  Flame,
  Calendar as CalendarIcon,
} from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientCombobox } from "@/components/client-combobox";
import { MultiUserCombobox } from "@/components/multi-users-combobox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Caso } from "@/types/caseTypes";

interface CaseRegistrationFormProps {
  onSuccess?: (formData: any) => void;
  onCancel?: () => void;
  initialData?: Partial<Caso>;
}

export function CaseRegistrationForm({
  onSuccess,
  initialData,
}: CaseRegistrationFormProps) {
  const [formData, setFormData] = useState({
    cliente_id: initialData?.cliente_id ?? 0,
    expediente: initialData?.expediente ?? "",
    resumen: initialData?.resumen ?? "",
    objetivo: initialData?.objetivo ?? {
      objetivo: "",
      estrategia: "",
      tiempo: "",
      dificultades: "",
      planb: "",
    },
    plazo: initialData?.plazo ?? "",
    prioridad: initialData?.prioridad ?? "media",
    estado: initialData?.estado ?? "registrado",
    asignados_ids: initialData?.asignados
      ? initialData.asignados.map((u: any) => u.usuario_id || u.id)
      : [],
  });
  // const [date, setDate] = useState<Date>();
  const [date, setDate] = useState<Date | undefined>(
    initialData?.plazo ? new Date(initialData.plazo) : undefined, // 👈
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (onSuccess) {
      const submitData = {
        ...formData,
        plazo: date ? format(date, "yyyy-MM-dd") : null,
        asignados: formData.asignados_ids.map((id) => ({
          usuario_id: id,
          acceso: "can_view" as const, // acceso por defecto
        })),
      };

      // eliminar el campo viejo antes de enviar
      delete (submitData as any).asignados_ids;

      onSuccess(submitData);
    }
  };

  return (
    <form id="case-registration-form" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <Field>
          <FieldLabel htmlFor="cliente">Cliente</FieldLabel>
          <ClientCombobox
            value={formData.cliente_id || undefined}
            onChange={(cliente) => {
              setFormData((prev) => ({
                ...prev,
                cliente_id: cliente.id,
              }));
              setErrors((prev) => ({ ...prev, cliente_id: "" }));
            }}
          />
          {errors.cliente_id && (
            <FieldDescription className="text-sm text-red-600 dark:text-red-400">
              {errors.cliente_id}
            </FieldDescription>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="expediente">Expediente</FieldLabel>
          <Input
            id="expediente"
            type="text"
            placeholder="Ingrese el número de expediente."
            value={formData.expediente}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                expediente: e.target.value,
              }));
              setErrors((prev) => ({ ...prev, expediente: "" }));
            }}
          />
          {errors.expediente && (
            <FieldDescription className="text-sm text-red-600 dark:text-red-400">
              {errors.expediente}
            </FieldDescription>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="resumen">Resumen</FieldLabel>
          <Textarea
            id="resumen"
            className="wrap-break-word overflow-wrap-anywhere break-all"
            placeholder="Redacte el resumen del caso."
            value={formData.resumen}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                resumen: e.target.value,
              }));
              setErrors((prev) => ({ ...prev, resumen: "" }));
            }}
          />
          {errors.resumen && (
            <FieldDescription className="text-sm text-red-600 dark:text-red-400">
              {errors.resumen}
            </FieldDescription>
          )}
        </Field>
        <div className="flex flex-col md:flex-row gap-2">
          <Field>
            <FieldLabel htmlFor="plazo">Plazo</FieldLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date-picker-simple"
                  className="justify-between font-normal"
                >
                  {date ? (
                    format(date, "PPP", { locale: es })
                  ) : (
                    <span>Selecciona una fecha</span>
                  )}
                  <CalendarIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    setDate(newDate);
                    setErrors((prev) => ({ ...prev, plazo: "" }));
                  }}
                  defaultMonth={date}
                  locale={es}
                  disabled={(date) => {
                    const today = new Date();
                    return date < new Date(today.setHours(0, 0, 0, 0));
                  }}
                  formatters={{
                    formatCaption: (date) =>
                      capitalize(format(date, "LLLL yyyy", { locale: es })),
                  }}
                />
              </PopoverContent>
            </Popover>
            {errors.plazo && (
              <FieldDescription className="text-sm text-red-600 dark:text-red-400">
                {errors.plazo}
              </FieldDescription>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="prioridad">Prioridad</FieldLabel>
            <Select
              defaultValue="Media"
              onValueChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  prioridad: value,
                }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona la prioridad del caso" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Prioridad</SelectLabel>
                  <SelectItem value="Baja">
                    <CircleArrowDown className="text-green-600 dark:text-green-400" />
                    Baja
                  </SelectItem>
                  <SelectItem value="Media">
                    <CircleArrowRight className="text-amber-600 dark:text-amber-400" />
                    Media
                  </SelectItem>
                  <SelectItem value="Alta">
                    <CircleArrowUp className="text-red-600 dark:text-red-400" />
                    Alta
                  </SelectItem>
                  <SelectItem value="Urgente">
                    <Flame className="text-purple-600 dark:text-purple-400" />
                    Urgente
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Tabs defaultValue="assignment">
          <TabsList variant="line" className="w-full">
            <TabsTrigger value="assignment">Asignación</TabsTrigger>
            <TabsTrigger value="case-plan">Plan del caso</TabsTrigger>
            {/* <TabsTrigger value="files">Documentos</TabsTrigger> */}
          </TabsList>
          <TabsContent value="assignment">
            <Field>
              <FieldLabel htmlFor="asignar">Asignar a:</FieldLabel>
              <MultiUserCombobox
                value={formData.asignados_ids}
                onChange={(ids) => {
                  setFormData((prev) => ({
                    ...prev,
                    asignados_ids: ids as number[],
                  }));
                  setErrors((prev) => ({ ...prev, asignados_ids: "" }));
                }}
              />
              {errors.asignados_ids && (
                <FieldDescription className="text-sm text-red-600 dark:text-red-400">
                  {errors.asignados_ids}
                </FieldDescription>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="estado">Estado</FieldLabel>
              <Select
                defaultValue="registrado"
                onValueChange={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    estado: value,
                  }));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona la prioridad del caso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Estados</SelectLabel>
                    <SelectItem value="registrado">
                      <CircleDot className="text-sky-600 dark:text-sky-400" />
                      Registrado
                    </SelectItem>
                    <SelectItem value="en_progreso">
                      <CircleDotDashed className="text-amber-600 dark:text-amber-400" />
                      En proceso
                    </SelectItem>
                    <SelectItem value="cerrado">
                      <CircleCheck className="text-green-600 dark:text-green-400" />
                      Cerrado
                    </SelectItem>
                    <SelectItem value="cancelado">
                      <CircleX className="text-red-600 dark:text-red-400" />
                      Cancelado
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </TabsContent>
          <TabsContent value="case-plan" className="overflow-auto">
            <Field>
              <FieldLabel htmlFor="objetivo">Objetivo</FieldLabel>
              <Input
                id="objetivo"
                type="text"
                placeholder="Describa el objetivo del caso."
                value={formData.objetivo.objetivo}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    objetivo: { ...prev.objetivo, objetivo: e.target.value },
                  }));
                  setErrors((prev) => ({ ...prev, objetivo: "" }));
                }}
              />
              {errors.objetivo && (
                <FieldDescription className="text-sm text-red-600 dark:text-red-400">
                  {errors.objetivo}
                </FieldDescription>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="estrategia">Estrategia</FieldLabel>
              <Input
                id="estrategia"
                type="text"
                placeholder="Describa la estrategia..."
                value={formData.objetivo.estrategia}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    objetivo: { ...prev.objetivo, estrategia: e.target.value },
                  }))
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="tiempo">Tiempo</FieldLabel>
              <Input
                id="tiempo"
                type="text"
                placeholder="Tiempo estimado para el caso."
                value={formData.objetivo.tiempo}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    objetivo: { ...prev.objetivo, tiempo: e.target.value },
                  }))
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="dificultades">Dificultades</FieldLabel>
              <Input
                id="dificultades"
                placeholder="Describa las posibles dificultades del caso."
                value={formData.objetivo.dificultades}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    objetivo: {
                      ...prev.objetivo,
                      dificultades: e.target.value,
                    },
                  }))
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="plan-b">Plan B</FieldLabel>
              <Input
                id="plan-b"
                placeholder="Describa el plan B par el caso."
                value={formData.objetivo.planb}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    objetivo: { ...prev.objetivo, planb: e.target.value },
                  }))
                }
              />
            </Field>
          </TabsContent>
          {/* <TabsContent value="files">
            En porceso...
          </TabsContent> */}
        </Tabs>
      </div>
    </form>
  );
}
