import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NuevoPlan() {
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [competencia, setCompetencia] = useState("");

  // Opciones de competencias
  const competencias = [
    { label: "Competencia Técnica", value: "CT" },
    { label: "Competencia Profesional", value: "CP" },
    { label: "Competencia Genérica", value: "CG" },
  ];

  const handleCrear = async () => {
    if (!nombre || !codigo || !competencia) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    const nuevoPlan = {
      nombre,
      codigo,
      competencia,
    };

    try {
      const response = await fetch("http://localhost:4000/planes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevoPlan),
      });

      if (response.ok) {
        Alert.alert("Éxito", "Plan creado exitosamente");
        setNombre("");
        setCodigo("");
        setCompetencia("");
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "No se pudo crear el plan");
      }
    } catch (error) {
      console.error("Error al crear el plan:", error);
      Alert.alert("Error", "No se pudo conectar con el servidor");
    }
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
        <Text className="mb-6 text-xl font-bold text-blue-900">
          Ingresar Plan de Estudio
        </Text>

        {/* Campo para el nombre del plan */}
        <Text className="mb-1 text-sm text-gray-700">Nombre del plan</Text>
        <TextInput
          className="p-3 mb-4 border border-gray-300 rounded-md"
          placeholder="Ej. Plan Informática"
          value={nombre}
          onChangeText={setNombre}
        />

        {/* Selector de competencia */}
        <Text className="mb-1 text-sm text-gray-700">
          Seleccione Competencia
        </Text>
        <View className="mb-4 border border-gray-300 rounded-md">
          <Picker
            selectedValue={competencia}
            onValueChange={(itemValue) => setCompetencia(itemValue)}
          >
            <Picker.Item label="Seleccionar..." value="" />
            {competencias.map((comp, index) => (
              <Picker.Item key={index} label={comp.label} value={comp.value} />
            ))}
          </Picker>
        </View>

        {/* Campo para el código del plan */}
        <Text className="mb-1 text-sm text-gray-700">Código</Text>
        <TextInput
          className="p-3 mb-6 border border-gray-300 rounded-md"
          placeholder="Ej. INF2025"
          value={codigo}
          onChangeText={setCodigo}
        />

        {/* Botón para crear el plan */}
        <TouchableOpacity
          className="items-center py-3 bg-blue-800 rounded-md"
          onPress={handleCrear}
        >
          <Text className="text-base font-bold text-white">Crear</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}