"use client";

import { useState, useMemo, useEffect } from "react";
import {
  MoreVertical,
  FileText,
  Folder,
  Music,
  Video,
  ImageIcon,
  File,
  Info,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

import type { File as FileType } from "@/types/fileTypes";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const getFileIcon = (fileType: string) => {
  switch (fileType.toLowerCase()) {
    case "video":
      return <Video className="w-5 h-5 text-red-500" />;
    case "drawio":
      return <FileText className="w-5 h-5 text-yellow-500" />;
    case "folder":
      return <Folder className="w-5 h-5 text-gray-400" />;
    case "zip":
      return <FileText className="w-5 h-5 text-orange-500" />;
    case "music":
      return <Music className="w-5 h-5 text-purple-500" />;
    case "image":
      return <ImageIcon className="w-5 h-5 text-blue-500" />;
    default:
      return <File className="w-5 h-5 text-gray-400" />;
  }
};

const formatDate = (date: Date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Hoy";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Ayer";
  } else if (date.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000) {
    return "Anteriormente esta semana";
  } else if (date.getMonth() === today.getMonth() - 1) {
    return "Mes pasado";
  } else {
    return date.toLocaleDateString("es-ES");
  }
};

const groupItemsByDate = (items: FileType[]) => {
  const grouped: { [key: string]: FileType[] } = {};

  items.forEach((item) => {
    if (!item.deleted_at) return; // Asegurarse de que deleted_at no sea nulo
    const deletedDate = new Date(item.deleted_at); // Convert string to Date
    const dateGroup = formatDate(deletedDate);
    if (!grouped[dateGroup]) {
      grouped[dateGroup] = [];
    }
    grouped[dateGroup].push(item);
  });

  return grouped;
};

const API_URL = import.meta.env.VITE_API_URL;

