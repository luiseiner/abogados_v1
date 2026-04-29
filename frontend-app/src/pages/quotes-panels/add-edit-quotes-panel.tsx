"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CalendarIcon,
  FileText,
  User,
  DollarSign,
  Trash2,
  CheckCircle,
  XCircle,
  Plus,
  Info,
  CircleQuestionMark,
} from "lucide-react";
import { format, addDays, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ClientCombobox } from "@/components/client-combobox";
import QuotePreviewHTML from "@/pages/quotes-panels/templates/basic-html-template";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import DatePickerWithinInputDemo from "@/components/shadcn-studio/date-picker/date-picker-04";

export interface CotizacionData {
  id?: number;
  codigoCotizacion?: string;
  cliente: {
    id?: number;
    nombre: string;
    email: string;
    telefono: string;
  };
  fechaVencimiento: Date | undefined;
  servicio: string;
  precio: string;
  moneda?: string;
  comentarios: string;
  queHaremos: string;
  queNoIncluye: string;
  comoVaAPagar: string;
  notas: string;
  pagosDivididos: Array<{
    nombre: string;
    porcentaje: number;
    cantidad: string;
    fechaVencimiento: string;
  }>;
}

const servicios = [
  "Consultoría Legal",
  "Asesoría Fiscal",
  "Auditoría Contable",
  "Gestión de Nóminas",
  "Constitución de Empresas",
  "Registro de Marcas",
  "Contratos Comerciales",
  "Otros",
];

const cotizacionSchema = z.object({
  cliente: z.object({
    id: z.number().optional(),
    nombre: z.string().min(1, "Debe seleccionar un cliente"),
    email: z.string().email("Email inválido").min(1, "Email es obligatorio"),
    telefono: z.string().min(1, "Teléfono es obligatorio"),
  }),
  servicio: z.string().min(1, "Debe seleccionar un servicio"),
  precio: z
    .string()
    .min(1, "Precio es obligatorio")
    .refine((val) => parseFloat(val) > 0, "El precio debe ser mayor a 0"),
  fechaVencimiento: z.date({ message: "Fecha de vencimiento es obligatoria" }),
  moneda: z.string().optional(),
  queHaremos: z.string().optional(),
  queNoIncluye: z.string().optional(),
  comoVaAPagar: z.string().optional(),
  notas: z.string().optional(),
});

type FormData = z.infer<typeof cotizacionSchema>;

