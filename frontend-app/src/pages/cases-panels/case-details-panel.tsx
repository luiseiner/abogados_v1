import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { casosAPI } from "@/services/casesSrevice";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ClipboardCheck,
  Files as FilesIcon,
  Grid2x2,
  RotateCcw,
  Settings2,
  Upload,
} from "lucide-react";
import { CaseOverviewTab } from "./tabs/case-overview-tab/cases-overview-tab";
import { CasePanelHeader } from "./header/case-panel-header";
import type {
  AccesoCaso,
  Caso,
  Objetivo,
  Tarea,
} from "@/types/caseTypes";
import { DataTable } from "./tabs/task-tab/table-layout.tsx/data-table";
import { columns } from "./tabs/task-tab/table-layout.tsx/columns";
import { DataTable as FilesDataTable } from "@/pages/tables/files-data-table/data-table";
import { columns as filescolumns } from "@/pages/tables/files-data-table/columns";
import type { Files } from "@/pages/tables/files-data-table/columns";

import { FileUploader, type FileUploaderRef } from "./components/file-uploader";
import { TaskFormDialog } from "./tabs/task-tab/task-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ActivityLog } from "./tabs/case-activity-tab/case-activity";
import { useCasePermissions } from "@/pages/cases-panels/hooks/use-case-permions";
import { Spinner } from "@/components/ui/spinner"

