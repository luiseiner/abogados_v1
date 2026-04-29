import React, { createContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

interface WebSocketContextProps {
  sendMessage: (message: any) => void;
  addMessageHandler: (handler: (data: any) => void) => void;
  removeMessageHandler: (handler: (data: any) => void) => void;
  isConnected: boolean;
}

export const WebSocketContext = createContext<WebSocketContextProps | null>(
  null,
);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socket = useRef<WebSocket | null>(null);
  const messageHandlers = useRef<((data: any) => void)[]>([]);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout| null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const WS_API_URL = import.meta.env.VITE_API_WS_URL;
  const { token, user } = useAuth();

  const connect = () => {
    // No intentar conectar si no hay token o usuario

    if (!WS_API_URL) {
      console.error("Error: VITE_API_WS_URL no está definida en el entorno.");
      return;
    }

    if (!token || !user) {
      console.log("No se puede conectar WebSocket: no hay token o usuario");
      return;
    }

    // No crear nueva conexión si ya existe una abierta
    if (socket.current?.readyState === WebSocket.OPEN) {
      console.log("WebSocket ya está conectado");
      return;
    }

    // Limpiar conexión anterior si existe
    if (socket.current) {
      socket.current.close();
      socket.current = null;
    }

    try {
      const wsUrl = `${WS_API_URL}/capitalfarmer.co/api/v1/ws?token=${token}`;
      console.log("Conectando a:", wsUrl);

      socket.current = new WebSocket(wsUrl);

      socket.current.onopen = () => {
        console.log("WebSocket conectado");
        setIsConnected(true);
        reconnectAttempts.current = 0; // Reset intentos de reconexión

        // Enviar ping cada 30 segundos para mantener conexión viva
        const pingInterval = setInterval(() => {
          if (socket.current?.readyState === WebSocket.OPEN) {
            socket.current.send(JSON.stringify({ type: "ping" }));
          }
        }, 30000);

        // Guardar el intervalo para limpiarlo después
        (socket.current as any).pingInterval = pingInterval;
      };

      socket.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);


          if (data.type === "notification") {
            const notif = data.notification;

            // Determinar el tipo de toast según el contenido
            const isApproved = notif.mensaje?.toLowerCase().includes("aprobad");
            const isRejected = notif.mensaje
              ?.toLowerCase()
              .includes("rechazad");
            const isSolicitud = notif.titulo
              ?.toLowerCase()
              .includes("solicitud");

            if (isApproved) {
              toast.success(notif.titulo || "Solicitud Aprobada", {
                description: notif.mensaje,
                duration: 5000,
              });
            } else if (isRejected) {
              toast.error(notif.titulo || "Solicitud Rechazada", {
                description: notif.mensaje,
                duration: 5000,
              });
            } else if (isSolicitud) {
              toast.info(notif.titulo || "Nueva Solicitud", {
                description: notif.mensaje,
                duration: 5000,
              });
            } else {
              // Notificación genérica
              toast.info(notif.titulo || "Nueva notificación", {
                description: notif.mensaje,
                duration: 5000,
              });
            }

            // Disparar evento personalizado para actualizar el contador de notificaciones
            window.dispatchEvent(
              new CustomEvent("nueva-notificacion", {
                detail: notif,
              }),
            );
          }

          // MANEJAR NUEVA SOLICITUD (para RRHH/Administradores)
          if (data.type === "nueva_solicitud") {
            toast.info("Nueva Solicitud Recibida", {
              description:
                data.mensaje ||
                `${data.usuario_nombre} ha creado una nueva solicitud`,
              duration: 5000,
              action: {
                label: "Ver",
                onClick: () => {
                  // Redirigir a la página de solicitudes
                  window.location.href = "/solicitudes";
                },
              },
            });

            // Disparar evento para actualizar lista de solicitudes
            window.dispatchEvent(
              new CustomEvent("nueva-solicitud", {
                detail: data,
              }),
            );
          }

          // MANEJAR CAMBIO DE ESTADO DE SOLICITUD
          if (data.type === "cambio_estado_solicitud") {
            const estado = data.estado;
            const mensaje = data.mensaje || `Tu solicitud ha sido ${estado}`;

            if (estado === "aprobado") {
              toast.success("Solicitud Aprobada", {
                description: mensaje,
                duration: 5000,
              });
            } else if (estado === "rechazado") {
              toast.error("Solicitud Rechazada", {
                description: mensaje,
                duration: 5000,
              });
            }

            // Disparar evento para actualizar la lista de solicitudes del usuario
            window.dispatchEvent(
              new CustomEvent("solicitud-actualizada", {
                detail: data,
              }),
            );
          }

          // Manejar tickets asignados
          if (data.type === "ticket_created") {
            const { ticket } = data;
            toast.success(
              `Fuiste asignado al ticket: ${ticket.codigo} - ${ticket.prioridad}`,
              {
                duration: 5000,
              },
            );
          }

          // Manejar pong
          if (data.type === "pong") {
            console.log("Pong recibido");
          }

          // Llamar a todos los handlers registrados
          messageHandlers.current.forEach((handler) => {
            try {
              handler(data);
            } catch (error) {
              console.error("Error en message handler:", error);
            }
          });
        } catch (error) {
          console.error("Error procesando mensaje:", error);
        }
      };

      socket.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };

      socket.current.onclose = (event) => {
        console.log("WebSocket cerrado:", event.code, event.reason);
        setIsConnected(false);

        // Limpiar ping interval
        if ((socket.current as any)?.pingInterval) {
          clearInterval((socket.current as any).pingInterval);
        }

        // Intentar reconectar si no se excedieron los intentos
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            30000,
          ); // Backoff exponencial
          console.log(
            `Reconectando en ${delay / 1000}s (intento ${reconnectAttempts.current}/${maxReconnectAttempts})`,
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.error("Máximo de intentos de reconexión alcanzado");
          toast.error("No se pudo conectar al servidor de notificaciones", {
            description: "Por favor, recarga la página",
          });
        }
      };
    } catch (error) {
      console.error("Error creando WebSocket:", error);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    // Solo conectar si hay token y usuario
    if (token && user) {
      connect();
    }

    return () => {
      // Limpiar timeout de reconexión
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // Cerrar conexión
      if (socket.current) {
        // Limpiar ping interval
        if ((socket.current as any).pingInterval) {
          clearInterval((socket.current as any).pingInterval);
        }
        socket.current.close();
        socket.current = null;
      }
    };
  }, [token, user]); // Reconectar cuando cambie el token o usuario

  const sendMessage = (message: any) => {
    if (socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify(message));
    } else {
      console.warn("No se puede enviar mensaje: WebSocket no está conectado");
    }
  };

  const addMessageHandler = (handler: (data: any) => void) => {
    messageHandlers.current.push(handler);
  };

  const removeMessageHandler = (handler: (data: any) => void) => {
    messageHandlers.current = messageHandlers.current.filter(
      (h) => h !== handler,
    );
  };

  return (
    <WebSocketContext.Provider
      value={{
        sendMessage,
        addMessageHandler,
        removeMessageHandler,
        isConnected,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};
