import { useEffect, useState, type JSX } from "react";

import { useNavigate } from "react-router-dom";

import {
  Search,
  Folder,
  MoreVertical,
  LayoutGrid,
  TextAlignStart,
  Image,
  File,
  X,
  CalendarClock,
  Copy,
} from "lucide-react";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataTable } from "@/pages/tables/files-data-table/data-table";
import { columns, type Files } from "@/pages/tables/files-data-table/columns";

import type {
  File as FileType,
  // FileItem,
  FolderItem,
} from "@/types/fileTypes";

import axios from "axios";

import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  FaFileArchive,
  FaFileExcel,
  FaFilePdf,
  FaFilePowerpoint,
  FaFileWord,
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

async function getData(): Promise<Files[]> {
  // Fetch data from your API here.
  return [
    {
      id: "a1b2c3d4",
      name: "reporte_ventas_Q1_2025.xlsx",
      created_at: "2025-03-31",
      file_size: "2621440",
    },
    {
      id: "e5f6g7h8",
      name: "manual_usuario_v2.0.pdf",
      created_at: "2024-11-10",
      file_size: "16468480",
    },
    {
      id: "i9j0k1l2",
      name: "presentacion_marketing.pptx",
      created_at: "2025-05-15",
      file_size: "563200",
    },
    {
      id: "m3n4o5p6",
      name: "backup_db_20250601.zip",
      created_at: "2025-06-01",
      file_size: "1288490189",
    },
    {
      id: "q7r8s9t0",
      name: "foto_perfil_nuevo.jpg",
      created_at: "2025-07-22",
      file_size: "128000",
    },
    {
      id: "u1v2w3x4",
      name: "plan_proyecto_faseA.docx",
      created_at: "2024-09-05",
      file_size: "870400",
    },
    {
      id: "y5z6a7b8",
      name: "contrato_proveedor_X.pdf",
      created_at: "2023-12-01",
      file_size: "3250586",
    },
    {
      id: "c9d0e1f2",
      name: "registro_logs_0811.txt",
      created_at: "2025-08-11",
      file_size: "47185920",
    },
    {
      id: "g3h4i5j6",
      name: "hoja_calculo_presupuesto.ods",
      created_at: "2025-01-20",
      file_size: "2202009",
    },
    {
      id: "k7l8m9n0",
      name: "video_capacitacion.mp4",
      created_at: "2024-04-18",
      file_size: "367001600",
    },
    {
      id: "o1p2q3r4",
      name: "codigo_fuente_main.js",
      created_at: "2025-06-29",
      file_size: "12288",
    },
    {
      id: "s5t6u7v8",
      name: "informe_financiero_anual.pdf",
      created_at: "2024-02-14",
      file_size: "8286997",
    },
    {
      id: "w9x0y1z2",
      name: "notas_reunion_equipo.md",
      created_at: "2025-10-01",
      file_size: "5120",
    },
    {
      id: "a3b4c5d6",
      name: "dataset_clientes_raw.csv",
      created_at: "2025-07-07",
      file_size: "524288000",
    },
    {
      id: "e7f8g9h0",
      name: "logo_empresa_alta_res.png",
      created_at: "2023-05-10",
      file_size: "5033165",
    },
    {
      id: "i1j2k3l4",
      name: "template_email_promo.html",
      created_at: "2025-04-03",
      file_size: "30720",
    },
    {
      id: "m5n6o7p8",
      name: "audio_entrevista_01.wav",
      created_at: "2024-10-25",
      file_size: "92274688",
    },
    {
      id: "q9r0s1t2",
      name: "esquema_base_datos.sql",
      created_at: "2025-09-12",
      file_size: "256000",
    },
    {
      id: "u3v4w5x6",
      name: "factura_34567.pdf",
      created_at: "2025-08-20",
      file_size: "61440",
    },
    {
      id: "y7z8a9b0",
      name: "presentacion_inversores.pptx",
      created_at: "2024-06-08",
      file_size: "23389184",
    },
    {
      id: "c1d2e3f4",
      name: "config_servidor.ini",
      created_at: "2025-02-01",
      file_size: "1024",
    },
    {
      id: "g5h6i7j8",
      name: "imagen_fondo_web.webp",
      created_at: "2024-07-17",
      file_size: "1572864",
    },
    {
      id: "k9l0m1n2",
      name: "analisis_mercado_v3.pdf",
      created_at: "2025-03-05",
      file_size: "10695475",
    },
    {
      id: "o3p4q5r6",
      name: "lista_pendientes_2025.txt",
      created_at: "2025-01-01",
      file_size: "8192",
    },
    {
      id: "s7t8u9v0",
      name: "video_publicidad_corta.mov",
      created_at: "2025-04-29",
      file_size: "10695475",
    },
    {
      id: "w1x2y3z4",
      name: "modelo_3d_producto.obj",
      created_at: "2024-08-05",
      file_size: "68157440",
    },
    {
      id: "a5b6c7d8",
      name: "documento_politicas_HR.pdf",
      created_at: "2023-10-10",
      file_size: "125829120",
    },
    {
      id: "e9f0g1h2",
      name: "codigo_api_v1.py",
      created_at: "2025-07-19",
      file_size: "51200",
    },
    {
      id: "i3j4k5l6",
      name: "muestras_audio_loop.mp3",
      created_at: "2025-05-28",
      file_size: "1153434",
    },
    {
      id: "m7n8o9p0",
      name: "inventario_bodega_actual.csv",
      created_at: "2025-10-15",
      file_size: "972800",
    },
    {
      id: "q1r2s3t4",
      name: "informe_laboratorio_final.doc",
      created_at: "2024-03-20",
      file_size: "81920",
    },
    {
      id: "u5v6w7x8",
      name: "ilustracion_web_promo.svg",
      created_at: "2025-06-10",
      file_size: "89128960",
    },
    {
      id: "y9z0a1b2",
      name: "paquete_instalador_app.exe",
      created_at: "2024-11-29",
      file_size: "6492232",
    },
    {
      id: "c3d4e5f6",
      name: "certificacion_iso_2024.pdf",
      created_at: "2024-12-18",
      file_size: "15360",
    },
    {
      id: "g7h8i9j0",
      name: "mapa_sitio_web.xml",
      created_at: "2025-09-01",
      file_size: "35840",
    },
    {
      id: "k1l2m3n4",
      name: "borrador_articulo_cientifico.tex",
      created_at: "2025-02-28",
      file_size: "15360",
    },
    {
      id: "o5p6q7r8",
      name: "imagen_producto_001.heic",
      created_at: "2024-05-07",
      file_size: "4089446",
    },
    {
      id: "s9t0u1v2",
      name: "recibo_pago_luz_mayo.pdf",
      created_at: "2025-06-05",
      file_size: "204800",
    },
    {
      id: "w3x4y5z6",
      name: "modelo_estadistico_R.r",
      created_at: "2025-08-30",
      file_size: "184320",
    },
    {
      id: "a7b8c9d0",
      name: "presentacion_reunion_final.key",
      created_at: "2025-11-08",
      file_size: "47280742",
    },
  ];
}

