// components/user-avatar.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getAvatarColor } from "./avatar-color";


interface UserAvatarProps {
  nombre: string;
  apellido: string;
  avatar?: string;
  className?: string;
  showTooltip?: boolean;
}

export function UserAvatar({
  nombre,
  apellido,
  avatar,
  className,
  showTooltip = true,
}: UserAvatarProps) {
  const fullName = `${nombre} ${apellido}`;
  // Usamos el nombre completo para el hash, así garantizamos consistencia
  const backgroundColor = getAvatarColor(fullName); 
  const initials = `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();

  const avatarEl = (
    <Avatar
      className={cn(
        "h-7 w-7 ring-2 ring-background transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-md",
        className
      )}
    >
      {avatar && <AvatarImage src={avatar} alt={fullName} />}
      <AvatarFallback className={cn("text-[10px] text-white", backgroundColor)}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );

  if (!showTooltip) return avatarEl;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{avatarEl}</TooltipTrigger>
      <TooltipContent>{fullName}</TooltipContent>
    </Tooltip>
  );
}