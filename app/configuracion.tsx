// app/configuracion.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { useAuth } from "./authContext"; // Importa el contexto

export default function ConfiguracionScreen() {
  const { updateUser } = useAuth(); // Obtén la función para actualizar el usuario
  const router = useRouter();
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const user = JSON.parse(userData);
        setName(user.name);
        setLastName(user.lastName);
        setEmail(user.email);
        setPhoto(user.photo || null);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    try {
      const userData = { name, lastName, email, photo }; // Incluye la foto
      console.log("Datos enviados al backend:", userData); // Verifica los datos enviados
      const token = await AsyncStorage.getItem("authToken");

      const response = await fetch("http://localhost:8081/updateUser", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
        updateUser(updatedUser); // Actualiza los datos en el contexto
        Alert.alert("Éxito", "Tus datos han sido actualizados.");
        router.back(); // Regresa al Home
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.error || "No se pudieron actualizar los datos.");
      }
    } catch (error) {
      console.error("Error en handleSave:", error);
      Alert.alert("Error", "Hubo un problema al actualizar los datos.");
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      console.log("Imagen seleccionada:", result.assets[0].uri); // Verifica la URI de la imagen
      setPhoto(result.assets[0].uri); // Guarda la URI de la imagen seleccionada
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 pt-6 bg-white">
        {/* Botón de retroceder */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center mb-4"
        >
          <AntDesign name="arrowleft" size={24} color="#1d4ed8" />
          <Text className="ml-2 text-lg font-semibold text-blue-900">
            Configuración
          </Text>
        </TouchableOpacity>

        {/* Foto de perfil */}
        <TouchableOpacity onPress={pickImage} className="items-center mb-6">
          {photo ? (
            <Image source={{ uri: photo }} className="w-24 h-24 rounded-full" />
          ) : (
            <View className="w-24 h-24 bg-gray-200 rounded-full items-center justify-center">
              <Text className="text-gray-500">Añadir Foto</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Formulario */}
        <TextInput
          placeholder="Nombre"
          value={name}
          onChangeText={setName}
          className="px-4 py-3 mb-4 text-sm bg-gray-100 rounded-full"
        />
        <TextInput
          placeholder="Apellido"
          value={lastName}
          onChangeText={setLastName}
          className="px-4 py-3 mb-4 text-sm bg-gray-100 rounded-full"
        />
        <TextInput
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          className="px-4 py-3 mb-6 text-sm bg-gray-100 rounded-full"
        />

        <TouchableOpacity
          onPress={handleSave}
          className="w-full py-3 bg-blue-500 rounded-full"
        >
          <Text className="text-sm font-semibold text-center text-white">
            Guardar Cambios
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
