import { useEffect } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        router.replace("/home"); // Redirige al home si está autenticado
      } else {
        router.replace("/login"); // Redirige al login si no está autenticado
      }
    };

    checkAuthentication();
  }, []);

  return null; // No renderiza nada mientras redirige
}