export default function TrashBinPanel() {
  const { token } = useAuth();
  const [items, setItems] = useState<FileType[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  // const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date");
  // const [filterType, setFilterType] = useState<string>("all");
  const [sortBy] = useState<"name" | "date" | "size">("date");
  const [filterType] = useState<string>("all");

  useEffect(() => {
    axios
      .get(`${API_URL}/capitalfarmer.co/api/v1/folders/files/recycled`)
      .then((response) => {
        setItems(response.data);
      });
  }, []);

  const filteredItems = useMemo(() => {
    let filtered = items;
    if (filterType !== "all") {
      filtered = items.filter(
        (item) => item.mime_type.toLowerCase() === filterType.toLowerCase(),
      );
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "size":
          return parseInt(b.file_size) - parseInt(a.file_size);
        default: {
          const dateA = a.deleted_at ? new Date(a.deleted_at).getTime() : 0;
          const dateB = b.deleted_at ? new Date(b.deleted_at).getTime() : 0;
          return dateB - dateA;
        }
      }
    });
  }, [items, sortBy, filterType]);

  const groupedItems = groupItemsByDate(filteredItems);
  const dateGroups = [
    "Hoy",
    "Ayer",
    "Anteriormente esta semana",
    "Mes pasado",
  ].filter((date) => groupedItems[date]);

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleRestoreItem = async (id: string) => {
    try {
      const response = await axios.post(
        `${API_URL}/capitalfarmer.co/api/v1/files/recycled/${id}/restore`,
      );

      // Eliminar el item de la lista local (ya que fue restaurado)
      setItems(items.filter((item) => item.id !== id));

      // Mostrar mensaje de éxito (opcional)
      toast("Archivo restaurado:", response.data.message);

      // Si tienes un toast/snackbar, puedes mostrarlo:
      // showSuccessToast(response.data.message);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Manejo específico de errores de Axios
        const errorMessage =
          error.response?.data?.detail || "Error al restaurar el archivo";
        toast.error("Error:", errorMessage);

      } else {
        toast.error("Error desconocido");
      }
    }
  };

  const handleDeletePermanentlySingle = async (id: string) => {
    try {
      const response = await axios.delete(
        `${API_URL}/capitalfarmer.co/api/v1/files/${id}/permanent`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setItems(items.filter((item) => item.id !== id));
      toast("Archivo eliminado permanentemente:", response.data.message);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.detail || "Error al eliminar el archivo";
        toast.error("Error:", errorMessage);
      } else {
        toast.error("Error desconocido");
      }
    }
  };

  const handleDeletePermanently = async () => {
    // Si hay items seleccionados, eliminar esos
    if (selectedItems.size > 0) {
      if (
        !window.confirm(
          `¿Está seguro de que desea eliminar permanentemente ${selectedItems.size} elemento(s)?`,
        )
      ) {
        return;
      }

      try {
        const selectedIds = Array.from(selectedItems).map((id) => ({ id }));

        const response = await axios.delete(
          `${API_URL}/capitalfarmer.co/api/v1/files/permanent`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            data: selectedIds,
          },
        );

        // Eliminar los items del estado
        const newItems = items.filter((item) => !selectedItems.has(item.id));
        setItems(newItems);
        setSelectedItems(new Set()); // Limpiar selección

        toast("Archivos eliminados permanentemente:", response.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorMessage =
            error.response?.data?.detail || "Error al eliminar archivos";
          toast.error("Error:", errorMessage);
        } else {
          toast.error("Error desconocido");
        }
      }
    }
  };

  const handleEmptyTrash = () => {
    if (
      confirm("¿Está seguro de que desea vaciar la papelera permanentemente?")
    ) {
      setItems([]);
      setSelectedItems(new Set());
    }
  };

  return (
    <div className="space-y-6 mt-4 px-6">
      {/* Header */}
      <div className="mb-6">
        {items.length > 0 && (
          <div className="text-muted-foreground text-sm flex items-center justify-between gap-2 p-2 rounded-lg bg-sky-600/10 dark:bg-sky-400/10 dark:text-sky-400">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              <span>
                Los elementos de la papelera se eliminarán definitivamente
                después de 30 días
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEmptyTrash}
              disabled={items.length === 0}
              className="gap-2 hover:bg-sky-500/20 hover:text-sky-600 dark:hover:bg-sky-500/20 dark:hover:text-sky-400 transition-colors"
            >
              Vaciar papelera
            </Button>
          </div>
        )}

        {selectedItems.size > 0 && (
          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-red-600/10 text-red-600 dark:bg-red-400/10 dark:text-red-400 mt-3">
            <span className="text-sm font-medium">
              {selectedItems.size} elemento(s) seleccionado(s)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedItems(new Set())}
                className="gap-2"
              >
                Deseleccionar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeletePermanently}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar seleccionados
              </Button>
            </div>
          </div>
        )}
      </div>
      {/* Items List */}
      <div className="space-y-6">
        {items.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-muted mb-6">
              <Trash2
                className="w-16 h-16 text-muted-foreground"
                strokeWidth={1.5}
              />
            </div>

            <h3 className="text-2xl font-semibold text-foreground mb-2">
              La papelera está vacía
            </h3>

            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              Los elementos enviados a la papelera se eliminarán definitivamente
              después de 30 días
            </p>
          </div>
        ) : (
          dateGroups.map((dateGroup) => (
            <div key={dateGroup}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                {dateGroup}
              </h3>
              <div className="space-y-1 border rounded-lg divide-y divide-border overflow-hidden">
                {groupedItems[dateGroup]?.map((item) => (
                  <ContextMenu key={item.id}>
                    <ContextMenuTrigger asChild>
                      <div className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors cursor-context-menu">
                        {/* Checkbox */}
                        <div onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedItems.has(item.id)}
                            onCheckedChange={() => handleSelectItem(item.id)}
                            className="w-4 h-4 rounded cursor-pointer"
                          />
                        </div>

                        {/* Icon and Name */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {getFileIcon(item.mime_type || "folder")}
                          <span className="text-sm font-medium truncate">
                            {item.name}
                          </span>
                        </div>

                        {/* Original Location */}
                        <div className="hidden md:block text-sm text-muted-foreground min-w-0 flex-1">
                          <span className="truncate">{item.minio_path}</span>
                        </div>

                        {/* Deleted Date */}
                        <div className="hidden sm:block text-sm text-muted-foreground min-w-fit">
                          {item.deleted_at
                            ? new Date(item.deleted_at).toLocaleDateString(
                                "es-ES",
                                {
                                  month: "short",
                                  day: "numeric",
                                },
                              )
                            : "Sin fecha"}
                        </div>

                        {/* Size */}
                        <div className="hidden sm:block text-sm text-muted-foreground min-w-fit">
                          {item.file_size}
                        </div>

                        {/* Actions Menu */}
                        <div onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleRestoreItem(item.id)}
                                className="gap-2"
                              >
                                <RotateCcw className="w-4 h-4" />
                                Restaurar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDeletePermanentlySingle(item.id)
                                }
                                className="gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Eliminar permanentemente
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </ContextMenuTrigger>

                    <ContextMenuContent>
                      <ContextMenuItem
                        onClick={() => handleRestoreItem(item.id)}
                        className="gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Restaurar
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() => handleDeletePermanentlySingle(item.id)}
                        className="gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar permanentemente
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
