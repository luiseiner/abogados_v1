"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { type DateRange } from "react-day-picker";

import {
  columns,
  type Attendance,
} from "@/pages/tables/attendance-control-data-table/columns";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";

import {
  CalendarCheck,
  ClockCheck,
  FileUp,
  ChevronDown,
  Printer,
  ClockFading,
} from "lucide-react";
import { IconFileTypePdf, IconFileTypeXls } from "@tabler/icons-react";

import { DataTable } from "@/pages/tables/attendance-control-data-table/data-table";
import { format } from "date-fns/format";


export default function AttendanceControlPanel() {
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const API_URL = import.meta.env.VITE_API_URL;
  const { token } = useAuth();

  const today = new Date();

  const [range, setRange] = useState<DateRange | undefined>({
    from: today,
    to: today,
  });

  const [presentsToday, setPresentsToday] = useState<number>(0);
  const [porcentageToday, setPorcentageToday] = useState<number>(0);
  const [inPauseToday, setInPauseToday] = useState<number>(0);
  const [porcentagePauseToday, setPorcentagePauseToday] = useState<number>(0);
  const [onLeaveToday, setOnLeaveToday] = useState<number>(0);
  const [porcentageLeaveToday, setPorcentageLeaveToday] = useState<number>(0);

  type ExportMode = "year" | "month" | "range";

  const actualMonth = (new Date().getMonth() + 1).toString();
  const actualYear = new Date().getFullYear().toString();
  const [month, setMonth] = useState(actualMonth);
  const [year, setYear] = useState(actualYear);

  const [mode, setMode] = useState<ExportMode>("month");

  const [exportFormat, setExportFormat] = useState<string>("excel");
  const [isExporting, setIsExporting] = useState(false);

  const formatDate = (date: Date | undefined): string | null => {
    if (!date) return null;
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
    return adjustedDate.toISOString().split("T")[0];
  };


  const fetchAttendanceData = useCallback(async () => {
    try {
      setLoading(true);

      const params: any = {};
      if (range?.from) {
        params.fecha_inicio = formatDate(range.from);
      }
      if (range?.to) {
        params.fecha_fin = formatDate(range.to);
      }

      const response = await axios.get(
        `${API_URL}/capitalfarmer.co/api/v1/asistencias/all`,
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAttendanceData(response.data);
    } catch (error) {
      console.error("Error al obtener los datos de asistencia:", error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL, token, range]);

  const fetchPresentsToday = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API_URL}/capitalfarmer.co/api/v1/asistencias/resumen-diario`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPresentsToday(response.data.presentes.total);
      setPorcentageToday(response.data.presentes.porcentaje);
      setInPauseToday(response.data.en_pausa.total);
      setPorcentagePauseToday(response.data.en_pausa.porcentaje);
      setOnLeaveToday(response.data.con_licencia.total);
      setPorcentageLeaveToday(response.data.con_licencia.porcentaje);
    } catch (error) {
      console.error("Error al obtener el resumen de hoy:", error);
    }
  }, [API_URL, token]);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      let params = new URLSearchParams();

      // Construir parámetros según el modo
      if (mode === "year") {
        params.append("year", year);
      } else if (mode === "month") {
        params.append("month", month);
        params.append("year", year);
      } else if (mode === "range") {
        if (range?.from && range?.to) {
          params.append("startDate", range.from.toISOString());
          params.append("endDate", range.to.toISOString());
        } else {
          toast.error("Por favor selecciona un rango de fechas");
          setIsExporting(false);
          return;
        }
      }

      // Determinar el endpoint según el formato
      let endpoint = "";
      let fileName = "";

      if (exportFormat === "excel") {
        endpoint = `${API_URL}/capitalfarmer.co/api/v1/asistencias/exportar-excel`;
        fileName = `asistencias_${mode}_${year}${
          mode === "month" ? `_${month}` : ""
        }.xlsx`;
      } else if (exportFormat === "pdf") {
        endpoint = `${API_URL}/capitalfarmer.co/api/v1/asistencias/exportar-pdf`;
        fileName = `asistencias_${mode}_${year}${
          mode === "month" ? `_${month}` : ""
        }.pdf`;
      } else if (exportFormat === "print") {
        // Para imprimir, puedes abrir en una nueva ventana
        window.open(`/asistencias/imprimir?${params.toString()}`, "_blank");
        toast.success("Abriendo vista de impresión...");
        setIsExporting(false);
        return;
      }

      // Hacer la petición
      const response = await axios.get(`${endpoint}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });

      // Crear y descargar el archivo
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      toast.success(
        `Archivo ${exportFormat.toUpperCase()} generado exitosamente`
      );
    } catch (error) {
      console.error("Error al exportar:", error);
      toast.error("Error al exportar el archivo");
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAttendanceData();
      fetchPresentsToday();
    }
  }, [token, fetchAttendanceData, fetchPresentsToday]);

  const tabs = [
    {
      name: "PDF",
      value: "pdf",
      icon: IconFileTypePdf,
      iconColor: "text-red-600 dark:text-red-400",
      disabled: true,
    },
    {
      name: "Excel",
      value: "excel",
      icon: IconFileTypeXls,
      iconColor: "text-green-600 dark:text-green-400",
      disabled: false,
    },
    {
      name: "Imprimir",
      value: "print",
      icon: Printer,
      iconColor: "text-sky-600 dark:text-sky-400",
      disabled: true,
    },
  ];

  const resetExportFilters = () => {
    setMode("month");
    setMonth(actualMonth);
    setYear(actualYear);
    setExportFormat("excel");
    // Si también quieres resetear el rango de fechas al cerrar:
    // setRange({ from: today, to: today });
  };

  return (
    <div className="flex">
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Card group */}
          <div className="flex flex-col gap-6 mb-8 sm:flex-row">
            <Card className="flex-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm">Presentes hoy</CardTitle>
                <ClockCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                <div className="text-2xl font-bold">
                  {loading ? <Spinner /> : presentsToday}
                </div>
                <p className="text-xs text-muted-foreground">{porcentageToday}% del total</p>
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm">En pausa</CardTitle>
                <ClockFading className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                <div className="text-2xl font-bold">
                  {loading ? <Spinner /> : inPauseToday}
                </div>
                <p className="text-xs text-muted-foreground">{porcentagePauseToday}% del total</p>
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm">De licencia</CardTitle>
                <CalendarCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </CardHeader>
              <CardContent className="text-2xl font-bold">
                <div className="text-2xl font-bold">
                  {loading ? <Spinner /> : onLeaveToday}
                </div>
                <p className="text-xs text-muted-foreground">{porcentageLeaveToday}% del total</p>
              </CardContent>
            </Card>
          </div>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Registros de Asistencia</CardTitle>
              <CardDescription>
                Lista de registros de asistencia de los empleados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row mb-6 justify-end gap-2">
                <div className="w-full max-w-xs space-y-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="dates"
                        className="w-full justify-between font-normal"
                      >
                        {range?.from ? (
                          range.to ? (
                            <>
                              {format(range.from, "dd/MM/yyyy")} - {format(range.to, "dd/MM/yyyy")}
                            </>
                          ) : (
                            format(range.from, "dd/MM/yyyy")
                          )
                        ) : (
                          "Selecciona una fecha"
                        )}
                        <ChevronDown className="h-4 w-4 opacity-50"/>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="start"
                    >
                      <Calendar
                        mode="range"
                        selected={range}
                        defaultMonth={today}
                        onSelect={(range) => {
                          setRange(range);
                        }}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Dialog
                  onOpenChange={(open) => {
                    if (open) setMode("month");
                    else resetExportFilters();
                  }}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <FileUp className="mr-2 h-4 w-4" />
                      Exportar asitencia
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Exportar</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col space-y-3">
                      <div className="w-full md:w-auto space-y-3">
                        <Tabs
                          value={mode}
                          onValueChange={(v) => setMode(v as ExportMode)}
                        >
                          <TabsList className="h-10 w-full justify-start md:w-auto">
                            <TabsTrigger value="year">Año</TabsTrigger>
                            <TabsTrigger value="month">Mes</TabsTrigger>
                            <TabsTrigger value="range">Rango</TabsTrigger>
                          </TabsList>
                        </Tabs>

                        {mode === "year" && (
                          <Select value={year} onValueChange={setYear}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecciona un año" />
                            </SelectTrigger>
                            <SelectContent>
                              {[2023, 2024, 2025, 2026].map((y) => (
                                <SelectItem key={y} value={String(y)}>
                                  {y}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        {mode === "month" && (
                          <div className="flex gap-2">
                            <Select value={year} onValueChange={setYear}>
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Año" />
                              </SelectTrigger>
                              <SelectContent>
                                {[2024, 2025, 2026].map((y) => (
                                  <SelectItem key={y} value={String(y)}>
                                    {y}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select value={month} onValueChange={setMonth}>
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Mes" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value="1">Enero</SelectItem>
                                  <SelectItem value="2">Febrero</SelectItem>
                                  <SelectItem value="3">Marzo</SelectItem>
                                  <SelectItem value="4">Abril</SelectItem>
                                  <SelectItem value="5">Mayo</SelectItem>
                                  <SelectItem value="6">Junio</SelectItem>
                                  <SelectItem value="7">Julio</SelectItem>
                                  <SelectItem value="8">Agosto</SelectItem>
                                  <SelectItem value="9">Septiembre</SelectItem>
                                  <SelectItem value="10">Octubre</SelectItem>
                                  <SelectItem value="11">Noviembre</SelectItem>
                                  <SelectItem value="12">Diciembre</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        {mode === "range" && (
                          <div className="w-full space-y-2 md:w-auto">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  id="dates"
                                  className="w-full justify-between font-normal"
                                >
                                  {range?.from && range?.to
                                    ? `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`
                                    : "Slecciona una fecha"}
                                  <ChevronDown />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto overflow-hidden p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="range"
                                  selected={range}
                                  defaultMonth={today}
                                  onSelect={(range) => {
                                    setRange(range);
                                  }}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        )}
                      </div>

                      <div className="w-full md:w-auto">
                        <Tabs
                          value={exportFormat}
                          onValueChange={setExportFormat}
                        >
                          <TabsList className="h-10 w-full justify-start md:w-auto">
                            {tabs.map(
                              ({ icon: Icon, name, value, iconColor, disabled }) => (
                                <TabsTrigger
                                  key={value}
                                  value={value}
                                  disabled={disabled}
                                  className="flex items-center  px-2.5 sm:px-3"
                                >
                                  <Icon className={`${iconColor} ${disabled ? 'opacity-50' : ''}`} />
                                  {name}
                                </TabsTrigger>
                              )
                            )}
                          </TabsList>
                          {tabs.map((tab) => (
                            <TabsContent key={tab.value} value={tab.value}>
                              <p className="text-sm text-muted-foreground mt-2">
                                {tab.value === "pdf" &&
                                  "Exportar como documento PDF"}
                                {tab.value === "excel" &&
                                  "Exportar como hoja de cálculo Excel"}
                                {tab.value === "print" &&
                                  "Abrir vista de impresión"}
                              </p>
                            </TabsContent>
                          ))}
                        </Tabs>
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button
                          variant="outline"
                          
                        >
                          Cancelar
                          
                        </Button>
                      </DialogClose>
                      <Button
                        // onClick={() => {
                        //   toast.success("Exportando asistencia...");
                        // }}
                        onClick={handleExport}
                        disabled={isExporting}
                      >
                        {isExporting ? (
                            <>
                              <Spinner className="mr-2 h-4 w-4" />
                              Exportando...
                            </>
                          ) : (
                            "Confirmar"
                          )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <DataTable
                columns={columns}
                data={attendanceData}
                isLoading={loading}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
