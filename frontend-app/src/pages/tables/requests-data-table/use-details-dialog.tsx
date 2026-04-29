// useNuevaSolicitudDialog.tsx
"use client";

import { useState } from "react";

export function useNuevaSolicitudDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const openDialog = () => setIsOpen(true);
  const closeDialog = () => setIsOpen(false);

  return {
    isOpen,
    openDialog,
    closeDialog,
  };
}