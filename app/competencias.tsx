import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const API_BASE_URL = "http://localhost:8081"; // Reemplaza con la URL de tu backend

const BackButton = () => {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.push("/")} className="flex-row items-center p-2">
      <Feather name="arrow-left" size={24} color="#3b82f6" />
      <Text className="ml-2 text-blue-600 font-semibold">Volver</Text>
    </TouchableOpacity>
  );
};

interface Competencia {
  id: number;
  nombre: string;
  descripcion: string;
}

export default function CompetenciasScreen() {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [competencias, setCompetencias] = useState<Competencia[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    fetchCompetencias();
  }, []);

  const fetchCompetencias = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/competencias`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Competencia[] = await response.json();
      setCompetencias(data);
      setError(null);
    } catch (err: any) {
      setError("Error al cargar las competencias.");
      console.error("Error fetching competencias:", err.message);
    }
  };

  const handleCrearCompetencia = async () => {
    if (!nombre || !descripcion) {
      Alert.alert("Error", "Nombre y descripción son obligatorios");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/competencias`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre, descripcion }),
      });

      if (response.ok) {
        Alert.alert("Éxito", "Competencia agregada correctamente");
        setNombre("");
        setDescripcion("");
        fetchCompetencias(); // Recargar la lista
      } else {
        const errorData = await response.text();
        Alert.alert("Error", errorData || "No se pudo agregar la competencia");
      }
    } catch (err: any) {
      Alert.alert("Error", "Error al conectar con el servidor");
      console.error("Error creating competencia:", err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCompetencia = async (id: number) => {
    Alert.alert(
      "Confirmar",
      `¿Seguro que deseas eliminar esta competencia?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/competencias/${id}`, {
                method: "DELETE",
              });
              if (response.ok) {
                Alert.alert("Éxito", "Competencia eliminada correctamente");
                fetchCompetencias(); // Recargar la lista
              } else {
                const errorData = await response.text();
                Alert.alert(
                  "Error",
                  errorData || "No se pudo eliminar la competencia"
                );
              }
            } catch (err: any) {
              Alert.alert("Error", "Error al conectar con el servidor");
              console.error("Error deleting competencia:", err.message);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <BackButton/>

        <Text className="mb-6 text-xl font-bold text-blue-900">
          Gestión de Competencias
        </Text>

        {/* Formulario para crear nueva competencia */}
        <Text className="mb-1 text-sm text-gray-700">Nombre de la Competencia</Text>
        <TextInput
          className="p-3 mb-4 border border-gray-300 rounded-md"
          placeholder="Ej. Comunicación efectiva"
          value={nombre}
          onChangeText={setNombre}
        />

        <Text className="mb-1 text-sm text-gray-700">Descripción</Text>
        <TextInput
          className="p-3 mb-6 border border-gray-300 rounded-md"
          placeholder="Descripción de la competencia"
          multiline
          value={descripcion}
          onChangeText={setDescripcion}
        />

        <TouchableOpacity
          className={`items-center py-3 bg-blue-800 rounded-md ${
            isCreating ? "opacity-50" : ""
          }`}
          onPress={handleCrearCompetencia}
          disabled={isCreating}
        >
          <Text className="text-base font-bold text-white">
            {isCreating ? "Creando..." : "Agregar Competencia"}
          </Text>
        </TouchableOpacity>

        {error && (
          <View className="mt-4 p-2 bg-red-200 rounded-md">
            <Text className="text-red-600">{error}</Text>
          </View>
        )}

        {/* Lista de competencias */}
        <View className="mt-8">
          <Text className="mb-4 text-lg font-semibold text-gray-800">
            Lista de Competencias
          </Text>
          {competencias.length === 0 ? (
            <Text className="text-gray-600">No hay competencias registradas.</Text>
          ) : (
            competencias.map((comp) => (
              <View
                key={comp.id}
                className="flex-row items-center justify-between py-2 border-b border-gray-200"
              >
                <View className="flex-1 mr-4">
                  <Text className="font-semibold">{comp.nombre}</Text>
                  <Text className="text-gray-600">{comp.descripcion}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteCompetencia(comp.id)}
                >
                  <Feather name="trash-2" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}