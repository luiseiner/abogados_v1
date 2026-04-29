import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Construction } from "lucide-react";

export default function AdminPanel() {
  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <Empty className="h-full bg-muted/30">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Construction className="text-sky-600 dark:text-sky-400" />
          </EmptyMedia>
          <EmptyTitle>Panel en desarrollo</EmptyTitle>
          <EmptyDescription className="max-w-xs text-pretty">
            Este panel estara disponible pronto...
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
