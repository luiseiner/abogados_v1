import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function ListaArchivos({
  archivos,
  onRemove,
}: {
  archivos: globalThis.File[];
  onRemove: (index: number) => void;
}) {
  const INICIAL = 2;
  const POR_PAGINA = 3;
  const [expandido, setExpandido] = useState(false);

  if (!archivos.length) return null;

  const visibles = expandido ? archivos : archivos.slice(0, INICIAL);
  const ocultos = archivos.length - INICIAL;

  return (
    <div className="space-y-2">
      <ul
        className={cn(
          "space-y-2",
          // scroll solo cuando está expandido y hay más de INICIAL + POR_PAGINA
          expandido && archivos.length > INICIAL + POR_PAGINA
            ? `max-h-[${POR_PAGINA * 52}px] overflow-y-auto pr-1`
            : "",
        )}
        style={
          expandido && archivos.length > INICIAL + POR_PAGINA
            ? {
                maxHeight: `${POR_PAGINA * 52}px`,
                overflowY: "auto",
                paddingRight: "4px",
              }
            : {}
        }
      >
        {visibles.map((file, index) => (
          <li
            key={index}
            className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm"
          >
            <div className="flex items-center gap-2 min-w-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 shrink-0 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="truncate text-foreground">{file.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                ({(file.size / 1024).toFixed(0)} KB)
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
              onClick={() => onRemove(index)}
            >
              ✕
            </Button>
          </li>
        ))}
      </ul>

      {/* Ver más / Ver menos */}
      {archivos.length > INICIAL && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full text-xs text-muted-foreground hover:text-foreground border border-dashed"
          onClick={() => setExpandido(!expandido)}
        >
          {expandido
            ? "Ver menos ↑"
            : `+${ocultos} archivo${ocultos > 1 ? "s" : ""} más`}
        </Button>
      )}
    </div>
  );
}
