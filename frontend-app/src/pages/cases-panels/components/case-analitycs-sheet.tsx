import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CaseDashboardTab } from "./case-dashboard";
import type { Caso } from "@/types/caseTypes";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CaseAnalitycsSheetProps {
  caseData: Caso;
}

export function CaseAnalitycsSheet({ caseData }: CaseAnalitycsSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          Estadísticas
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full md:max-w-xl lg:max-w-4xl ">
        <ScrollArea className="h-full">
          <SheetHeader>
            <SheetTitle>Estadisticas</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-4">
            <CaseDashboardTab casoId={caseData.id} />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
