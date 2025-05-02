import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

interface AuthContextType {
  isAuthenticated: boolean;
  user: { name: string; lastName: string; email: string; photo?: string | null } | null;
  login: (token: string, userData: { name: string; lastName: string; email: string; photo?: string | null }) => void;
  logout: () => void;
  updateUser: (userData: { name: string; lastName: string; email: string; photo?: string | null }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthContextType["user"]>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuthToken = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const userData = await AsyncStorage.getItem("userData");
        setIsAuthenticated(!!token);
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Error al verificar el token de autenticación:", error);
      }
    };

    checkAuthToken();
  }, []);

  const login = async (token: string, userData: { name: string; lastName: string; email: string; photo?: string | null }) => {
    try {
      await AsyncStorage.setItem("authToken", token);
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      router.replace("/home");
    } catch (error) {
      console.error("Error al guardar el token o datos del usuario:", error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("userData");
      setUser(null);
      setIsAuthenticated(false);
      router.replace("/login");
    } catch (error) {
      console.error("Error al eliminar el token de autenticación:", error);
    }
  };

  const updateUser = async (userData: { name: string; lastName: string; email: string; photo?: string | null }) => {
    try {
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("Error al actualizar los datos del usuario:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUser }}>
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