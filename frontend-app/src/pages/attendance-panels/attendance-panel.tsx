"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import axios, { AxiosError } from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  columns,
  type Attendance,
} from "@/pages/tables/attendance-data-table/columns";
import { DataTable } from "@/pages/tables/attendance-data-table/data-table";
import { CirclePlay, CirclePause, CircleStop, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ConfirmActionDialog } from "./components/confirm-action-sialog";

type AttendanceStatus =
  | "sin_registro"
  | "presente"
  | "en_pausa"
  | "post_pausa"
  | "finalizado"
  | "permiso";

export default function AttendancePanel() {
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const API_URL = import.meta.env.VITE_API_URL;
  const { token } = useAuth();

  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [attendanceStatus, setAttendanceStatus] =
    useState<AttendanceStatus>("sin_registro");

  // Función para obtener el estado actual de asistencia
  const fetchAttendanceStatus = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get(
        `${API_URL}/capitalfarmer.co/api/v1/asistencias/tiempo-transcurrido`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setTimeElapsed(response.data.tiempo_transcurrido);
      setIsTimerRunning(response.data.esta_activo);

      // Obtener el estado actual de la asistencia
      setAttendanceStatus(response.data.estado);
    } catch (error) {
      console.error("Error fetching attendance status:", error);
    }
  }, [API_URL, token]);

  const fetchAttendanceData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/capitalfarmer.co/api/v1/asistencias`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setAttendanceData(response.data);
    } catch (error) {
      console.error("Error al obtener los datos de asistencia:", error);
    } finally {
      setLoading(false);
    }
  }, [API_URL, token]);

  useEffect(() => {
    if (token) {
      fetchAttendanceStatus();
      fetchAttendanceData();
    }
  }, [token, fetchAttendanceStatus, fetchAttendanceData]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const timeToMidnight = midnight.getTime() - now.getTime();

    const timer = setTimeout(() => {
      fetchAttendanceStatus();
    }, timeToMidnight);

    return () => clearTimeout(timer);
  }, [fetchAttendanceStatus]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return {
      h: hours.toString().padStart(2, "0"),
      m: minutes.toString().padStart(2, "0"),
      s: secs.toString().padStart(2, "0"),
    };
  };

  const marcarAsistencia = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/capitalfarmer.co/api/v1/asistencias/marcar-entrada`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.status === 200 || response.status === 201) {
        toast.success("Entrada registrada correctamente");
        await fetchAttendanceStatus();
        await fetchAttendanceData();
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.detail ||
          error.message ||
          "Ocurrió un error inesperado";
        toast.error("Error al marcar entrada", {
          description: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const marcarSalida = async () => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${API_URL}/capitalfarmer.co/api/v1/asistencias/marcar-salida`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.status === 200 || response.status === 201) {
        toast.success("Salida registrada correctamente");
        await fetchAttendanceStatus();
        await fetchAttendanceData();
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.detail ||
          error.message ||
          "Ocurrió un error inesperado";
        toast.error("Error al marcar salida", {
          description: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const iniciarRefrigerio = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/capitalfarmer.co/api/v1/asistencias/iniciar-pausa`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.status === 200 || response.status === 201) {
        toast.success("Refrigerio iniciado correctamente");
        await fetchAttendanceStatus();
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.detail ||
          error.message ||
          "Ocurrió un error inesperado";
        toast.error("Error al iniciar refrigerio", {
          description: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const finalizarRefigerio = async () => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${API_URL}/capitalfarmer.co/api/v1/asistencias/finalizar-pausa`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.status === 200 || response.status === 201) {
        toast.success("Refrigerio finalizado correctamente");
        await fetchAttendanceStatus();
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.detail ||
          error.message ||
          "Ocurrió un error inesperado";
        toast.error("Error al finalizar refrigerio", {
          description: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const time = formatTime(timeElapsed);

  const renderBotonSalida = () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full" disabled={loading}>
          <CircleStop className="mr-2 h-4 w-4" /> Terminar Jornada
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Terminar jornada laboral?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción marcará el fin de tu jornada laboral de hoy. Asegúrate
            de haber completado tus tareas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={marcarSalida}>
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const renderActionButton = () => {
    switch (attendanceStatus) {
      case "sin_registro":
        return (
          <ConfirmActionDialog
            title="¿Iniciar jornada laboral?"
            description="Se registrará tu hora de entrada para el día de hoy."
            buttonText="Iniciar Jornada"
            icon={<CirclePlay className="mr-2 h-4 w-4" />}
            onConfirm={marcarAsistencia}
            loading={loading}
          />
        );

      case "presente":
        return (
          <div className="flex flex-col gap-2 w-full">
            <ConfirmActionDialog
              title="¿Iniciar refrigerio?"
              description="Tu tiempo de trabajo se pausará temporalmente."
              buttonText="Iniciar Refrigerio"
              variant="outline"
              icon={<Clock className="mr-2 h-4 w-4" />}
              onConfirm={iniciarRefrigerio}
              loading={loading}
            />
            <ConfirmActionDialog
              title="¿Terminar jornada laboral?"
              description="Esta acción marcará el fin de tu jornada. Asegúrate de haber completado tus tareas."
              buttonText="Terminar Jornada"
              variant="destructive"
              icon={<CircleStop className="mr-2 h-4 w-4" />}
              onConfirm={marcarSalida}
              loading={loading}
            />
          </div>
        );

      case "en_pausa":
        return (
          <ConfirmActionDialog
            title="¿Finalizar refrigerio?"
            description="Se reanudará el conteo de tu tiempo de trabajo."
            buttonText="Finalizar Refrigerio"
            variant="outline"
            icon={<CirclePause className="mr-2 h-4 w-4" />}
            onConfirm={finalizarRefigerio}
            loading={loading}
          />
        );

      case "post_pausa":
        return (
          <div className="flex flex-col gap-2 w-full">
            {renderBotonSalida()}
          </div>
        );

      case "finalizado":
        return (
          <Button variant="outline" className="w-full" disabled={true}>
            <CircleStop className="mr-2 h-4 w-4" /> Jornada Finalizada
          </Button>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex">
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex flex-col gap-6 mb-8">
            <Card className="flex-1">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="w-full sm:w-auto">Reloj</CardTitle>
                {attendanceStatus !== "sin_registro" && (
                  <Badge
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      attendanceStatus === "presente"
                        ? "border-green-600 bg-green-600/10 text-green-600 dark:border-green-400 dark:bg-green-400/10 dark:text-green-400"
                        : attendanceStatus === "en_pausa"
                          ? "border-yellow-600 bg-yellow-600/10 text-yellow-600 dark:border-yellow-400 dark:bg-yellow-400/10 dark:text-yellow-400"
                          : attendanceStatus === "post_pausa"
                            ? "border-green-600 bg-green-600/10 text-green-600 dark:border-green-400 dark:bg-green-400/10 dark:text-green-400"
                            : attendanceStatus === "finalizado"
                              ? "border-sky-600 bg-sky-600/10 text-sky-600 dark:border-sky-400 dark:bg-sky-400/10 dark:text-sky-400"
                              : attendanceStatus === "permiso"
                                ? "border-purple-600 bg-purple-600/10 text-purple-600 dark:border-purple-400 dark:bg-purple-400/10 dark:text-purple-400"
                                : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {attendanceStatus === "presente"
                      ? "Activo"
                      : attendanceStatus === "en_pausa"
                        ? "En Pausa"
                        : attendanceStatus === "post_pausa"
                          ? "Activo"
                          : attendanceStatus === "finalizado"
                            ? "Finalizado"
                            : attendanceStatus === "permiso"
                              ? "Con Permiso"
                              : ""}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-row items-center space-x-2">
                  <div className="flex flex-1 flex-col p-2 rounded bg-muted border">
                    <span className="text-center text-lg">{time.h}</span>
                    <span className="text-center text-xs text-muted-foreground">
                      Horas
                    </span>
                  </div>
                  <span className="text-xl font-bold">:</span>
                  <div className="flex flex-1 flex-col p-2 rounded bg-muted border">
                    <span className="text-center text-lg">{time.m}</span>
                    <span className="text-center text-xs text-muted-foreground">
                      Minutos
                    </span>
                  </div>
                  <span className="text-xl font-bold">:</span>
                  <div className="flex flex-1 flex-col p-2 rounded bg-muted border">
                    <span className="text-center text-lg">{time.s}</span>
                    <span className="text-center text-xs text-muted-foreground">
                      Segundos
                    </span>
                  </div>
                </div>
                {renderActionButton()}
              </CardContent>
            </Card>
          </div>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Registros de Asistencia </CardTitle>
              <CardDescription>
                Lista de registros de asistencia de los empleados.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
