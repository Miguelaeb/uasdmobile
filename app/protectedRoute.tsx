import React from "react";
import { useAuth } from "./authContext";
import { useRouter } from "expo-router";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    router.replace("/login"); // Redirige al login si no está autenticado
    return null; // Evita renderizar el contenido mientras redirige
  }

  return <>{children}</>;
};