export default function CasePanel() {
  const { id } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<Caso | null>(null);
  const [caseTasks, setCaseTasks] = useState<Tarea[]>([]);
  const [caseActivity, setCaseActivity] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCaseTasksLoading, setCaseTasksLoading] = useState(false);
  const [isCaseActivityLoading, setCaseActivityLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Tarea | null>(null);
  
  const [isFilesLoading, setIsFilesLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  //Implementacion momentanea
  const [globalFilter, setGlobalFilter] = useState("");
  const fileUploaderRef = useRef<FileUploaderRef>(null);
  
  const [newFileName, setNewFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [filesData, setFilesData] = useState<Files[]>([]);
  const [renamingFile, setRenamingFile] = useState<Files | null>(null);
  const [infoFile, setInfoFile] = useState<Files | null>(null);
  const [fileToDelete, setFileToDelete] = useState<Files | Files[] | null>(null);

  const { canEdit, canManage } = useCasePermissions(caseData?.asignados ?? []);

  const fetchCaseDetailsData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const response = await casosAPI.getCaseDetails(Number(id));
      setCaseData(response);
    } catch (error: any) {
      toast.error(
        error.response?.data?.detail || "Error al cargar detalles del caso",
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const fetchCaseTasks = useCallback(async () => {
    setCaseTasksLoading(true);
    try {
      const response = await casosAPI.getCaseTasks(Number(id));
      setCaseTasks(response);
    } catch (error: any) {
      toast.error(
        error.response?.data?.detail || "Error al cargar tareas del caso",
      );
    } finally {
      setCaseTasksLoading(false);
    }
  }, [id]);

  const handleUpdateTask = (tarea: Tarea & { _deleted?: boolean }) => {
    if (tarea._deleted) {
      setCaseTasks((prev) => prev.filter((t) => t.id !== tarea.id));
      return;
    }
    setCaseTasks((prev) => prev.map((t) => (t.id === tarea.id ? tarea : t)));
  };

  const fetchCaseActivity = useCallback(async () => {
    setCaseActivityLoading(true);
    try {
      const response = await casosAPI.getCaseActivcity(Number(id));
      setCaseActivity(response);
    } catch (error: any) {
      toast.error(
        error.response?.data?.detail || "Error al cargar la actividad del caso",
      );
    } finally {
      setCaseActivityLoading(false);
    }
  }, [id]);

  const handleUpdateCase = async (data: {
    estado?: string;
    prioridad?: string;
  }) => {
    if (!id || !caseData) return;
    try {
      const updated = await casosAPI.update(Number(id), data);
      setCaseData(updated);
      toast.success("Caso actualizado");
    } catch {
      toast.error("Error al actualizar el caso");
    }
  };

  const handleSave = async (payload: Omit<Tarea, "id">) => {
    try {
      if (editingTask?.id) {
        const updated = await casosAPI.updateCaseTask(
          Number(id),
          editingTask.id,
          payload,
        );

        setCaseTasks((prev) =>
          prev.map((t) => (t.id === editingTask.id ? updated : t)),
        );
        toast.success("Tarea actualizada");
      } else {
        const created = await casosAPI.createCaseTask(Number(id), payload);

        setCaseTasks((prev) => [...prev, created]);
        toast.success("Tarea creada");
      }

      setIsDialogOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar la tarea");
    }
  };

  const fetchCaseFiles = useCallback(async () => {
    if (!id) return;
    setIsFilesLoading(true);
    try {
      const response = await casosAPI.getCaseFiles(Number(id));
      setFilesData(response);
    } catch {
      toast.error("Error al cargar los archivos");
    } finally {
      setIsFilesLoading(false);
    }
  }, [id]);

  const handleUpload = async () => {
    const filesToUpload = fileUploaderRef.current?.getFiles() || [];
    if (filesToUpload.length === 0) {
      toast.error("Por favor, selecciona al menos un archivo");
      return;
    }
    const toastId = toast.loading("Subiendo archivos...");
    try {
      await Promise.all(
        filesToUpload.map((file) => {
          const formData = new FormData();
          formData.append("file", file); // "file", no "files"
          return casosAPI.uploadCaseFile(Number(id), formData);
        }),
      );
      toast.success("Archivos subidos correctamente", { id: toastId });
      fileUploaderRef.current?.clearFiles();
      await fetchCaseFiles();
    } catch {
      toast.error("Error al subir los archivos", { id: toastId });
    }
  };

  useEffect(() => {
    fetchCaseDetailsData();
    fetchCaseTasks();
    fetchCaseFiles();
    fetchCaseActivity();
  }, [fetchCaseDetailsData, fetchCaseTasks, fetchCaseFiles, fetchCaseActivity]);

  const handleDownloadFromTable = (file: Files) => {
    // Ejemplo: abrir link de descarga directo
    window.open(
      `${import.meta.env.VITE_API_URL}/archivos/download/${file.id}`,
      "_blank",
    );
  };

  const handleDeleteFromTable = (file: Files | Files[]) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;

    try {
      if (Array.isArray(fileToDelete)) {
        await Promise.all(
          fileToDelete.map((f) => casosAPI.deleteCaseFile(Number(id), Number(f.id)))
        );
      } else {
        await casosAPI.deleteCaseFile(Number(id), Number(fileToDelete.id));
      }
      toast.success("Archivo eliminado");
      fetchCaseFiles();
    } catch {
      toast.error("No se pudo eliminar el archivo");
    } finally {
      setFileToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleAssignUsers = async (
    asignaciones: { usuario_id: number; acceso: AccesoCaso }[],
  ) => {
    try {
      // 1. Extraemos solo los IDs en un array
      const ids = asignaciones.map((a) => a.usuario_id);

      // 2. Tomamos el nivel de acceso del primer elemento (o uno por defecto)
      const nivelAcceso = asignaciones[0]?.acceso || "can_view";

      // 3. Una sola petición en lugar de muchas
      await casosAPI.addMembers(Number(id), ids, nivelAcceso);

      toast.success(
        ids.length === 1
          ? "Usuario agregado"
          : `${ids.length} usuarios agregados`,
      );
      fetchCaseDetailsData();
    } catch {
      toast.error("Error al agregar usuarios");
    }
  };

  const handleRemoveMember = async (usuarioId: number) => {
    try {
      await casosAPI.removeMember(Number(id), usuarioId);
      toast.success("Miembro removido");
      fetchCaseDetailsData();
    } catch {
      toast.error("Error al remover miembro");
    }
  };

  const handleChangeAccess = async (usuarioId: number, acceso: AccesoCaso) => {
    try {
      await casosAPI.updateMemberAccess(Number(id), usuarioId, acceso);
      toast.success("Acceso actualizado");
      fetchCaseDetailsData();
    } catch {
      toast.error("Error al actualizar acceso");
    }
  };

  const handleUpdateCaseContent = async (field: string, value: string) => {
    if (!id || !caseData) return;
    try {

      let payload: any;

      if (field === "summary") {
        payload = { resumen: value || "" };
      } else {
        // Creamos un objeto base seguro para evitar el error de spread sobre null/undefined
        const objetivoBase = caseData.objetivo || {
          objetivo: "",
          estrategia: "",
          dificultades: "",
          tiempo: "",
          planb: "",
        };

        payload = {
          objetivo: {
            ...objetivoBase,
            [field]: value,
          } as Objetivo, 
        };
      }

      const updated = await casosAPI.update(Number(id), payload);
      setCaseData(updated);
      toast.success("Guardado");
    } catch {
      toast.error("Error al guardar");
    }
  };

  const handleInfoClick = (file: Files) => console.log("Click en fila", file);
  const handleRowClick = (file: Files) => console.log("Click en fila", file);
  const handleRenameClick = (file: Files) => {
    setRenamingFile(file);
    setNewFileName(file.name.replace(/\.[^/.]+$/, "")); // nombre sin extensión
  };
  const handleShareClick = (file: Files) => console.log("Compartir", file);
  const handleDownloadMultiple = () =>
    console.log("Descargar seleccionados", selectedIds);

  const handleRenameConfirm = async () => {
    if (!renamingFile || !newFileName.trim()) return;
    try {
      await casosAPI.renameFile(Number(renamingFile.id), newFileName.trim());
      toast.success("Archivo renombrado");
      setRenamingFile(null);
      await fetchCaseFiles();
    } catch {
      toast.error("Error al renombrar el archivo");
    }
  };

  const handlePreviewClick = async (file: Files) => {
    setInfoFile(file);
    try {
      const { url } = await casosAPI.getFilePreviewUrl(Number(file.id));

      // 1. Limpieza de URL (Eliminamos HTTP si el backend lo envía mal por error)
      // Los visores externos de Microsoft/Google RECHAZAN links que no sean HTTPS
      const secureUrl = url.replace("http://", "https://");

      // 2. Clasificación de archivos
      const isPdfOrImage =
        file.mime_type === "application/pdf" ||
        file.mime_type?.startsWith("image/");

      if (isPdfOrImage) {
        // Para PDF e Imágenes, usamos la URL directa de MinIO.
        // Esto es más rápido y no dependes de servicios externos.
        setPreviewUrl(secureUrl);
      } else {
        // 3. Para todo lo demás (Excel, Word, Powerpoint), usamos Microsoft Office Viewer
        // Es mucho más estable que el de Google para archivos .xlsx
        const microsoftUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(secureUrl)}`;
        setPreviewUrl(microsoftUrl);
      }
    } catch {
      toast.error("No se pudo cargar la preview");
    }
  };

  if (isLoading && !caseData) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Spinner className="size-8 text-primary" />
          <p className="text-sm text-muted-foreground">
            Cargando expediente...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="flex-1 overflow-auto overflow-x-hidden">
        <div className="p-6">
          <div className="mb-8">
            {caseData && (
              <CasePanelHeader
                caseData={caseData}
                caseId={`Expediente: ${caseData.expediente}`}
                client={`${caseData.cliente?.nombre} ${caseData.cliente?.apellido ?? ""}`}
                status={caseData.estado ?? "pendiente"}
                lastUpdated={caseData.updated_at}
                priority={(caseData.prioridad as "Alta" | "Media" | "Baja" | "Urgente") ?? "Media"}
                value={65}
                assignees={
                  caseData?.asignados?.map((asignado) => ({
                    id: asignado.usuario.id,
                    name: `${asignado.usuario.nombre} ${asignado.usuario.apellido}`,
                    avatar: `https://ui-avatars.com/api/?name=${asignado.usuario.nombre}+${asignado.usuario.apellido}`,
                    fallback: asignado.usuario.nombre[0],
                  })) || []
                }
                members={caseData.asignados || []}
                onAiReview={() => {}}
                onInvite={canManage ? handleAssignUsers : undefined}
                onStatusChange={canEdit ? (s) => handleUpdateCase({ estado: s }) : undefined}
                onPriorityChange={canEdit ? (p) => handleUpdateCase({ prioridad: p }) : undefined}
                onRemoveMember={canManage ? handleRemoveMember : undefined}
                onChangeAccess={canManage ? handleChangeAccess : undefined}
              />
            )}
            <Tabs defaultValue="overview" className="w-full ">
              <TabsList variant="line">
                <TabsTrigger value="overview">
                  <Grid2x2 />
                  General
                </TabsTrigger>
                <TabsTrigger value="task">
                  <ClipboardCheck />
                  Tareas
                </TabsTrigger>
                <TabsTrigger value="files">
                  <FilesIcon /> Documentos
                </TabsTrigger>
                <TabsTrigger value="activity">
                  <RotateCcw />
                  Actividad
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings2 />
                  Configuración
                </TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                {caseData && (
                  <CaseOverviewTab
                    caseData={caseData}
                    onUpdate={canEdit ? handleUpdateCaseContent : undefined}

                  />
                )}
              </TabsContent>
              {caseData && (
                <TabsContent value="task">
                  <DataTable
                    columns={columns}
                    data={caseTasks}
                    isLoading={isCaseTasksLoading}
                    onNewTask={canEdit ? () => setIsDialogOpen(true) : undefined}
                    members={(caseData.asignados ?? []).map((a) => a.usuario)}
                    casoId={Number(id)}
                    // onUpdateTask={(updated) =>
                    //   setCaseTasks((prev) =>
                    //     prev.map((t) => (t.id === updated.id ? updated : t)),
                    //   )
                    // }
                    onUpdateTask={handleUpdateTask}
                    canEdit={canEdit}
                  ></DataTable>
                  <TaskFormDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    onSave={handleSave}
                    defaultStatus="pendiente"
                    task={null}
                    casoId={Number(id)}
                    members={(caseData.asignados ?? []).map((a) => a.usuario)}
                  />
                </TabsContent>
              )}

              <TabsContent value="files">
                <Card>
                  <CardContent className="text-sm">
                    <div className="mb-2 gap-2 flex flex-col justify-between sm:flex-row">
                      <Input
                        placeholder="Buscar archivos"
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                      />
                      {canEdit && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <Upload className="w-4 h-4" />
                            Subir archivos
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Subir archivos al caso</DialogTitle>
                          </DialogHeader>
                          <FileUploader ref={fileUploaderRef} />
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button type="submit" onClick={handleUpload}>
                              Subir
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      )}
                    </div>
                    {isFilesLoading ? (
                      <div className="py-10 text-center">
                        Cargando documentos...
                      </div>
                    ) : (
                      <FilesDataTable
                        columns={filescolumns}
                        data={filesData}
                        onInfoClick={handleInfoClick}
                        onPreviewClick={handlePreviewClick}
                        onRowClick={handleRowClick}
                        onRenameClick={canEdit ? handleRenameClick : undefined}
                        onShareClick={canManage ? handleShareClick : undefined}
                        onDownloadClick={handleDownloadFromTable}
                        onDownloadSelectedClick={handleDownloadMultiple}
                        onSelectionChange={(ids) =>
                          setSelectedIds(ids as string[])
                        }
                        onDeleteClick={canEdit ? handleDeleteFromTable : undefined}
                        // isPanelOpen={showPanel}
                        isPanelOpen={!!infoFile}
                        globalFilter={globalFilter}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="activity">
                <Card>
                  <CardContent className="text-muted-foreground text-sm pt-6">
                    {isCaseActivityLoading ? (
                      <div className="flex items-center justify-center py-10">
                        <RotateCcw className="h-5 w-5 animate-spin mr-2" />
                        <span>Cargando historial de actividad...</span>
                      </div>
                    ) : (
                      <ActivityLog logs={caseActivity} />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>
                      Manage your account preferences and options. Customize
                      your experience to fit your needs.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-muted-foreground text-sm">
                    Configure notifications, security, and themes.
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <Dialog
        open={!!renamingFile}
        onOpenChange={(open) => !open && setRenamingFile(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar nombre</DialogTitle>
          </DialogHeader>
          <Input
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRenameConfirm()}
            placeholder="Nuevo nombre"
            autoFocus
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleRenameConfirm}>Renombrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!infoFile}
        onOpenChange={(open) => !open && setInfoFile(null)}
      >
        <DialogContent className="mb-8 flex h-[calc(100vh-2rem)] min-w-[calc(100vw-2rem)] flex-col justify-between gap-0 p-0">
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="px-6 pt-4 pb-4">Vista previa</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <iframe
              src={previewUrl}
              className="w-full flex-1"
              frameBorder="0"
            />
          )}
        </DialogContent>
      </Dialog>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Mover a la papelera?</AlertDialogTitle>
            <AlertDialogDescription>
              Este archivo será movido a la papelera. Podrás recuperarlo desde
              allí si es necesario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Mover a papelera
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
