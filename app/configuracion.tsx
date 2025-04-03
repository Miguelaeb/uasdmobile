// app/configuracion.tsx
import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ConfiguracionScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 pt-6 bg-white">
        <Text className="mb-4 text-xl font-bold text-blue-900">
          Configuración
        </Text>

        <View className="mb-6 border border-gray-300 rounded-md">
          <Text className="px-4 py-2 font-semibold text-white bg-blue-900">
            Subir Archivo
          </Text>
          <View className="px-4 py-3">
            <Text className="text-gray-500">No file chosen</Text>
          </View>
        </View>

        <View className="mb-6 border border-gray-300 rounded-md">
          <Text className="px-4 py-2 font-semibold text-white bg-blue-900">
            API
          </Text>
          <TouchableOpacity className="px-4 py-3 border-t border-gray-300">
            <Text className="font-semibold text-blue-600">Configurar API</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
