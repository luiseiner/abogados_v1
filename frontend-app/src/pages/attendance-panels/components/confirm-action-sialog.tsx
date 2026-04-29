import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ConfirmActionDialogProps {
  title: string;
  description: string;
  buttonText: string;
  icon: React.ReactNode;
  onConfirm: () => void;
  variant?: "default" | "destructive" | "outline";
  loading?: boolean;
}

export const ConfirmActionDialog = ({
  title,
  description,
  buttonText,
  icon,
  onConfirm,
  variant = "default",
  loading
}: ConfirmActionDialogProps) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant={variant} className="w-full" disabled={loading}>
        {icon} {buttonText}
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm}>Confirmar</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);