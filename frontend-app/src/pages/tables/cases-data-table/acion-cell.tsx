import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ellipsis, SquarePen, TextAlignStart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { Caso } from "@/types/caseTypes";

interface ActionsCellProps {
  row: any;
  onEdit?: (caso: Caso) => void;
  onDelete?: (caso: Caso) => void; 
}

export const ActionsCell = ({ row, onEdit, onDelete }: ActionsCellProps) => {
  const navigate = useNavigate();
  const caso = row.original;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <Ellipsis className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* Ahora el navigate funcionará perfectamente */}
        <DropdownMenuItem onClick={() => navigate(`/home/management-cases/case/${caso.id}`)}>
          <TextAlignStart className="mr-2 h-4 w-4" />
          Detalles
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onEdit?.(caso)}>
          <SquarePen className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={() => onDelete?.(caso)}>
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};