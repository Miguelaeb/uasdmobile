import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const planesEjemplo = [
  { id: "1", nombre: "Plan Ingeniería de Software", fecha: "2025-01-20" },
  { id: "2", nombre: "Plan Redes y Telecomunicaciones", fecha: "2025-02-15" },
];

export default function MisPlanesScreen() {
  const [planes, setPlanes] = useState(planesEjemplo);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-4 pt-6 bg-white">
        <Text className="mb-4 text-xl font-bold text-blue-900">
          Mis Planes de Estudio
        </Text>
        <Text className="mb-4 text-gray-600">
          Lista de planes de estudio registrados:
        </Text>

        {planes.length === 0 ? (
          <Text className="italic text-gray-500">
            No hay planes registrados.
          </Text>
        ) : (
          <FlatList
            data={planes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="p-4 mb-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                <Text className="text-base font-semibold text-gray-800">
                  {item.nombre}
                </Text>
                <Text className="text-sm text-gray-500">
                  Creado el {item.fecha}
                </Text>
              </View>
            )}
          />
        )}

        <View className="mt-6">
          <Link href="/nuevo_plan" asChild>
            <TouchableOpacity className="items-center py-3 bg-blue-800 rounded-md">
              <Text className="text-base font-bold text-white">
                + Nuevo Plan
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