export default function FilesPanel() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [folders, setFolders] = useState<FolderItem[]>();

  useEffect(() => {
    try {
      axios
        .get(`${API_URL}/capitalfarmer.co/api/v1/folders/root`)
        .then((response) => {
          setFolders(
            response.data.filter((file: FileType) => {
              return file.is_directory;
            })
          );
        });
    } catch (e) {
      console.error("Error fetching folders:", e);
    }
  }, []);

  // const [selectedFolder, setSelectedFolder] = useState<FolderItem | null>(null);

  const getFileIcon = (name: string, is_directory = false) => {
    if (is_directory) {
      return <Folder className="h-4 w-4" />;
    }

    const ext = name.split(".").pop()?.toLowerCase() || "";

    const iconMap: Record<string, JSX.Element> = {
      pdf: <FaFilePdf className="h-4 w-4 text-destructive" />,
      doc: <FaFileWord className="h-4 w-4 text-sky-600 dark:text-sky-400" />,
      docx: <FaFileWord className="h-4 w-4 text-sky-600 dark:text-sky-400" />,
      xls: (
        <FaFileExcel className="h-4 w-4 text-green-600 dark:text-green-400" />
      ),
      xlsx: (
        <FaFileExcel className="h-4 w-4 text-green-600 dark:text-green-400" />
      ),
      ppt: (
        <FaFilePowerpoint className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      ),
      pptx: (
        <FaFilePowerpoint className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      ),
      png: <Image className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
      jpg: <Image className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
      jpeg: <Image className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
      svg: <Image className="h-4 w-4 text-purple-600 dark:text-purple-400" />,
      zip: (
        <FaFileArchive className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      ),
      rar: (
        <FaFileArchive className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      ),
    };

    return iconMap[ext] || <File className="h-4 w-4 text-gray-500" />;
  };

  const openFolder = (id: string) => navigate(`/home/files/folder/${id}`);

  const [files, setFiles] = useState<Files[]>([]);

  const [showPanel, setShowPanel] = useState(false);

  const [selectedFile, setSelectedFile] = useState<Files | null>(null);

  const handleInfoClick = (file: Files) => {
    setSelectedFile(file);
    setShowPanel(true);
  };

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  // const [fileToRename, setFileToRename] = useState<Files | null>(null);
  const [newFileName, setNewFileName] = useState("");

  const handleRenameClick = (file: Files) => {
    // setFileToRename(file);
    setNewFileName(file.name);
    setEditDialogOpen(true);
  };

  const handleShareClick = (file: Files) => {
    setSelectedFile(file);
    setShareDialogOpen(true);
  };

  const handleCopy = async () => {
    const input = document.getElementById("link") as HTMLInputElement;
    if (input) {
      input.select();
      document.execCommand("copy");
      // toast.success("Enlace copiado al portapapeles")
      toast.success("Enlace copiado al portapapeles!", {
        style: {
          "--normal-bg":
            "color-mix(in oklab, light-dark(var(--color-green-600), var(--color-green-400)) 10%, var(--background))",
          "--normal-text":
            "light-dark(var(--color-green-600), var(--color-green-400))",
          "--normal-border":
            "light-dark(var(--color-green-600), var(--color-green-400))",
        } as React.CSSProperties,
      });
    }
  };

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getData();
      setFiles(data);
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      <div className="flex flex-1">
        <div className={`p-8 ${showPanel ? "w-3/4" : "w-full"}`}>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
              <Input placeholder="Búsqueda" className="pl-10" />
            </div>
            {/* Activar luego cuando se implmenten permisos para los usuarios en el panel de configuraciones */}
            {/* <div>
              <Button variant="outline" onClick={() => navigate("/settings/papelera")}>
                <Trash2 />
                <span>Papelera</span>
              </Button>
            </div> */}
          </div>

          <div className="flex flex-col gap-6 mt-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium text-muted-foreground">
                  Carpetas
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {folders?.map((folder) => (
                  <div
                    key={folder.id}
                    role="button"
                    onClick={() => openFolder(folder.id)}
                    className="group relative flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
                  >
                    <div className="flex h-10 w-10 items-center justify-center">
                      <Folder className="h-6 w-6" fill="currentColor" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-foreground truncate">
                        {folder.name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {folder.minio_path}
                      </p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Descargar</DropdownMenuItem>
                        <DropdownMenuItem>Cambiar nombre</DropdownMenuItem>
                        <DropdownMenuItem>Compartir</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-4">
            <Tabs
              value={viewMode}
              onValueChange={(v) => setViewMode(v as "list" | "grid")}
            >
              <div className="flex items-center gap-2 justify-between">
                <h2 className="text-sm font-medium text-muted-foreground">
                  Archivos
                </h2>
                <div className="flex items-center gap-2">
                  <TabsList>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="list">
                          <TextAlignStart className="h-4 w-4" />
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Diseño de lista</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger value="grid">
                          <LayoutGrid className="h-4 w-4" />
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Diseño de cuadrícula</p>
                      </TooltipContent>
                    </Tooltip>
                  </TabsList>
                </div>
              </div>

              <TabsContent value="list">
                <div>
                  <DataTable
                    columns={columns}
                    data={files}
                    onInfoClick={handleInfoClick}
                    onRowClick={(file) => {
                      if (showPanel) {
                        handleInfoClick(file);
                      }
                    }}
                    onRenameClick={handleRenameClick}
                    onShareClick={handleShareClick}
                    isPanelOpen={showPanel}
                  />
                </div>
              </TabsContent>

              <TabsContent value="grid">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {files?.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-start gap-3 rounded-lg border bg-card p-4"
                    >
                      <div className="flex h-10 w-10 items-center justify-center">
                        {getFileIcon(file.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate">
                          {file.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {file.created_at} · {file.file_size}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Descargar</DropdownMenuItem>
                          <DropdownMenuItem>Compartir</DropdownMenuItem>
                          <DropdownMenuItem>Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        {/* Panel derecho */}
        {showPanel && selectedFile && (
          <div className="flex flex-1 pt-8 pb-8 pr-8 w-1/4">
            <Card className="w-full">
              <CardContent className="p-6 flex flex-col gap-6">
                {/* Encabezado */}
                <div className="flex items-center justify-between">
                  <CardTitle className="truncate text-lg font-semibold">
                    {selectedFile.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPanel(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Vista previa */}
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 rounded-xl flex items-center justify-center">
                    <File className="h-24 w-24 text-muted-foreground" />
                  </div>
                  <div className="text-xs text-muted-foreground italic">
                    Vista previa no disponible
                  </div>
                </div>

                <Separator />
                {/* Acceso - Habilitar esta sección cuando se implemente la funcionalidad */}
                {/* <div className="flex flex-col gap-3">
                  <div className="text-sm font-semibold">
                    Usuarios con acceso
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">Tú</div>
                      <div className="text-xs">Privado</div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Administrar acceso
                  </Button>
                </div>

                <Separator /> */}

                {/* Detalles */}
                <div className="flex flex-col gap-3">
                  <div className="text-sm font-semibold ">
                    Detalles del archivo
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="text-xs text-muted-foreground">Tipo</div>
                    <div className="text-sm font-medium">Archivo DOCX</div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="text-xs text-muted-foreground">Tamaño</div>
                    <div className="text-sm font-medium">400 KB</div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="text-xs text-muted-foreground">
                      Ubicación
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 justify-start"
                    >
                      <Folder className="h-4 w-4" />
                      <span className="truncate">Nombre de la carpeta</span>
                    </Button>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="text-xs text-muted-foreground">Creado</div>
                    <div className="text-sm font-medium">
                      {selectedFile.created_at}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar nombre</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="Nuevo nombre"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="max-w-md space-y-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Administrar enlace
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha de expiración</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date"
                    className="w-full justify-between font-normal"
                  >
                    {date ? date.toLocaleDateString() : "Selecciona una fecha"}
                    <CalendarClock className="ml-2 h-4 w-4 opacity-70" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={date}
                    disabled={{ before: new Date() }}
                    onSelect={(date) => {
                      setDate(date);
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Enlace</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="link"
                  value="https://www.adobe.com/es/fefefefefef"
                  placeholder="https://tuenlace.com/..."
                  className="flex-1"
                />
                <Button
                  size="icon"
                  title="Copiar enlace"
                  className="cursor-pointer"
                  onClick={handleCopy}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Esta es una version completa similar al dialog compartir de drive */}
      {/* <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compartir value={newFileName}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Añadir usuarios"
            />
          </div>
          <div>
            <div>
              Personas con acceso
            </div>
            <div>
              <div className="flex">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="felx flex-col">
                  <div className="text-sm font-medium">
                    Carlos Iparraguirre (tu)
                  </div>
                  <div className="text-xs">
                    carlosipaca20003@gmail.com
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div>
              Acceso general
            </div>
            <div>
              <div className="flex">
                <EarthLock/>
                <div className="felx flex-col">
                  <div className="text-sm font-medium">
                    Restringido
                  </div>
                  <div className="text-xs">
                    Solo usuarios con acceso pueden abrir el enlace
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">
                <Link2/>
                Copiar enlace
              </Button>
            </DialogClose>
            <Button>Hecho</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </div>
  );
}