export default function CotizacionPanel({
  onClose,
  initialData,
}: {
  onClose?: () => void;
  initialData?: Partial<CotizacionData> & { id?: number };
}) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(cotizacionSchema),
    defaultValues: {
      cliente: {
        nombre: "",
        email: "",
        telefono: "",
      },
      servicio: "",
      precio: "",
      fechaVencimiento: undefined,
      moneda: "PEN",
      queHaremos: "",
      queNoIncluye: "",
      comoVaAPagar: "",
      notas: "",
    },
  });
  const navigate = useNavigate();
  const { id } = useParams();
  const [cotizacion, setCotizacion] = useState<CotizacionData>({
    cliente: {
      nombre: "",
      email: "",
      telefono: "",
    },
    fechaVencimiento: undefined,
    servicio: "",
    precio: "",
    comentarios: "",
    queHaremos: "",
    queNoIncluye: "",
    comoVaAPagar: "",
    notas: "",
    pagosDivididos: [
      { nombre: "Pago 1", porcentaje: 50, cantidad: "", fechaVencimiento: "" },
      { nombre: "Pago 2", porcentaje: 50, cantidad: "", fechaVencimiento: "" },
    ],
  });
  const [vencimientoTipo, setVencimientoTipo] = useState<string>(""); // "3", "7", "15", "otro"
  const [servicioPersonalizado, setServicioPersonalizado] = useState("");
  const [servicioSelect, setServicioSelect] = useState<string>("");
  const [pagosDivididos, setPagosDivididos] = useState(false);
  // esto es para mostrar los contenedores de las secciones
  const [notasImportantes, setNotas] = useState(false);
  const [honorarios, setHonorarios] = useState(false);
  
  const [tipoPago, setTipoPago] = useState("cantidad");
  const [isEditMode, setIsEditMode] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const onSubmit = async (data: FormData) => {
    // Validar pagos divididos si están activos
    if (pagosDivididos) {
      const totalPorcentaje = tablaPagos.reduce(
        (sum, pago) => sum + (pago.porcentaje || 0),
        0
      );
      const totalRedondeado = roundToTwoDecimals(totalPorcentaje);

      // Permitir una pequeña tolerancia debido a errores de redondeo
      if (Math.abs(totalRedondeado - 100) > 0.01) {
        toast.error(
          "Los porcentajes de pagos divididos deben sumar exactamente 100%"
        );
        return;
      }

      // Recalcular montos antes de enviar
      const precioActual = data.precio || "0";
      tablaPagos.forEach((pago) => {
        pago.cantidad = calcularCantidadPago(precioActual, pago.porcentaje);
      });
    }

    const payload = {
      cliente_id: data.cliente.id,
      email: data.cliente.email,
      telefono: data.cliente.telefono,
      fecha_vencimiento: data.fechaVencimiento
        ? data.fechaVencimiento.toISOString().split("T")[0]
        : null,
      servicio: data.servicio,
      precio: parseFloat(data.precio) || 0,
      cotizacion_moneda: data.moneda || "PEN",
      comentarios: data.comoVaAPagar || "",
      detalle_servicio: data.queHaremos || "",
      exclusiones: data.queNoIncluye || "",
      notas: data.notas || "",
      cuotas: pagosDivididos && tablaPagos.length > 0
        ? tablaPagos.map((pago) => ({
          nombre_cuota: pago.nombre,
          monto: parseFloat(pago.cantidad) || 0,
          porcentaje: pago.porcentaje,
          fecha_vencimiento: pago.fechaVencimiento || null,
          estado_pago: "Pendiente"
        }))
        : []
    };

    try {
      if (isEditMode && id) {
        await axios.put(
          `${API_URL}/capitalfarmer.co/api/v1/cotizaciones/${id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await axios.post(
          `${API_URL}/capitalfarmer.co/api/v1/cotizaciones`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success("Cotización creada exitosamente");
      }
      if (onClose) onClose();
      else navigate("/home/quotes");
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.error("Error al guardar la cotización. Inténtalo de nuevo.");
    }
  };

  const agregarPago = () => {
    setTablaPagos((prev) => [
      ...prev,
      {
        nombre: `Pago ${prev.length + 1}`,
        porcentaje: 0,
        cantidad: "",
        fechaVencimiento: "",
      },
    ]);
  };

  const prevCotizacionRef = useRef<CotizacionData | null>(null);

  useEffect(() => {
    if (prevCotizacionRef.current !== cotizacion) {
      prevCotizacionRef.current = cotizacion;
    }
  }, [cotizacion]);

  const eliminarPago = (index: number) => {
    if (tablaPagos.length > 1) {
      setTablaPagos((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // --- FUNCIONES DE PAGO DIVIDIDO ---
  const roundToTwoDecimals = (num: number): number => {
    return Math.round(num * 100) / 100;
  };

  const calcularCantidadPago = (precio: string, porcentaje: number) => {
    const precioNum = parseFloat(precio) || 0;
    const cantidad = (precioNum * porcentaje) / 100;
    return roundToTwoDecimals(cantidad).toFixed(2);
  };

  const calcularPorcentajePago = (precio: string, cantidad: string) => {
    const precioNum = parseFloat(precio) || 0;
    const cantidadNum = parseFloat(cantidad) || 0;
    if (precioNum === 0) return 0;
    const porcentaje = (cantidadNum / precioNum) * 100;
    return roundToTwoDecimals(porcentaje);
  };

  const handlePagoChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setTablaPagos((prev) => {
      const precioFormulario = watch("precio") || "0";
      const pagos = [...prev];

      if (field === "porcentaje") {
        // Actualizar solo el porcentaje y cantidad del pago actual
        const nuevoPorcentaje = roundToTwoDecimals(Number(value));
        pagos[index].porcentaje = nuevoPorcentaje;
        pagos[index].cantidad = calcularCantidadPago(
          precioFormulario,
          nuevoPorcentaje
        );
      } else if (field === "cantidad") {
        // Actualizar solo la cantidad y porcentaje del pago actual
        const nuevaCantidad = value.toString();
        pagos[index].cantidad = nuevaCantidad;
        pagos[index].porcentaje = calcularPorcentajePago(
          precioFormulario,
          nuevaCantidad
        );
      } else if (field === "nombre" && typeof value === "string") {
        pagos[index].nombre = value;
      } else if (field === "fechaVencimiento" && typeof value === "string") {
        pagos[index].fechaVencimiento = value;
      }

      return pagos;
    });
  };

  const [tablaPagos, setTablaPagos] = useState([
    { nombre: "Pago 1", porcentaje: 50, cantidad: "", fechaVencimiento: "" },
    { nombre: "Pago 2", porcentaje: 50, cantidad: "", fechaVencimiento: "" },
  ]);

  const { token } = useAuth();

  function parseDateAsLocal(dateString: string): Date {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day, 12, 0, 0, 0); // 12:00 para evitar desfase
  }

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      (async () => {
        try {
          const res = await axios.get(
            `${API_URL}/capitalfarmer.co/api/v1/cotizaciones/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = res.data;
          const fechaVencimiento = data.fecha_vencimiento
            ? parseDateAsLocal(data.fecha_vencimiento)
            : undefined;

          reset({
            cliente: {
              id: data.cliente_id,
              nombre: `${data.cliente.nombre || ''} ${data.cliente.apellido || ''}`.trim(),
              email: data.email || "",
              telefono: data.telefono || "",
            },
            fechaVencimiento,
            servicio: data.servicio || "",
            precio: data.precio?.toString() || "",
            moneda: data.cotizacion_moneda || "PEN",
            queHaremos: data.detalle_servicio || "",
            queNoIncluye: data.exclusiones || "",
            comoVaAPagar: data.comentarios || "",
            notas: data.notas || "",
          });

          // Servicio
          let servicioSelectValue = "";
          let servicioPersonalizadoValue = "";
          if (!servicios.includes(data.servicio)) {
            servicioSelectValue = "Otros";
            servicioPersonalizadoValue = data.servicio || "";
          } else {
            servicioSelectValue = data.servicio || "";
            servicioPersonalizadoValue = "";
          }
          setServicioSelect(servicioSelectValue);
          setServicioPersonalizado(servicioPersonalizadoValue);

          // Vencimiento
          let vencimientoTipoValue = "otro";
          if (fechaVencimiento) {
            const fecha = new Date(fechaVencimiento);
            fecha.setHours(12, 0, 0, 0);
            if (isSameDay(fecha, addDays(new Date(), 3))) {
              vencimientoTipoValue = "3";
            } else if (isSameDay(fecha, addDays(new Date(), 7))) {
              vencimientoTipoValue = "7";
            } else if (isSameDay(fecha, addDays(new Date(), 15))) {
              vencimientoTipoValue = "15";
            }
          }
          setVencimientoTipo(vencimientoTipoValue);

          // Pagos divididos
          const cuotas = (data.cuotas || []).map(
            (cuota: {
              nombre_cuota: string;
              porcentaje: number;
              monto: number;
              fecha_vencimiento: string;
            }) => ({
              nombre: cuota.nombre_cuota,
              porcentaje: cuota.porcentaje,
              cantidad: cuota.monto.toString(),
              fechaVencimiento: cuota.fecha_vencimiento || "",
            })
          );
          if (cuotas.length > 0) {
            setPagosDivididos(true);
            setTablaPagos(cuotas);
          } else {
            setPagosDivididos(false);
            setTablaPagos([
              {
                nombre: "Pago 1",
                porcentaje: 50,
                cantidad: "",
                fechaVencimiento: "",
              },
              {
                nombre: "Pago 2",
                porcentaje: 50,
                cantidad: "",
                fechaVencimiento: "",
              },
            ]);
          }

          setCotizacion({
            id: data.id,
            codigoCotizacion: data.codigo_cotizacion || "COT-XXXXXXFCT",
            cliente: {
              nombre: data.nombre_cliente || "",
              email: data.email || "",
              telefono: data.telefono || "",
            },
            fechaVencimiento,
            servicio: data.servicio || "",
            precio: data.precio?.toString() || "",
            comentarios: data.comentarios || "",
            queHaremos: data.detalle_servicio || "",
            queNoIncluye: data.exclusiones || "",
            comoVaAPagar: data.comentarios || "",
            notas: data.notas || "",
            pagosDivididos: cuotas,
            moneda: data.cotizacion_moneda || "PEN",
          });
        } catch {
          toast.error("Error al cargar la cotización");
        }
      })();
    } else if (initialData) {
      reset({
        cliente: {
          nombre: initialData.cliente?.nombre || "",
          email: initialData.cliente?.email || "",
          telefono: initialData.cliente?.telefono || "",
        },
        fechaVencimiento: initialData.fechaVencimiento
          ? new Date(initialData.fechaVencimiento)
          : undefined,
        servicio: initialData.servicio || "",
        precio: initialData.precio || "",
        moneda: initialData.moneda || "PEN",
        queHaremos: initialData.queHaremos || "",
        queNoIncluye: initialData.queNoIncluye || "",
      });
      setServicioSelect(initialData.servicio || "");
    }
  }, [id, initialData, token, reset, API_URL]);

  useEffect(() => {
    if (pagosDivididos) {
      // Si se activa y la tabla está vacía, inicializa con dos pagos por defecto
      if (tablaPagos.length === 0) {
        const precioActual = watch("precio") || "0";
        setTablaPagos([
          {
            nombre: "Pago 1",
            porcentaje: 50,
            cantidad: calcularCantidadPago(precioActual, 50),
            fechaVencimiento: "",
          },
          {
            nombre: "Pago 2",
            porcentaje: 50,
            cantidad: calcularCantidadPago(precioActual, 50),
            fechaVencimiento: "",
          },
        ]);
      }
      // Si ya hay pagos, no los borres (así el botón Agregar Pago funciona siempre)
    } else {
      // Si se desactiva, limpia la tabla de pagos
      setTablaPagos([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagosDivididos]);

  useEffect(() => {
    setCotizacion((prev) => ({
      ...prev,
      pagosDivididos: tablaPagos,
    }));
  }, [tablaPagos]);

  // Sincronizar datos básicos del formulario con cotización para previsualización
  const clienteNombre = watch("cliente.nombre");
  const clienteEmail = watch("cliente.email");
  const clienteTelefono = watch("cliente.telefono");
  const servicio = watch("servicio");
  const precio = watch("precio");
  const moneda = watch("moneda");
  const queHaremos = watch("queHaremos");
  const queNoIncluye = watch("queNoIncluye");
  const comoVaAPagar = watch("comoVaAPagar");
  const notas = watch("notas");
  const fechaVencimiento = watch("fechaVencimiento");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCotizacion((prev) => ({
        ...prev,
        cliente: {
          ...prev.cliente,
          nombre: clienteNombre || prev.cliente.nombre,
          email: clienteEmail || prev.cliente.email,
          telefono: clienteTelefono || prev.cliente.telefono,
        },
        fechaVencimiento: fechaVencimiento || prev.fechaVencimiento,
        servicio: servicio || prev.servicio,
        precio: precio || prev.precio,
        moneda: moneda || prev.moneda,
        queHaremos: queHaremos || prev.queHaremos,
        queNoIncluye: queNoIncluye || prev.queNoIncluye,
      }));
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [
    clienteNombre,
    clienteEmail,
    clienteTelefono,
    servicio,
    precio,
    moneda,
    queHaremos,
    queNoIncluye,
    comoVaAPagar,
    notas,
    fechaVencimiento,
  ]);

  useEffect(() => {
    // Sincroniza el select de servicio
    if (cotizacion.servicio && servicios.includes(cotizacion.servicio)) {
      if (servicioSelect !== cotizacion.servicio) {
        setServicioSelect(cotizacion.servicio);
        setServicioPersonalizado("");
      }
    } else if (
      cotizacion.servicio &&
      !servicios.includes(cotizacion.servicio)
    ) {
      if (
        servicioSelect !== "Otros" ||
        servicioPersonalizado !== cotizacion.servicio
      ) {
        setServicioSelect("Otros");
        setServicioPersonalizado(cotizacion.servicio);
      }
    }

    // Sincroniza el select de vencimiento
    if (cotizacion.fechaVencimiento) {
      const fecha = new Date(cotizacion.fechaVencimiento);
      fecha.setHours(12, 0, 0, 0);

      let vencimientoTipoValue = "otro";
      if (isSameDay(fecha, addDays(new Date(), 3))) {
        vencimientoTipoValue = "3";
      } else if (isSameDay(fecha, addDays(new Date(), 7))) {
        vencimientoTipoValue = "7";
      } else if (isSameDay(fecha, addDays(new Date(), 15))) {
        vencimientoTipoValue = "15";
      }

      if (vencimientoTipo !== vencimientoTipoValue) {
        setVencimientoTipo(vencimientoTipoValue);
      }
    } else {
      if (vencimientoTipo !== "") {
        setVencimientoTipo("");
      }
    }
  }, [cotizacion.servicio, cotizacion.fechaVencimiento]);

  const handleSalir = () => {
    if (
      confirm(
        "¿Estás seguro de que quieres salir? Los cambios no guardados se perderán."
      )
    ) {
      navigate("/home/quotes");
    }
  };

  useEffect(() => {
    setHonorarios(!!comoVaAPagar);
    setNotas(!!notas);
  }, [comoVaAPagar, notas]);

  return (
    <div className="fixed inset-0  z-50 p-4 pb-20 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold ">
            {isEditMode ? "Editar Cotización" : "Crear Cotización"}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulario */}
          <Card className="flex-1 h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Formulario de Cotización
              </CardTitle>
              <CardDescription>
                Completa los datos para generar una nueva cotización
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Datos del Cliente */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-4 w-4" />
                    <h3 className="text-lg font-semibold">Datos del Cliente</h3>
                  </div>

                  <div className="space-y-2">
                    {isEditMode ? (
                      <Controller
                        name="cliente.nombre"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            readOnly
                            className="bg-gray-100 cursor-not-allowed"
                          />
                        )}
                      />
                    ) : (
                      <>
                        <Label htmlFor="nombre">
                          Seleccione Cliente | Empresa *
                        </Label>
                        <Controller
                          name="cliente"
                          control={control}
                          render={({ field }) => (
                            <div>
                              <ClientCombobox
                                // value={
                                //   field.value
                                //     ? {
                                //       id: field.value.id || 0,
                                //       nombre: field.value.nombre,
                                //       apellido: "",
                                //       correo: field.value.email,
                                //       telefono: field.value.telefono,
                                //     }
                                //     : null
                                // }
                                value={field.value?.id || null}
                                onChange={(cliente) => {
                                  if (cliente) {
                                    field.onChange({
                                      id: cliente.id || undefined,
                                      nombre: cliente.nombre || "",
                                      email: cliente.correo || "",
                                      telefono: cliente.telefono || "",
                                    });
                                    // También actualizar email y teléfono en el formulario
                                    setValue(
                                      "cliente.email",
                                      cliente.correo || ""
                                    );
                                    setValue(
                                      "cliente.telefono",
                                      cliente.telefono || ""
                                    );
                                  }
                                }}
                              />
                              {errors.cliente?.nombre && (
                                <p className="text-sm text-red-600 mt-1">
                                  {errors.cliente.nombre.message}
                                </p>
                              )}
                            </div>
                          )}
                        />
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Controller
                        name="cliente.email"
                        control={control}
                        render={({ field }) => (
                          <div>
                            <Input
                              {...field}
                              type="email"
                              placeholder="empresa@email.com"
                              className={
                                errors.cliente?.email ? "border-red-500" : ""
                              }
                            />
                            {errors.cliente?.email && (
                              <p className="text-sm text-red-600 mt-1">
                                {errors.cliente.email.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono *</Label>
                      <Controller
                        name="cliente.telefono"
                        control={control}
                        render={({ field }) => (
                          <div>
                            <Input
                              {...field}
                              placeholder="+51 900 000 000"
                              className={
                                errors.cliente?.telefono ? "border-red-500" : ""
                              }
                            />
                            {errors.cliente?.telefono && (
                              <p className="text-sm text-red-600 mt-1">
                                {errors.cliente.telefono.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <Separator />
                {/* Detalles de la Cotización */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fecha de Vencimiento *</Label>
                      <Controller
                        name="fechaVencimiento"
                        control={control}
                        render={({ field }) => (
                          <div>
                            <Select
                              value={vencimientoTipo}
                              onValueChange={(value) => {
                                setVencimientoTipo(value);
                                if (value === "otro") {
                                  field.onChange(undefined);
                                } else {
                                  const dias = parseInt(value, 10);
                                  const nuevaFecha = addDays(new Date(), dias);
                                  field.onChange(nuevaFecha);
                                }
                              }}
                            >
                              <SelectTrigger
                                className={
                                  errors.fechaVencimiento
                                    ? "border-red-500"
                                    : ""
                                }
                              >
                                <SelectValue placeholder="Seleccionar plazo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="3">3 días</SelectItem>
                                <SelectItem value="7">7 días</SelectItem>
                                <SelectItem value="15">15 días</SelectItem>
                                <SelectItem value="otro">Otro</SelectItem>
                              </SelectContent>
                            </Select>
                            {vencimientoTipo === "otro" && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal mt-2",
                                      !field.value && "text-muted-foreground",
                                      errors.fechaVencimiento &&
                                      "border-red-500"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? (
                                      format(field.value, "PPP", { locale: es })
                                    ) : (
                                      <span>Seleccionar fecha</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            )}
                            {errors.fechaVencimiento && (
                              <p className="text-sm text-red-600 mt-1">
                                {errors.fechaVencimiento.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="servicio">Servicio *</Label>
                      <Controller
                        name="servicio"
                        control={control}
                        render={({ field }) => (
                          <div>
                            <Select
                              value={servicioSelect}
                              onValueChange={(value) => {
                                setServicioSelect(value);
                                if (value !== "Otros") {
                                  field.onChange(value);
                                  setServicioPersonalizado("");
                                } else {
                                  field.onChange("");
                                  setServicioPersonalizado("");
                                }
                              }}
                            >
                              <SelectTrigger
                                className={
                                  errors.servicio ? "border-red-500" : ""
                                }
                              >
                                <SelectValue placeholder="Seleccionar servicio" />
                              </SelectTrigger>
                              <SelectContent>
                                {servicios.map((servicio) => (
                                  <SelectItem key={servicio} value={servicio}>
                                    {servicio}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {servicioSelect === "Otros" && (
                              <Input
                                className={`mt-2 ${errors.servicio ? "border-red-500" : ""
                                  }`}
                                placeholder="Especifica el servicio"
                                value={servicioPersonalizado}
                                onChange={(e) => {
                                  setServicioPersonalizado(e.target.value);
                                  field.onChange(e.target.value);
                                }}
                              />
                            )}
                            {errors.servicio && (
                              <p className="text-sm text-red-600 mt-1">
                                {errors.servicio.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="honorarios"
                      className="flex items-center gap-2"
                    >
                      <DollarSign className="h-4 w-4" />
                      Precio del servicio *
                    </Label>
                    <div className="flex gap-2">
                      <Controller
                        name="precio"
                        control={control}
                        render={({ field }) => (
                          <div className="flex-1">
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className={errors.precio ? "border-red-500" : ""}
                            />
                            {errors.precio && (
                              <p className="text-sm text-red-600 mt-1">
                                {errors.precio.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                      <Controller
                        name="moneda"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value || "PEN"}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-[90px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PEN">S/ PEN</SelectItem>
                              <SelectItem value="USD">$ USD</SelectItem>
                              <SelectItem value="EUR">€ EUR</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Dividir pagos
                      </Label>
                      <Switch
                        checked={pagosDivididos}
                        onCheckedChange={setPagosDivididos}
                      />
                    </div>

                    {pagosDivididos && (
                      <div className="space-y-4 border rounded-lg p-4 ">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Calendario de Pagos</h4>
                          <Select value={tipoPago} onValueChange={setTipoPago}>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Seleccionar tipo de pago" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="cantidad">Cantidad ($)</SelectItem>
                                <SelectItem value="porcentaje">Porcentaje (%)</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={agregarPago}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Agregar Pago
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {tablaPagos.map((pago, index) => (
                            <div
                              key={index}
                              className="grid grid-cols-12 gap-2 items-center  p-3 rounded border"
                            >
                              <div className="col-span-3">
                                <Input
                                  placeholder="Nombre del pago"
                                  value={pago.nombre}
                                  onChange={(e) =>
                                    handlePagoChange(
                                      index,
                                      "nombre",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                              <div className="col-span-2">
                                <Input
                                  type="number"
                                  placeholder="%"
                                  value={pago.porcentaje}
                                  disabled={tipoPago === "cantidad"}
                                  onChange={(e) => {
                                    const porcentaje =
                                      Number.parseFloat(e.target.value) || 0;
                                    handlePagoChange(
                                      index,
                                      "porcentaje",
                                      porcentaje
                                    );
                                  }}
                                />
                              </div>
                              <div className="col-span-2">
                                <Input
                                  type="number"
                                  placeholder="S/ 0.00"
                                  value={pago.cantidad}
                                  disabled={tipoPago === "porcentaje"}
                                  onChange={(e) =>
                                    handlePagoChange(
                                      index,
                                      "cantidad",
                                      e.target.value
                                    )
                                  }
                                  onBlur={(e) => {
                                    if (e.target.value === "") {
                                      handlePagoChange(
                                        index,
                                        "cantidad",
                                        ""
                                      );
                                    }
                                  }}
                                />
                              </div>
                              <div className="col-span-4">
                                <DatePickerWithinInputDemo
                                  value={pago.fechaVencimiento}
                                  onChange={(e) =>
                                    handlePagoChange(
                                      index,
                                      "fechaVencimiento",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>

                              <div className="col-span-1">
                                {tablaPagos.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => eliminarPago(index)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="text-sm  rounded">
                          <strong>Total porcentajes:</strong>{" "}
                          {tablaPagos.reduce(
                            (sum, pago) => sum + (pago.porcentaje || 0),
                            0
                          )}
                          %
                          {tablaPagos.reduce(
                            (sum, pago) => sum + (pago.porcentaje || 0),
                            0
                          ) !== 100 && (
                              <span className="text-orange-600 ml-2">
                                ⚠️ Los porcentajes deben sumar 100%
                              </span>
                            )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="queHaremos"
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      ¿Qué haremos por usted?
                    </Label>
                    <Controller
                      name="queHaremos"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Ingrese comentarios adicionales aquí..."
                          rows={4}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="queNoIncluye"
                      className="flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4 text-red-600" />
                      ¿Qué no incluye la cotización?
                    </Label>
                    <Controller
                      name="queNoIncluye"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Especifica las limitaciones y exclusiones..."
                          rows={4}
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    Seccion: Honorarios y forma de pago
                  </Label>
                  <Switch
                    checked={honorarios}
                    onCheckedChange={setHonorarios}
                  />
                </div>
                {honorarios && (
                <div className="space-y-2">
                  <Label
                    htmlFor="queHaremos"
                    className="flex items-center gap-2"
                  >
                    <CircleQuestionMark className="h-4 w-4 text-blue-600" />
                    ¿Como va a pagar?
                  </Label>
                  <Controller
                    name="comoVaAPagar"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        placeholder="Ingrese comentarios adicionales aquí..."
                        rows={4}
                      />
                    )}
                  />
                </div>
                )}
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    Seccion: Notas importantes
                  </Label>
                  <Switch
                    checked={notasImportantes}
                    onCheckedChange={setNotas}
                  />
                </div>
                {notasImportantes && (
                <div className="space-y-2">
                  <Label
                    htmlFor="notas"
                    className="flex items-center gap-2"
                  >
                    <Info className="h-4 w-4 text-yellow-600" />
                    Notas importantes
                  </Label>
                  <Controller
                    name="notas"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        placeholder="Ingrese comentarios adicionales aquí..."
                        rows={4}
                      />
                    )}
                  />
                </div>
                )}
                {/* Barra inferior fija */}
                <div className="fixed bottom-0 left-0 right-0  bg-(--background) border-t border-gray-200 px-6 py-4 z-10">
                  <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleSalir}
                      className="cursor-pointer"
                    >
                      Salir
                    </Button>
                    <div className="flex items-center gap-4">
                      <Button type="submit" className="cursor-pointer">
                        Guardar
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
          {/* Previsualización */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Vista previa de la Cotización</CardTitle>
            </CardHeader>
            <CardContent className="p-0  overflow-y-hidden h-[850px]">
              {cotizacion ? (
                <div className="flex justify-center items-start overflow-x-hidden h-[850px]">
                  <div className="scale-75 origin-top">
                    <QuotePreviewHTML
                      cotizacion={cotizacion}
                      mostrarPagosDivididos={pagosDivididos}
                      mostrarComoVaAPagar={honorarios}
                      mostrarNotas={notasImportantes}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full py-10">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>Cargando vista previa...</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
