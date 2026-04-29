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
            <Construction className="text-red-600 dark:text-red-400" />
          </EmptyMedia>
          <EmptyTitle>Este panel esta obsoleto</EmptyTitle>
          <EmptyDescription className="max-w-xs text-pretty">
            Este panel ya no esta disponible
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
