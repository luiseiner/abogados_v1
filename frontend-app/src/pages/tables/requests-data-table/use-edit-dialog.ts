"use client";

import { useState } from "react";
import type { Solicitud } from "../../../types/requestsTypes";

export function useEditDialog() {
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openEdit = (solicitud: Solicitud) => {
    setSelectedSolicitud(solicitud);
    setIsOpen(true);
  };

  const closeEdit = () => {
    setIsOpen(false);
    setTimeout(() => setSelectedSolicitud(null), 300);
  };

  return {
    selectedSolicitud,
    isOpen,
    openEdit,
    closeEdit,
  };
}