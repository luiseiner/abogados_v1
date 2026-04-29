import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Bell,
  Mail,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "./theme-toggle";
import { useTimer } from "@/context/TimerContext";
import { Square } from "lucide-react";

const routeTitles: Record<string, string> = {
  "/home": "Panel de Control",
  "/home/quotes": "Cotizaciones",
  "/home/clients": "Clientes",
  "/home/ticket-management": "Tickets",
  "/home/my-tickets": "Mis Tickets",
  "/home/files": "Documentos",
  "/home/attendance": "Asistencia",
  "/home/user-requests": "Solicitudes",
  "/home/admin-requests": "Control de Solicitudes",
  "/home/attendance-control": "Control de asistencia",
  "/home/overtime": "Horas extras",
  "/home/requests": "Solicitudes",
  "/home/vacations": "Vacaciones",
  "/settings/users": "Usuarios",
  "/settings/roles": "Roles",
  "/settings/areas": "Áreas",
  "/settings/papelera": "Papelera",
  "/home/holidays": "Feriados",
  "/home/case-management": "Gestión de Casos",
  "/home/my-cases": "Mis Casos",
  "/home/notifications": "Notificaciones",
};

interface Notification {
  id: number;
  mensaje: string;
  leido: boolean;
  fecha: string;
  titulo: string;
  tipo: string;
  entidad_tipo?: string;
  entidad_id?: number;
  datos_extra?: {
    acciones?: any[];
    [key: string]: any;
  };
}

const parseDate = (fecha: string) =>
  formatDistanceToNow(new Date(fecha), { addSuffix: true, locale: es });

function NotifIcon({ tipo }: { tipo: string }) {
  if (tipo === "error" || tipo === "proceso_fallido")
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-red-950">
        <AlertCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
      </div>
    );
  if (tipo === "advertencia" || tipo === "proceso_limite")
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950">
        <AlertTriangle className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
      </div>
    );
  if (tipo === "exito" || tipo === "proceso_completado")
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-50 dark:bg-green-950">
        <CheckCircle className="h-3.5 w-3.5 text-green-700 dark:text-green-400" />
      </div>
    );
  if (tipo === "recordatorio")
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950">
        <Calendar className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
      </div>
    );

  // Iniciales del título
  return null;
}

