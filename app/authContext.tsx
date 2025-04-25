import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "expo-router";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Simula la verificación de autenticación (puedes usar AsyncStorage o SecureStore)
    const token = localStorage.getItem("authToken"); // Cambia esto según tu lógica
    setIsAuthenticated(!!token);
  }, []);

  const login = (token: string) => {
    localStorage.setItem("authToken", token); // Guarda el token
    setIsAuthenticated(true);
    router.replace("/home"); // Redirige al home después de iniciar sesión
  };

  const logout = () => {
    localStorage.removeItem("authToken"); // Elimina el token
    setIsAuthenticated(false);
    router.replace("/login"); // Redirige al login después de cerrar sesión
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};