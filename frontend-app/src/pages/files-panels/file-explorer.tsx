import React, { useEffect, useRef, useState, type JSX } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  Search,
  FolderPlus,
  MoreVertical,
  LayoutGrid,
  TextAlignStart,
  Upload,
  Download,
  Image,
  File,
  Trash2,
  PenLine,
  Info,
  UserPlus,
  Folder,
  X,
  Copy,
  CalendarClock,
  Clock,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";
import type { File as FileType, FolderItem } from "@/types/fileTypes";
import { toast } from "sonner";

import { DataTable } from "@/pages/tables/files-data-table/data-table";
import { columns, type Files } from "@/pages/tables/files-data-table/columns";
import { Label } from "@radix-ui/react-label";
import {
  FaFileArchive,
  FaFileExcel,
  FaFilePdf,
  FaFilePowerpoint,
  FaFileWord,
} from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function FilesExplorer() {
  const { token } = useAuth();
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { id } = useParams<{ id: string }>();
  const [folders, setFolders] = useState<FileType[]>();
  const [files, setFiles] = useState<FileType[]>();
  const [selectedFolder, setSelectedFolder] = useState<FolderItem>();
  const navigate = useNavigate();
  const [treeDirectory, setTreeDirectory] = useState<
    {
      id: string;
      name: string;
    }[]
  >();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [isLoanding, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [folderName, setFolderName] = useState("Carpeta sin título");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const [time, setTime] = useState({ hours: "10", minutes: "00" });
  const [presignedUrl, setPresignedUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    try {
      axios
        .get(`${API_URL}/capitalfarmer.co/api/v1/folders/${id}`)
        .then((response) => {
          setSelectedFolder(response.data);
        });

      axios
        .get(`${API_URL}/capitalfarmer.co/api/v1/folders/${id}/files`)
        .then((response) => {
          setFiles(
            response.data.filter((item: FileType) => item.is_directory != true),
          );
          setFolders(
            response.data.filter((item: FileType) => item.is_directory == true),
          );
        });
      loadBreadcrumbPath(id);
    } catch (e) {
      console.error("Error loading files and folders:", e);
    }
  }, [id]);

  const loadBreadcrumbPath = async (folderId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/capitalfarmer.co/api/v1/folders/${folderId}/path`,
      );
      const path = await response.json();
      setTreeDirectory(path.filter((item: FileType) => item.id != folderId));
    } catch (error) {
      console.error("Error loading breadcrumb:", error);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      Array.from(selectedFiles).forEach((file) => {
        formData.append("file", file);
      });

      const response = await axios.post(
        `${API_URL}/capitalfarmer.co/api/v1/files/upload/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              setUploadProgress(percentCompleted);
            }
          },
        },
      );

      console.log("Archivo subido exitosamente:", response.data);
      toast.success("Archivo subido exitosamente");

      // Recargar los archivos después de la subida exitosa
      const filesResponse = await axios.get(
        `${API_URL}/capitalfarmer.co/api/v1/folders/${id}/files`,
      );
      setFiles(
        filesResponse.data.filter(
          (item: FileType) => item.is_directory != true,
        ),
      );
      setFolders(
        filesResponse.data.filter(
          (item: FileType) => item.is_directory == true,
        ),
      );

      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setUploadProgress(0);
    } catch (error) {
      console.error("Error subiendo archivo(s):", error);
      alert("Error al subir el archivo. Intenta de nuevo.");
      toast.error("Error al subir el archivo", {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = (file: FileType) => {
    axios
      .get(`${API_URL}/capitalfarmer.co/api/v1/files/download/${file.name}`, {
        responseType: "blob",
      })
      .then((response) => {
        // Determina el nombre y tipo correcto
        const fileName = file.is_directory ? `${file.name}.zip` : file.name;

        // Crea el blob con el tipo correcto
        const blob = new Blob([response.data], { type: "application/zip" });
        const url = window.URL.createObjectURL(blob);

        // Crea y descarga
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error("Download failed:", error);
        alert(
          "Download failed: " + error.response?.data?.detail || error.message,
        );
      });
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      alert("Por favor ingresa un nombre para la carpeta");
      return;
    }

    setIsCreatingFolder(true);
    try {
      const formData = new FormData();
      formData.append("folder_name", folderName);
      const response = await axios.post(
        `${API_URL}/capitalfarmer.co/api/v1/folders/create/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      console.log("Carpeta creada exitosamente:", response.data);
      // Recargar las carpetas
      const filesResponse = await axios.get(
        `${API_URL}/capitalfarmer.co/api/v1/folders/${id}/files`,
      );
      setFolders(
        filesResponse.data.filter(
          (item: FileType) => item.is_directory == true,
        ),
      );
      setFiles(
        filesResponse.data.filter(
          (item: FileType) => item.is_directory != true,
        ),
      );
      // Cerrar diálogo y resetear
      setDialogOpen(false);
      setFolderName("Carpeta sin título");
    } catch (error) {
      console.error("Error creando carpeta:", error);
      alert("Error al crear la carpeta. Intenta de nuevo.");
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleDownloadMultiple = async () => {
    if (!selectedIds.length) {
      toast.error("Selecciona al menos un archivo antes de descargar");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/capitalfarmer.co/api/v1/files/download-multiple`,
        { file_ids: selectedIds },
        { responseType: "blob" },
      );

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `archivos_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error:", error);
      alert("Error al descargar los archivos");
    }
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

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

  const tableData: Files[] = React.useMemo(() => {
    if (!files && !folders) return [];

    const allItems = [
      ...(folders || []).map((folder) => ({
        id: folder.id,
        name: folder.name,
        created_at: folder.created_at,
        file_size: folder.file_size,
        is_directory: true,
      })),
      ...(files || []).map((file) => ({
        id: file.id,
        name: file.name,
        created_at: file.created_at,
        file_size: file.file_size,
        is_directory: false,
      })),
    ];

    return allItems;
  }, [files, folders]);

  const handleRowClick = (file: Files) => {
    if (file.is_directory) {
      openFolder(file.id);
    } else if (showPanel) {
      handleInfoClick(file);
      setShowPanel(true);
    }
  };


  const handleDownloadFromTable = (file: Files) => {
    const fileData: FileType = {
      id: file.id,
      name: file.name,
      created_at: file.created_at,
      file_size: file.file_size,
      is_directory: file.is_directory || false,
      minio_path: "",
      parent_id: id || null, // usa el id del folder actual
      mime_type: "", // o detecta el mime type del archivo
      deleted_at: null,
      is_deleted: false,
    };
    handleDownload(fileData);
  };

  const handleDeleteFromTable = async (data: Files | Files[]) => {
    try {
      if (!window.confirm(`¿Estás seguro de que deseas eliminar?`)) {
        return;
      }
      setIsLoading(true);

      if (Array.isArray(data)) {
        console.log("Deleting multiple:", data);
        const response = await axios.delete(
          `${API_URL}/capitalfarmer.co/api/v1/files/recycle-bin`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            data: data.map((file) => ({ id: file.id })),
          },
        );
        console.log("Files deleted:", response.data);
        toast.success(`${data.length} archivo(s) eliminado(s) exitosamente`);
      } else {
        console.log("Deleting single:", data);
        const response = await axios.delete(
          `${API_URL}/capitalfarmer.co/api/v1/files/${data.id}/recycle-bin`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        console.log("File deleted:", response.data);
        toast.success("Archivo eliminado exitosamente");
      }
    } catch (error) {
      console.error("Error deleting file:", error);

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.detail || "Error al eliminar archivo",
        );
      } else {
        toast.error("Error desconocido");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (size: string) => {
    const numSize = Number(size);
    if (numSize < 1024) return `${numSize} bytes`;
    if (numSize < 1024 * 1024) return `${(numSize / 1024).toFixed(2)} KB`;
    if (numSize < 1024 * 1024 * 1024)
      return `${(numSize / (1024 * 1024)).toFixed(2)} MB`;
    return `${(numSize / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleGetPresignedUrlByDate = async (file_id: string) => {
    console.log(selectedFile);
    try {
      setError("");
      setLoading(true);

      if (!date) {
        setError("Por favor selecciona una fecha");
        return;
      }
      const expirationDateTime = new Date(date);
      expirationDateTime.setHours(
        parseInt(time.hours),
        parseInt(time.minutes),
        0,
        0,
      );
      if (expirationDateTime <= new Date()) {
        setError("La fecha y hora deben ser en el futuro");
        return;
      }
      const isoString = expirationDateTime.toISOString();
      const response = await fetch(
        `${API_URL}/capitalfarmer.co/api/v1/files/get-presigned-url/${file_id}?expires_at=${encodeURIComponent(isoString)}`,
        {
          method: "POST",
        },
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error generating presigned URL");
      }
      const data = await response.json();
      setPresignedUrl(data.presigned_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (presignedUrl) {
      navigator.clipboard.writeText(presignedUrl);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="flex flex-1">
        <div className={`p-8 ${showPanel ? "w-3/4" : "w-full"}`}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
            <Input placeholder="Búsqueda" className="pl-10" />
          </div>

          <div className="space-y-4 mt-8">
            <Tabs
              value={viewMode}
              onValueChange={(v) => setViewMode(v as "list" | "grid")}
            >
              <div className="flex items-center gap-2 justify-between">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link to="/home/files">Home</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {treeDirectory?.map((item) => (
                      <React.Fragment key={item.id}>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbLink asChild>
                            <Link to={`/home/files/folder/${item.id}`}>
                              {item.name}
                            </Link>
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                      </React.Fragment>
                    ))}
                    {selectedFolder && (
                      <>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="flex itemas-center gap-1">
                              <BreadcrumbPage className="hover:cursor-pointer">
                                {selectedFolder.name}
                              </BreadcrumbPage>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <DropdownMenuItem
                                    onSelect={() => setDialogOpen(true)}
                                  >
                                    <FolderPlus className="w-4 h-4 mr-2" />
                                    Nueva carpeta
                                  </DropdownMenuItem>
                                </DialogTrigger>
                              </Dialog>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Descargar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <PenLine className="w-4 h-4 mr-2" />
                                Cambiar nombre
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Compartir
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Info className="w-4 h-4 mr-2" />
                                Información del archivo
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </BreadcrumbItem>
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Nueva carpeta</DialogTitle>
                            </DialogHeader>
                            <Input
                              id="folderNameInput"
                              defaultValue="Carpeta sin título"
                              value={folderName}
                              onChange={(e) => setFolderName(e.target.value)}
                            />
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Cancelar</Button>
                              </DialogClose>
                              <Button
                                onClick={handleCreateFolder}
                                disabled={isCreatingFolder}
                              >
                                {isCreatingFolder ? "Creando..." : "Crear"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </>
                    )}
                  </BreadcrumbList>
                </Breadcrumb>
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
                  <Button
                    variant="outline"
                    className="reounded-r-4xl"
                    onClick={() => setDialogOpen(true)}
                  >
                    <FolderPlus className="h-4 w-4" />
                    Nueva carpeta
                  </Button>
                  <Button
                    variant="outline"
                    className="reounded-r-4xl"
                    onClick={handleUploadClick}
                    disabled={isUploading}
                  >
                    <Upload className="h-4 w-4" />
                    {isUploading ? `Cargando... ${uploadProgress}%` : "Cargar"}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    accept="*/*"
                  />
                  <Button variant="outline" className="reounded-r-4xl">
                    <Download className="h-4 w-4" />
                    Descargar
                  </Button>
                </div>
              </div>

              <TabsContent value="list">
                {isLoanding ? (
                  <div className="flex justify-center p-10">
                    Cargando archivos...
                  </div>
                ) : (
                  <DataTable
                    columns={columns}
                    data={tableData}
                    onInfoClick={handleInfoClick}
                    onRowClick={handleRowClick}
                    onRenameClick={handleRenameClick}
                    onShareClick={handleShareClick}
                    onDownloadClick={handleDownloadFromTable}
                    onDownloadSelectedClick={handleDownloadMultiple}
                    onSelectionChange={setSelectedIds}
                    onDeleteClick={handleDeleteFromTable}
                    isPanelOpen={showPanel}

                  />
                )}
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
                          <DropdownMenuItem className="text-destructive">
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
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
                    <div className="text-sm font-medium">
                      {selectedFile.name.split(".").pop()?.toUpperCase() ||
                        "ARCHIVO"}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="text-xs text-muted-foreground">Tamaño</div>
                    <div className="text-sm font-medium">
                      {formatFileSize(selectedFile.file_size)}
                    </div>
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
                      <span className="truncate">
                        {selectedFolder?.name || "Sin ubicación"}
                      </span>
                    </Button>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="text-xs text-muted-foreground">Creado</div>
                    <div className="text-sm font-medium">
                      {formatDate(selectedFile.created_at)}
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
            {/* Date Selection */}
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
                    onSelect={(selectedDate) => {
                      setDate(selectedDate);
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Selection */}
            {date && (
              <div className="space-y-2">
                <Label htmlFor="time">Hora de expiración</Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 opacity-70" />
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={time.hours}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTime({
                        ...time,
                        hours: val === "" ? "" : val.padStart(2, "0"),
                      });
                    }}
                    className="w-12 rounded border px-0.5 py-1 text-center"
                    placeholder="HH"
                  />
                  <span>:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={time.minutes}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTime({
                        ...time,
                        minutes: val === "" ? "" : val.padStart(2, "0"),
                      });
                    }}
                    className="w-12 rounded border px-0.5 py-1 text-center"
                    placeholder="MM"
                  />
                </div>
              </div>
            )}

            {/* Generate URL Button */}
            <Button
              onClick={() => {
                if (selectedFile) {
                  handleGetPresignedUrlByDate(selectedFile.id);
                }
              }}
              disabled={!date || loading}
              className="w-full"
            >
              {loading ? "Generando..." : "Generar enlace"}
            </Button>

            {/* Error Message */}
            {error && (
              <div className="rounded bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Presigned URL Display */}
            {presignedUrl && (
              <div className="space-y-2">
                <Label htmlFor="link">Enlace</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="link"
                    value={presignedUrl}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    title="Copiar enlace"
                    className="cursor-pointer"
                    onClick={handleCopyLink}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Enlace expira el {date?.toLocaleDateString()} a las{" "}
                  {time.hours}:{time.minutes}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