function NotifAvatar({ notif }: { notif: Notification }) {
  const initials = notif.titulo
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const specificTypes = [
    "error",
    "proceso_fallido",
    "advertencia",
    "proceso_limite",
    "exito",
    "proceso_completado",
    "recordatorio",
  ];
  if (specificTypes.includes(notif.tipo))
    return <NotifIcon tipo={notif.tipo} />;

  const colorClasses = [
    "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  ];
  const colorClass = colorClasses[initials.charCodeAt(0) % 4];

  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${colorClass}`}
    >
      {initials}
    </div>
  );
}

export function SiteHeader() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "watching">("all");
  const panelRef = useRef<HTMLDivElement>(null);
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const location = useLocation();

  const { activeTimer, stopTimer } = useTimer();
  const [elapsed, setElapsed] = useState(0);

  const getPageTitle = () => {
    const path = location.pathname;
    if (routeTitles[path]) return routeTitles[path];
    if (path.startsWith("/home/quotes/details/"))
      return "Detalle de Cotización";
    if (path.startsWith("/home/files/folder/")) return "Explorador de Archivos";
    return "Sistema";
  };

  useEffect(() => {
    if (!activeTimer) {
      setElapsed(0);
      return;
    }

    const diff = Math.floor(
      (Date.now() - activeTimer.startedAt.getTime()) / 1000,
    );
    setElapsed(diff);

    const interval = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [activeTimer]);

  const formatElapsed = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0)
      return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!user) return;
    axios
      .get(`${API_URL}/capitalfarmer.co/api/v1/notificaciones/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setNotifications(response.data.notificaciones || []);
        setUnreadCount(response.data.no_leidas || 0);
      })
      .catch((error) => console.error("Error cargando notificaciones:", error));
  }, [user, API_URL, token]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const openPanel = () => {
    if (!isOpen && unreadCount > 0) {
      axios
        .put(
          `${API_URL}/capitalfarmer.co/api/v1/notificaciones/marcar-todas-leidas`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        )
        .then(() => {
          setUnreadCount(0);
          setNotifications((prev) => prev.map((n) => ({ ...n, leido: true })));
        })
        .catch(console.error);
    }
    setIsOpen((v) => !v);
  };

  const markOneRead = (id: number) => {
    axios
      .put(
        `${API_URL}/capitalfarmer.co/api/v1/notificaciones/${id}/marcar-leida`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )
      .then(() =>
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, leido: true } : n)),
        ),
      )
      .catch(console.error);
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="relative flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-lg font-bold transition-all">{getPageTitle()}</h1>

        <div className="ml-auto flex items-center gap-1 mr-4">
          {activeTimer && (
            <div className="flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 dark:border-orange-800 dark:bg-orange-950">
              {/* Indicador pulsante */}
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
              </span>

              {/* Título truncado */}
              <span className="max-w-32 truncate text-xs font-medium text-orange-700 dark:text-orange-300">
                {activeTimer.tareaTitle}
              </span>

              {/* Tiempo */}
              <span className="font-mono text-xs tabular-nums text-orange-600 dark:text-orange-400">
                {formatElapsed(elapsed)}
              </span>

              {/* Botón parar */}
              <button
                onClick={stopTimer}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-200 text-orange-700 hover:bg-orange-300 dark:bg-orange-800 dark:text-orange-300"
              >
                <Square className="h-2.5 w-2.5 fill-current" />
              </button>
            </div>
          )}

          <ThemeToggle />
          <Button variant="ghost" size="icon" className="relative">
            <Mail className="h-5 w-5" />
          </Button>

          {/* Notification bell */}
          <div className="relative" ref={panelRef}>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={openPanel}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full px-1 text-[10px]"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
              <span className="sr-only">Notificaciones</span>
            </Button>

            {/* Dropdown panel */}
            {isOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-[360px] overflow-hidden rounded-xl border bg-background shadow-lg">
                {/* Panel header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-0">
                  <span className="text-sm font-medium">Notificaciones</span>
                  <button
                    onClick={() => {
                      navigate("/home/notifications");
                      setIsOpen(false);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    Ver todas
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-0 border-b px-4 pt-1">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`mr-5 border-b-2 pb-2 text-[13px] transition-colors ${
                      activeTab === "all"
                        ? "border-foreground font-medium text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    } flex items-center gap-1.5`}
                  >
                    Ver todo
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-900 dark:text-red-300">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Notification list */}
                <ScrollArea className="h-[340px]">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <Bell className="mb-2 h-8 w-8 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">
                        Sin notificaciones
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {notifications.map((notif) => (
                        <button
                          key={notif.id}
                          onClick={() => markOneRead(notif.id)}
                          className="flex w-full items-start gap-2.5 px-4 py-3 text-left transition-colors hover:bg-muted/60"
                        >
                          <NotifAvatar notif={notif} />

                          <div className="min-w-0 flex-1">
                            <p className="text-[12.5px] leading-snug text-foreground">
                              {notif.titulo}
                            </p>
                            <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground line-clamp-2">
                              {notif.mensaje}
                            </p>

                            {/* Action buttons */}
                            {notif.datos_extra?.acciones &&
                              Array.isArray(notif.datos_extra.acciones) && (
                                <div className="mt-1.5 flex gap-1.5">
                                  {(
                                    notif.datos_extra.acciones as {
                                      label: string;
                                      primary?: boolean;
                                    }[]
                                  ).map((accion, i) => (
                                    <span
                                      key={i}
                                      className={`rounded border px-2 py-0.5 text-[11px] font-medium ${
                                        accion.primary
                                          ? "border-foreground bg-foreground text-background"
                                          : "border-border text-foreground hover:bg-muted"
                                      }`}
                                    >
                                      {accion.label}
                                    </span>
                                  ))}
                                </div>
                              )}

                            <p className="mt-1 text-[11px] text-muted-foreground/60">
                              {parseDate(notif.fecha)}
                            </p>
                          </div>

                          {!notif.leido && (
                            <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-600 dark:bg-green-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="border-t p-2">
                    <Button
                      variant="ghost"
                      className="w-full text-xs text-muted-foreground"
                      onClick={() => {
                        navigate("/home/notifications");
                        setIsOpen(false);
                      }}
                    >
                      Ver todas las notificaciones
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
