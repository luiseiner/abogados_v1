import {
  Scale,
  Wallet,
  // Calculator,
  Folder,
  Users,
  SquareTerminal,
  LifeBuoy,
  Send,
  Settings,
  BookUser,
} from "lucide-react";

export interface NavigationItem {
  title: string;
  url: string;
  icon: any;
  permission?: string;
  badge?:string;
  items?: Array<{
    title: string;
    url: string;
    permission?: string;
    badge?: string;
  }>;
  isActive?: boolean;
}

export interface NavigationConfig {
  navMain: NavigationItem[];
  navPersons: NavigationItem[];
  navSecondary: NavigationItem[];
}

export const navigationConfig: NavigationConfig = {
  navMain: [
    {
      title: "Panel de Control",
      url: "/home",
      icon: SquareTerminal,
      permission: "canViewPanelControl",
      items: [
        {
          title: "Dashboard",
          url: "/home",
        },
        {
          title: "Tickets",
          url: "/home/ticket-management",
          permission: "tickets.view_all",
          badge: "Beta",
        },
        {
          title: "Mis Tickets",
          url: "/home/my-tickets",
          permission: "tickets.view_own",
          badge: "Beta",
        },
        {
          title: "Asistencia",
          url: "/home/attendance",
        },
        {
          title: "Solicitudes",
          url: "/home/user-requests",
        },
      ],
    },
    {
      title: "RR.HH",
      url: "#",
      icon: BookUser,
      permission: "canViewLegal",
      items: [
        {
          title: "Control de solicitudes",
          url: "/home/admin-requests",
        },
        {
          title: "Control de asistencia",
          url: "/home/attendance-control",
          badge: "Beta",
        },
        {
          title: "Horas extras",
          url: "/home/overtime",
          badge: "Deprecated",
        },
        {
          title: "Vacaciones",
          url: "/home/vacations",
          badge: "Alpha",
        },
      ],
    },
    {
      title: "Legal",
      url: "#",
      icon: Scale,
      permission: "canViewCasos",
      items: [
        {
          title: "Casos",
          url: "/home/case-management",
          permission: "cases.view_all",
        },
        {
          title: "Mis Casos",
          url: "/home/my-cases",
          permission: "cases.view_assigned",
        },
      ],
    },
    {
      title: "Comercial",
      url: "#",
      icon: Wallet,
      permission: "canViewComercial",
      items: [
        {
          title: "Cotizaciones",
          url: "/home/quotes",
        },
      ],
    },
    // {
    //   title: "Contabilidad",
    //   url: "#",
    //   icon: Calculator,
    //   permission: "canViewContabilidad",
    //   items: [
    //     {
    //       title: "Conciliación",
    //       url: "#",
    //     },
    //   ],
    // },
  ],
  navPersons: [
    {
      title: "Clientes",
      url: "/home/clients",
      icon: Users,
      permission: "canViewClientes",
    },
    {
      title: "Documentos",
      url: "/home/files",
      icon: Folder,
      permission: "canViewClientes",
      badge: "Beta",
    },
  ],
  navSecondary: [
    {
      title: "Soporte",
      url: "#",
      icon: LifeBuoy,
      permission: "canViewSoporte",
    },
    {
      title: "Comentarios",
      url: "https://forms.gle/bjopgtmQZ579yiix8",
      icon: Send,
      permission: "canViewComentarios",
    },
    {
      // reemplaza por la ruta de configuracion /settings cunado el panel de perfiles este listo
      title: "Configuración",
      url: "/settings/users",
      icon: Settings,
      permission: "canViewConfiguracion",
    },
  ],
};
