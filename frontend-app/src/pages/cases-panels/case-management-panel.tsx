import { DataTable } from "@/pages/tables/cases-data-table/data-table";
import { createColumns } from "@/pages/tables/cases-data-table/columns";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react"
import { casosAPI } from "@/services/casesSrevice";
import type { Caso } from "@/types/caseTypes";
import { CaseRegistrationSheet } from "../tables/cases-data-table/case-sheet";

interface CaseManagementPanelProps {
  mode?: "all" | "mine";  
}

export default function ManagementCasesPanel({ mode = "all" }: CaseManagementPanelProps) {
  const [casesData, setCasesData] = useState<Caso[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  

  const [editingCase, setEditingCase] = useState<Caso | null>(null);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [pageCount, setPageCount] = useState(0);

  const fetchCasesData = useCallback(async () => {
    setIsLoading(true);
    try {
      const skip = pagination.pageIndex * pagination.pageSize;
      const limit = pagination.pageSize;

      const response =
        mode === "mine"
          ? await casosAPI.getMyCases({ skip, limit })
          : await casosAPI.getAll({ skip, limit });

      setCasesData(response.data); 
      setPageCount(Math.ceil(response.total / limit));
    } catch (error: any) {
      toast.error(error.response?.data.detail || "Error al cargar casos");
    } finally {
      setIsLoading(false);
    }
  }, [mode, pagination]);

  const handleCaseSubmit = async (data: any) => {
    try {
      if (editingCase) {
        
        await casosAPI.update(editingCase.id, data);
        toast.success("Caso actualizado exitosamente");
      } else {
        // Modo creación → POST
        await casosAPI.create(data);
        toast.success("Caso creado exitosamente");
      }
      fetchCasesData();
      setIsSheetOpen(false);
      setEditingCase(null);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Error al guardar caso");
    }
  };

  const handleCaseDelete = async (data: Caso) => {
    try{
      await casosAPI.deleteCase(data.id);
      toast.success("Caso eliminado correctamente");
      fetchCasesData();
    } catch (error: any){
      toast.error(
        error.response?.data?.detail || "No se pudo eliminar el caso"
      );
    }
  }

  const handleEdit = (caso: Caso) => {
    setEditingCase(caso);
    setIsSheetOpen(true);
  };

  const columns = createColumns(handleEdit, handleCaseDelete);
  
  useEffect(() => {
    fetchCasesData();
  }, [fetchCasesData]);

  return (
    <div className="flex">
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Card className="mb-8">
            <CardContent>
              <DataTable
                columns={columns}
                data={casesData}
                isLoading={isLoading}
                // onNewCase={() => setIsSheetOpen(true)}
                onNewCase={() => {
                  setEditingCase(null); 
                  setIsSheetOpen(true);
                }}
                pagination={pagination}
                onPaginationChange={setPagination}
                pageCount={pageCount}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      <CaseRegistrationSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSubmit={handleCaseSubmit}
        editingCase={editingCase}
      />
    </div>
  );
}
