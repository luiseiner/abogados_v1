import { Card, CardContent } from "@/components/ui/card";
import { CaseSummary } from "./case-summary";
import type { Caso } from "@/types/caseTypes";

interface CaseOverviewTabProps {
  caseData: Caso;
  onUpdate?: (field: string, value: string) => void;
}

export function CaseOverviewTab({ caseData, onUpdate }: CaseOverviewTabProps) {
  if (!caseData) return null;
  return (
    <div className="flex flex-col w-full gap-2">
      <div className="flex flex-col gap-6 md:flex-col">
        <Card className="flex-1">
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 flex flex-col gap-6">
                <CaseSummary
                  summary={caseData.resumen ?? ""}
                  plan={
                    caseData.objetivo ?? {
                      objetivo: "",
                      estrategia: "",
                      tiempo: "",
                      dificultades: "",
                      planb: "",
                    }
                  }
                  onUpdate={onUpdate}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
