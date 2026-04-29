import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PickerField } from "@/components/picker-field";
import { CASE_STATUSES, PRIORITIES} from "@/constants/picker-options";
import {
  Sparkle,
  RotateCcw,
} from "lucide-react";

import { MembersDialog } from "../components/members-dialog";
import type { AccesoCaso, AsignadoCaso, Caso } from "@/types/caseTypes";
import { CaseAnalitycsSheet } from "../components/case-analitycs-sheet";
// ─── tipos ────────────────────────────────────────────────────────────────────

interface Assignee {
  id: number;
  name: string;
  avatar?: string;
  fallback: string;
}

interface CasePanelHeaderProps {
  caseData: Caso;
  caseId: string;
  client: string;
  status: string;
  lastUpdated: string;
  priority?: "Baja" | "Media" | "Alta" | "Urgente";
  value?: number;
  assignees: Assignee[];
  members: AsignadoCaso[];
  onAnalitycs?: () => void;
  onAiReview?: () => void;
  onInvite?: (asignaciones: { usuario_id: number; acceso: AccesoCaso }[]) => void;
  onRemoveMember?: (usuarioId: number) => void;                    
  onChangeAccess?: (usuarioId: number, acceso: AccesoCaso) => void;
  onStatusChange?: (status: string) => void;
  onPriorityChange?: (priority: string) => void;
}

// ─── componente ───────────────────────────────────────────────────────────────

export function CasePanelHeader({
  caseData,
  caseId,
  client,
  status,
  lastUpdated,
  priority,
  assignees,
   members = [],
  onAiReview,
  onInvite,
  onRemoveMember,
  onChangeAccess,
  onStatusChange,
  onPriorityChange,
}: CasePanelHeaderProps) {

  const lastEdited = lastUpdated
  ? new Date(lastUpdated).toLocaleString("es-PE", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  : null;

  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b flex-wrap">
      {/* ── izquierda: identidad del caso ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <h3 className="text-base font-bold tracking-tight whitespace-nowrap">
          {caseId}
        </h3>

        <PickerField
          value={status}
          onChange={(value) => onStatusChange?.(value)}
          options={CASE_STATUSES}
          placeholder="Sin estado"
        />

        <PickerField
          value={priority ?? null}
          onChange={(value) => onPriorityChange?.(value)}
          options={PRIORITIES}
          placeholder="Sin prioridad"
        />

        <div className="w-px h-4 bg-border" />

        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {client}
        </span>

        <div className="w-px h-4 bg-border" />

        <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
          <RotateCcw className="h-3 w-3 opacity-50" />
          <span>Última edición {lastEdited}</span>
        </div>
      </div>

      {/* ── derecha: colaboradores + acciones ── */}
      <div className="flex items-center gap-2">
        {/* avatares apilados */}
        <div className="flex -space-x-2">
          {assignees.slice(0, 4).map((a, i) => (
            <Avatar key={i} className="h-7 w-7 ring-2 ring-background">
              {a.avatar && (
                <AvatarImage
                  src={a.avatar}
                  alt={a.name}
                  className="grayscale"
                />
              )}
              <AvatarFallback className="text-[10px]">
                {a.fallback}
              </AvatarFallback>
            </Avatar>
          ))}
          {assignees.length > 4 && (
            <div className="h-7 w-7 rounded-full ring-2 ring-background bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground">
              +{assignees.length - 4}
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-border mx-0.5" />

        {/* agregar */}
        {onInvite && (
          <MembersDialog
            members={members}
            onInvite={onInvite ?? (() => {})}
            onRemove={onRemoveMember ?? (() => {})}
            onChangeAccess={onChangeAccess ?? (() => {})}
          />
        )}
        <CaseAnalitycsSheet caseData={caseData} />

        {/* AI Review */}
        <Button
          variant="outline"
          size="sm"
          onClick={onAiReview}
          className="h-8 px-3 border-sky-200 bg-sky-50/50 hover:bg-sky-100/50 dark:border-sky-900 dark:bg-sky-950/30 group transition-all cursor-pointer"
        >
          <Sparkle className="h-3.5 w-3.5 fill-sky-600 text-sky-600 dark:fill-sky-400 dark:text-sky-400 group-hover:scale-110 transition-transform" />
          <span className="bg-linear-to-r from-sky-700 to-blue-500 dark:from-sky-300 dark:to-blue-200 bg-clip-text text-transparent font-semibold text-xs">
            AI Review
          </span>
        </Button>
        
      </div>
    </div>
  );
}
