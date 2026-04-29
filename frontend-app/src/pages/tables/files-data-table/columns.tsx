"use client";
import { type JSX } from "react";

import { type ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";

import { cn } from "@/lib/utils";

import { File, Folder} from "lucide-react";

import { FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileArchive } from "react-icons/fa";
import { Image } from "lucide-react";

export type Files = {
  id: string;
  name: string;
  created_at: string;
  file_size: string;
  is_directory?: boolean;
  mime_type?: string;
};

function formatBytes(bytes: number) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getFileIcon = (name: string, is_directory = false) => {
  if (is_directory) {
    return <Folder className="h-4 w-4" />;
  }

  const ext = name.split(".").pop()?.toLowerCase() || "";

  const iconMap: Record<string, JSX.Element> = {
    pdf: <FaFilePdf className="h-4 w-4 text-destructive" />,
    doc: <FaFileWord className="h-4 w-4 text-sky-600 dark:text-sky-400" />,
    docx: <FaFileWord className="h-4 w-4 text-sky-600 dark:text-sky-400" />,
    xls: <FaFileExcel className="h-4 w-4 text-green-600 dark:text-green-400" />,
    xlsx: <FaFileExcel className="h-4 w-4 text-green-600 dark:text-green-400" />,
    ppt: <FaFilePowerpoint className="h-4 w-4 text-orange-600 dark:text-orange-400" />,
    pptx: <FaFilePowerpoint className="h-4 w-4 text-orange-600 dark:text-orange-400" />,
    png: <Image className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
    jpg: <Image className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
    jpeg: <Image className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
    svg: <Image className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
    zip: <FaFileArchive className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />,
    rar: <FaFileArchive className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />,
  };

  return iconMap[ext] || <File className="h-4 w-4 text-gray-500" />;
};

export const columns: ColumnDef<Files>[] = [
  {
    id: "select",
    header: ({ table }) => {
      const someSelected = table.getFilteredSelectedRowModel().rows.length > 0;

      return (
        <div
          className={cn(
            "opacity-0 transition-opacity",
            someSelected && "opacity-100", 
            "group-hover/row:opacity-100" 
          )}
        >
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      );
    },
    cell: ({ row }) => (
      <div
        className={cn(
          "opacity-0 transition-opacity",
          "group-hover/row:opacity-100", // visible al pasar el cursor sobre la fila
          row.getIsSelected() && "opacity-100" // visible si está seleccionada
        )}
      >
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => {
      const file = row.original;
      return (
        <div className="flex items-center gap-2">
          {getFileIcon(file.name, file.is_directory)}
          {file.name}
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Fecha de creación",
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
  {
    accessorKey: "file_size",
    header: "Tamaño",
    cell: ({ getValue }) => formatBytes(getValue() as number),
  },
];
