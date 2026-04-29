// "use client";

// import { useState } from "react";
// import type { Solicitud } from "../../../types/requestsTypes";

// export function useDetailsSheet() {
//   const [selectedSolicitud, setSelectedSolicitud] =
//     useState<Solicitud | null>(null);
//   const [isOpen, setIsOpen] = useState(false);

//   const openDetails = (solicitud: Solicitud) => {
//     setSelectedSolicitud(solicitud);
//     setIsOpen(true);
//   };

//   const closeDetails = () => {
//     setIsOpen(false);
//     setTimeout(() => setSelectedSolicitud(null), 300);
//   };

//   return {
//     selectedSolicitud,
//     isOpen,
//     openDetails,
//     closeDetails,
//   };
// }

import { useState } from "react";
import type { Solicitud } from "@/types/requestsTypes";

export function useDetailsSheet() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openDetails = (solicitud: Solicitud) => {
    setSelectedId(solicitud.id);
    setIsOpen(true);
  };

  const closeDetails = () => {
    setIsOpen(false);
    setSelectedId(null);
  };

  return { selectedId, isOpen, openDetails, closeDetails };
}