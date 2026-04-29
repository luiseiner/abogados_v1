import { DataTable } from "@/pages/tables/tickets-data-table/data-table";
import { columns } from "@/pages/tables/tickets-data-table/columns";
import { Card, CardContent } from "@/components/ui/card";
import { useCallback, useEffect, useState } from "react";
import type { Ticket } from "@/types/ticketTypes";
import { ticketsAPI } from "@/services/ticketsService";
import { toast } from "sonner";
import { TicketSheet } from "./components/tickets-sheet";
import { useAuth } from "@/context/AuthContext";
import { TicketDetailSheet } from "./components/details-sheet";

interface TicketsManagementPanelProps {
  mode?: "all" | "mine";
}

export default function TicketsManagementPanel({
  mode = "all",
}: TicketsManagementPanelProps) {
  const { user } = useAuth();
  const [ticketsData, setTicketsData] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [pageCount, setPageCount] = useState(0);

  const fetchTicketsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const skip = pagination.pageIndex * pagination.pageSize;
      const limit = pagination.pageSize;

      const response =
        mode === "mine"
          ? await ticketsAPI.getMyTickets({ skip, limit })
          : await ticketsAPI.getAll({ skip, limit });

      setTicketsData(response.data);
      setPageCount(Math.ceil(response.total / limit));
    } catch (error: any) {
      toast.error(error.response?.data.detail || "Error al cargar tickets");
    } finally {
      setIsLoading(false);
    }
  }, [mode, pagination]);

  const handleRowClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsDetailOpen(true);
  };

  const handleUpdateTicket = (updatedTicket: Ticket) => {
    // Actualizamos la lista local para que la tabla cambie sin recargar todo de la API
    setTicketsData((prev) =>
      prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)),
    );
    // También actualizamos el seleccionado para que el Sheet muestre lo nuevo
    setSelectedTicket(updatedTicket);
  };

  useEffect(() => {
    fetchTicketsData();
  }, [fetchTicketsData]);

  return (
    <div className="flex">
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Card className="mb-8">
            <CardContent>
              <DataTable
                columns={columns}
                data={ticketsData}
                isLoading={isLoading}
                onNewTicket={() => setIsSheetOpen(true)}
                onRowClick={handleRowClick}
                pagination={pagination}
                onPaginationChange={setPagination}
                pageCount={pageCount}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      <TicketSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />

      {selectedTicket && (
        <TicketDetailSheet
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          ticket={selectedTicket}
          currentUserId={user?.id ?? 0}
          onUpdate={handleUpdateTicket}
        />
      )}
    </div>
  );
}
