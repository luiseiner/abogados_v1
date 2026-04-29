// SolicitudForm.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { solicitudesAPI } from "@/services/requestsService";
import type { CategoriaSolicitud } from "../../../types/requestsTypes";
import { toast } from "sonner";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { ListaArchivos } from "./file-list";
interface TipoSolicitud {
  id: number;
  nombre: string;
  categoria: CategoriaSolicitud;
  descripcion?: string;
}

interface SolicitudFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormValues {
  tipo_solicitud_id: string;
  motivo: string;
  fecha_inicio?: Date;
  fecha_fin?: Date;
  monto_solicitado?: string;
  archivos?: globalThis.File[];
}

const createSolicitudSchema = (categoria?: CategoriaSolicitud) => {
  const baseSchema = z.object({
    tipo_solicitud_id: z.string().min(1, "Debe seleccionar un tipo de solicitud"),
    motivo: z.string().min(10, "El motivo debe tener al menos 10 caracteres"),
    archivos: z.array(z.instanceof(globalThis.File)).optional().default([]), // <- agregar
  });

  if (categoria === "tiempo") {
    return baseSchema
      .extend({
        fecha_inicio: z.date({ message: "La fecha de inicio es requerida" }),
        fecha_fin: z.date({ message: "La fecha de fin es requerida" }),
      })
      .refine((data) => data.fecha_fin >= data.fecha_inicio, {
        message: "La fecha de fin debe ser posterior a la de inicio",
        path: ["fecha_fin"],
      });
  }

  if (categoria === "dinero") {
    return baseSchema.extend({
      monto_solicitado: z
        .string()
        .min(1, "El monto es requerido")
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
          message: "Debe ingresar un monto válido mayor a 0",
        }),
    });
  }
  return baseSchema;
};

export function SolicitudForm({ onSuccess, onCancel }: SolicitudFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTipos, setIsLoadingTipos] = useState(true);
  const [tiposSolicitud, setTiposSolicitud] = useState<TipoSolicitud[]>([]);
  const [categoriaActual, setCategoriaActual] = useState<
    CategoriaSolicitud | undefined
  >();

  const form = useForm<FormValues>({
    resolver: zodResolver(createSolicitudSchema(categoriaActual)),
    defaultValues: {
      tipo_solicitud_id: "",
      fecha_inicio: undefined,
      fecha_fin: undefined,
      monto_solicitado: "",
      motivo: "",
      archivos: [],
    },
  });

  const tipoSeleccionadoId = form.watch("tipo_solicitud_id");
  const tipoSeleccionado = tiposSolicitud.find(
    (t) => t.id.toString() === tipoSeleccionadoId,
  );

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        setIsLoadingTipos(true);
        const data = await solicitudesAPI.getTipos();
        setTiposSolicitud(data);
      } catch (error: any) {
        toast.error("Error al cargar los tipos de solicitud");
      } finally {
        setIsLoadingTipos(false);
      }
    };

    fetchTipos();
  }, []);

  useEffect(() => {
    if (tipoSeleccionado) {
      setCategoriaActual(tipoSeleccionado.categoria);
    }
  }, [tipoSeleccionado]);

  useEffect(() => {
    if (tipoSeleccionado) {
      setCategoriaActual(tipoSeleccionado.categoria);
    }
  }, [tipoSeleccionado]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {

      const archivos: globalThis.File[] = data.archivos ?? [];

      await solicitudesAPI.create({
        tipo_id: parseInt(data.tipo_solicitud_id),
        motivo: data.motivo.trim(),
        fecha_inicio:
          tipoSeleccionado?.categoria === "tiempo"
            ? data.fecha_inicio.toISOString().split("T")[0]
            : undefined,
        fecha_fin:
          tipoSeleccionado?.categoria === "tiempo"
            ? data.fecha_fin.toISOString().split("T")[0]
            : undefined,
        monto_solicitado:
          tipoSeleccionado?.categoria === "dinero"
            ? parseFloat(data.monto_solicitado)
            : undefined,
        archivos, // <- aquí
      });

      toast.success("Solicitud creada exitosamente");
      onSuccess();
    } catch (error: any) {
      toast.error("Error al crear solicitud:", error);

      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Error al crear la solicitud. Intente nuevamente.";

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingTipos) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">
          Cargando formulario...
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        {/* TIPO DE SOLICITUD */}
        <Controller
          name="tipo_solicitud_id"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Tipo de solicitud</FieldLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Seleccione el tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposSolicitud.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id.toString()}>
                      {tipo.nombre}{" "}
                      <span className="text-xs opacity-50">
                        ({tipo.categoria})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* CAMPOS DINÁMICOS POR CATEGORÍA */}
        {categoriaActual === "tiempo" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="fecha_inicio"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Fecha de inicio</FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-between font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value
                          ? format(field.value, "PPP", { locale: es })
                          : "Seleccione fecha"}
                        <CalendarIcon className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="fecha_fin"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Fecha de fin</FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-between font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value
                          ? format(field.value, "PPP", { locale: es })
                          : "Seleccione fecha"}
                        <CalendarIcon className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < (form.getValues("fecha_inicio") || new Date())
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        )}

        {categoriaActual === "dinero" && (
          <Controller
            name="monto_solicitado"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Monto solicitado</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <InputGroupText>S/</InputGroupText>
                  </InputGroupAddon>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        )}

        {/* MOTIVO CON CONTADOR DE CARACTERES */}
        {categoriaActual && (
          <Controller
            name="motivo"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Motivo de la solicitud</FieldLabel>
                <InputGroup>
                  <InputGroupTextarea
                    {...field}
                    placeholder="Explique el motivo..."
                    className="min-h-24 resize-none"
                  />
                  <InputGroupAddon align="block-end">
                    <InputGroupText className="tabular-nums text-[10px]">
                      {field.value?.length || 0} caracteres
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                <FieldDescription>
                  Mínimo 10 caracteres para procesar la solicitud.
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        )}
        {/* DOCUMENTOS DE SOPORTE */}
        {categoriaActual && (
          <Field>
            <FieldLabel>Adjuntar archivos</FieldLabel>
            <Controller
              name="archivos"
              control={form.control}
              render={({ field }) => (
                <div className="space-y-3">
                  {/* Zona de drop */}
                  <label
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 px-6 py-2 cursor-pointer transition-colors",
                      "hover:border-primary/50 hover:bg-muted/30",
                    )}
                  >
                    <input
                      type="file"
                      multiple
                      className="sr-only"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const nuevos = Array.from(e.target.files ?? []);
                        field.onChange([...(field.value ?? []), ...nuevos]);
                        e.target.value = ""; // reset para permitir re-subir el mismo archivo
                      }}
                    />
                    <div className="flex flex-col items-center gap-1 text-center">
                      <div className="rounded-full bg-muted p-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-muted-foreground"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                          />
                        </svg>
                      </div>
                    </div>
                  </label>

                  {/* Lista de archivos seleccionados */}
                  {(field.value as globalThis.File[] | undefined)?.length ? (
                    <ListaArchivos
                      archivos={(field.value as globalThis.File[]) ?? []}
                      onRemove={(index) => {
                        const actualizados = (
                          field.value as globalThis.File[]
                        ).filter((_, i) => i !== index);
                        field.onChange(actualizados);
                      }}
                    />
                  ) : null}
                </div>
              )}
            />
            <FieldDescription>
              Adjunta los documentos que respalden tu solicitud.
            </FieldDescription>
          </Field>
        )}
      </FieldGroup>

      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || !categoriaActual}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? "Enviando..." : "Crear solicitud"}
        </Button>
      </div>
    </form>
  );
}
