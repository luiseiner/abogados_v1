import { EditableText } from "@/components/editable-text";

interface CaseSummaryProps {
  summary: string;
  plan: {
    objetivo: string;
    estrategia: string;
    tiempo: string;
    dificultades: string;
    planb: string;
  };
  onUpdate?: (field: string, value: string) => void;
}

export function CaseSummary({ summary, plan, onUpdate }: CaseSummaryProps) {
  const fields = [
    { label: "Objetivo", key: "objetivo", value: plan.objetivo, danger: false },
    { label: "Estrategia", key: "estrategia", value: plan.estrategia, danger: false },
    { label: "Tiempo", key: "tiempo", value: plan.tiempo, danger: false },
    { label: "Dificultades", key: "dificultades", value: plan.dificultades, danger: true },
    { label: "Plan B", key: "planb", value: plan.planb, danger: false },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Resumen */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Resumen del caso</h2>
        <EditableText
          value={summary}
          onSave={onUpdate ? (val) => onUpdate("summary", val) : undefined}
        />
      </div>

      {/* Plan */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold">Plan del Caso</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(({ label, key, value, danger }) => (
            <div key={key} className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {label}
              </span>
              <EditableText
                value={value}
                danger={danger}
                onSave={onUpdate ? (val) => onUpdate(key, val) : undefined}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}