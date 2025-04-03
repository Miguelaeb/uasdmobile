// app/educacion_virtual.tsx
import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const plataformaVirtual = [
  { descripcion: "Plataforma Virtual", area: "General", posee: false },
  { descripcion: "Herramientas", area: "Tecnología", posee: false },
];

const recursosAudiovisuales = [
  { descripcion: "Proyectores", area: "Audiovisual", posee: false },
  { descripcion: "Audífonos", area: "Audiovisual", posee: false },
];

export default function EducacionVirtualScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 pt-6 bg-white">
        <Text className="mb-4 text-xl font-bold text-blue-900">
          Educación Virtual
        </Text>

        <Text className="mb-2 text-lg font-semibold text-gray-700">
          Plataforma Educativa Virtual
        </Text>

        <View className="mb-4">
          {plataformaVirtual.map((item, idx) => (
            <View
              key={idx}
              className="flex-row items-center justify-between p-3 mb-2 border border-gray-200 rounded-md"
            >
              <Text className="text-gray-800">{item.descripcion}</Text>
              <Text className="text-gray-500">{item.area}</Text>
            </View>
          ))}
        </View>

        <Text className="mb-2 text-lg font-semibold text-gray-700">
          Recursos Audiovisuales
        </Text>

        <View className="mb-6">
          {recursosAudiovisuales.map((item, idx) => (
            <View
              key={idx}
              className="flex-row items-center justify-between p-3 mb-2 border border-gray-200 rounded-md"
            >
              <Text className="text-gray-800">{item.descripcion}</Text>
              <Text className="text-gray-500">{item.area}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity className="items-center py-3 bg-blue-800 rounded-md">
          <Text className="text-base font-bold text-white">Guardar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
