import { useEffect, useState } from "react";
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";

interface Notification {
  id: number;
  mensaje: string;
  leido: boolean;
  fecha: string;
  titulo: string;
  tipo: string;
  entidad_tipo?: string;
  entidad_id?: number;
  emisor_id?: number;
  usuario_id?: number;
  datos_extra?: {
    acciones?: any[];
    [key: string]: any; 
  };
}

const parseDate = (fecha: string) =>
  formatDistanceToNow(new Date(fecha), { addSuffix: true, locale: es });

function NotifAvatar({ tipo, titulo }: { tipo: string; titulo: string }) {
  const initials = titulo
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  if (tipo === "error" || tipo === "proceso_fallido") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
      </div>
    );
  }
  if (tipo === "advertencia" || tipo === "proceso_limite") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-700" />
      </div>
    );
  }
  if (tipo === "exito" || tipo === "proceso_completado") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-700" />
      </div>
    );
  }
  if (tipo === "recordatorio") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50">
        <Calendar className="h-4 w-4 text-blue-700" />
      </div>
    );
  }

  // Avatar con iniciales para notificaciones de usuario
  const colorMap: Record<number, string> = {
    0: "bg-teal-100 text-teal-800",
    1: "bg-blue-100 text-blue-800",
    2: "bg-purple-100 text-purple-800",
    3: "bg-orange-100 text-orange-800",
  };
  const colorClass =
    colorMap[initials.charCodeAt(0) % 4] ?? "bg-gray-100 text-gray-800";

  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ${colorClass}`}
    >
      {initials}
    </div>
  );
}

function groupByDate(notifications: Notification[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const groups: { label: string; items: Notification[] }[] = [
    { label: "Hoy", items: [] },
    { label: "Ayer", items: [] },
    { label: "Anteriores", items: [] },
  ];

  for (const notif of notifications) {
    const d = new Date(notif.fecha);
    d.setHours(0, 0, 0, 0);
    if (d >= today) groups[0].items.push(notif);
    else if (d >= yesterday) groups[1].items.push(notif);
    else groups[2].items.push(notif);
  }

  return groups.filter((g) => g.items.length > 0);
}

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [filterType, setFilterType] = useState<string | null>(null);
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  const unreadCount = notifications.filter((n) => !n.leido).length;

  const filtered = filterType
    ? notifications.filter((n) => n.tipo === filterType)
    : notifications;

  const grouped = groupByDate(filtered);

  const types = [...new Set(notifications.map((n) => n.tipo))];

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/capitalfarmer.co/api/v1/notificaciones/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        // Importante: Asegúrate de que la estructura coincida con tu backend
        // Normalmente es response.data.notificaciones
        setNotifications(response.data.notificaciones || []);
      } catch (error) {
        console.error("Error cargando notificaciones:", error);
      }
    };

    if (token) {
      fetchNotifications();
    }
  }, [token, API_URL]);

  const markAllRead = () => {
    axios
      .put(
        `${API_URL}/capitalfarmer.co/api/v1/notificaciones/marcar-todas-leidas`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )
      .then(() =>
        setNotifications((prev) => prev.map((n) => ({ ...n, leido: true }))),
      )
      .catch(console.error);
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
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="rounded-full px-2 py-0 text-[11px]"
            >
              {unreadCount} nuevas
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={markAllRead}
            >
              Marcar todo como leído
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex shrink-0 items-center gap-2 border-b px-6 py-2">
        <button
          onClick={() => setFilterType(null)}
          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
            filterType === null
              ? "border-border bg-background font-medium text-foreground"
              : "border-transparent text-muted-foreground hover:bg-muted"
          }`}
        >
          Todos
        </button>
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`rounded-full border px-3 py-1 text-xs capitalize transition-colors ${
              filterType === t
                ? "border-border bg-background font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:bg-muted"
            }`}
          >
            {t.replace(/_/g, " ")}
          </button>
        ))}
        {(filterType || selected.size > 0) && (
          <>
            <div className="mx-1 h-4 w-px bg-border" />
            <button
              onClick={() => {
                setFilterType(null);
                setSelected(new Set());
              }}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground"
            >
              Limpiar todo
            </button>
          </>
        )}
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bell className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              Sin notificaciones
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Cuando recibas notificaciones aparecerán aquí
            </p>
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.label}>
              {/* Date separator */}
              <div className="sticky top-0 z-10 border-b bg-muted/60 px-6 py-1.5 text-[11px] font-medium uppercase tracking-widest text-muted-foreground backdrop-blur-sm">
                {group.label}
              </div>

              {group.items.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    toggleSelect(notif.id);
                    markOneRead(notif.id);
                  }}
                  className={`relative flex cursor-pointer items-start gap-3 border-b px-6 py-3.5 transition-colors ${
                    selected.has(notif.id)
                      ? "bg-blue-50/60 dark:bg-blue-950/20"
                      : "hover:bg-muted/50"
                  }`}
                >
                  {/* Unread indicator */}
                  {!notif.leido && (
                    <div className="absolute left-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-green-500" />
                  )}

                  {/* Checkbox */}

                  {/* <Checkbox
                    id={`notif-${notif.id}`}
                    checked={selected.has(notif.id)}
                    onCheckedChange={() => toggleSelect(notif.id)}
                    onClick={(e) => e.stopPropagation()} // Para evitar que el click active el markOneRead del padre
                    className="mt-1"
                  /> */}

                  <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selected.has(notif.id)}
                      onCheckedChange={() => toggleSelect(notif.id)}
                    />
                  </div>

                  <NotifAvatar tipo={notif.tipo} titulo={notif.titulo} />

                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] leading-snug text-foreground">
                      <span
                        dangerouslySetInnerHTML={{ __html: notif.titulo }}
                      />
                    </p>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">
                      {notif.mensaje}
                    </p>

                    {notif.datos_extra?.acciones &&
                      Array.isArray(notif.datos_extra.acciones) && (
                        <div className="mt-2 flex gap-2">
                          {(
                            notif.datos_extra.acciones as Array<{
                              label: string;
                              primary?: boolean;
                            }>
                          ).map((accion, i) => (
                            <button
                              key={i}
                              onClick={(e) => e.stopPropagation()}
                              className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                                accion.primary
                                  ? "border-foreground bg-foreground text-background hover:opacity-80"
                                  : "border-border hover:bg-muted"
                              }`}
                            >
                              {/* Aquí es donde TS fallaba: ahora 'accion.label' es un string seguro */}
                              {accion.label}
                            </button>
                          ))}
                        </div>
                      )}

                    <p className="mt-1.5 text-[11px] text-muted-foreground/70">
                      {parseDate(notif.fecha)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  );
}
