// app/configuracion.tsx
import React, { useState } from "react";
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
import * as ImagePicker from "expo-image-picker";

export default function ConfiguracionScreen() {
  const [name, setName] = useState("Miguel");
  const [lastName, setLastName] = useState("Evangelista");
  const [email, setEmail] = useState("miguel@example.com");
  const [photo, setPhoto] = useState<string | null>(null);

  const handleSave = () => {
    Alert.alert("Datos guardados", "Tu información ha sido actualizada.");
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 pt-6 bg-white">
        <Text className="mb-4 text-xl font-bold text-blue-900">
          Configuración
        </Text>

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
