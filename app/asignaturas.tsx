import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { Feather } from "@expo/vector-icons";
import { router, useRouter } from "expo-router";

const BackButton = () => {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.push("/")} className="flex-row items-center p-2">
      <Feather name="arrow-left" size={24} color="#3b82f6" />
      <Text className="ml-2 text-blue-600 font-semibold">Volver</Text>
    </TouchableOpacity>
  );
};

export default function AsignaturasScreen() {
  interface Asignatura {
    id: string;
    nombre: string;
    creditos: number;
    horasPracticas: number;
    horasTeoricas: number;
    prerequisitos: string;
    semestre: number;
    equivalente: string;
    planId: string;
  }

  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [planes, setPlanes] = useState([]); // Lista de planes de estudio
  const [selectedPlan, setSelectedPlan] = useState(""); // Plan seleccionado

  // Modal nueva asignatura
  const [modalNuevaVisible, setModalNuevaVisible] = useState(false);
  const [nuevoId, setNuevoId] = useState("");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoCreditos, setNuevoCreditos] = useState("");
  const [nuevasHorasPracticas, setNuevasHorasPracticas] = useState("");
  const [nuevasHorasTeoricas, setNuevasHorasTeoricas] = useState("");
  const [nuevosPrerequisitos, setNuevosPrerequisitos] = useState("");
  const [nuevoSemestre, setNuevoSemestre] = useState("");
  const [nuevoEquivalente, setNuevoEquivalente] = useState("");

  const API_URL = "http://localhost:4000"; // Cambia esto si tu backend está en otro lugar

  // Obtener asignaturas y planes desde la base de datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const planesResponse = await fetch(`${API_URL}/planes`);
        const planesData = await planesResponse.json();
        setPlanes(planesData);
      } catch (error) {
        console.error("Error al obtener datos:", error);
        Alert.alert("Error", "No se pudieron cargar los datos");
      }
    };

    fetchData();
  }, []);

  // Obtener asignaturas por plan seleccionado
  useEffect(() => {
    if (selectedPlan) {
      const fetchAsignaturas = async () => {
        try {
          const response = await fetch(`${API_URL}/asignaturas/${selectedPlan}`);
          const data = await response.json();
          setAsignaturas(data);
        } catch (error) {
          console.error("Error al obtener asignaturas:", error);
          Alert.alert("Error", "No se pudieron cargar las asignaturas");
        }
      };

      fetchAsignaturas();
    } else {
      setAsignaturas([]);
    }
  }, [selectedPlan]);

  // Agregar nueva asignatura
  const agregarAsignatura = async () => {
    if (
      !nuevoId ||
      !nuevoNombre ||
      !nuevoCreditos ||
      !nuevasHorasPracticas ||
      !nuevasHorasTeoricas ||
      !nuevosPrerequisitos ||
      !nuevoSemestre ||
      !nuevoEquivalente ||
      !selectedPlan
    ) {
      Alert.alert("Todos los campos son obligatorios");
      return;
    }

    const nuevaAsignatura = {
      id: nuevoId,
      nombre: nuevoNombre,
      creditos: parseInt(nuevoCreditos),
      horasPracticas: parseInt(nuevasHorasPracticas),
      horasTeoricas: parseInt(nuevasHorasTeoricas),
      prerequisitos: nuevosPrerequisitos,
      semestre: parseInt(nuevoSemestre),
      equivalente: nuevoEquivalente,
      planId: selectedPlan,
    };

    try {
      const response = await fetch(`${API_URL}/asignaturas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevaAsignatura),
      });

      if (response.ok) {
        setAsignaturas([...asignaturas, nuevaAsignatura]);
        setModalNuevaVisible(false);
        setNuevoId("");
        setNuevoNombre("");
        setNuevoCreditos("");
        setNuevasHorasPracticas("");
        setNuevasHorasTeoricas("");
        setNuevosPrerequisitos("");
        setNuevoSemestre("");
        setNuevoEquivalente("");
        Alert.alert("Éxito", "Asignatura creada exitosamente");
      } else {
        const data = await response.json();
        Alert.alert("Error", data.error || "No se pudo agregar la asignatura");
      }
    } catch (error) {
      console.error("Error al agregar asignatura:", error);
      Alert.alert("Error", "No se pudo conectar con el servidor");
    }
  };

  // Eliminar asignatura
  const eliminarAsignatura = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/asignaturas/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAsignaturas(asignaturas.filter((a) => a.id !== id));
        Alert.alert("Éxito", "Asignatura eliminada exitosamente");
      } else {
        Alert.alert("Error", "No se pudo eliminar la asignatura");
      }
    } catch (error) {
      console.error("Error al eliminar asignatura:", error);
      Alert.alert("Error", "No se pudo eliminar la asignatura");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-4 pt-6 bg-white">
        <Text className="mb-4 text-xl font-bold text-blue-900">
          Asignaturas
        </Text>
        <BackButton />

        {/* Selector de plan */}
        <Text className="mb-1 text-sm text-gray-700">Seleccionar Plan</Text>
        <Picker
          selectedValue={selectedPlan}
          onValueChange={(itemValue) => setSelectedPlan(itemValue)}
          className="mb-4 border border-gray-300 rounded-md"
        >
          <Picker.Item label="Seleccionar..." value="" />
          {planes.map((plan: any) => (
            <Picker.Item key={plan.id} label={plan.nombre} value={plan.id} />
          ))}
        </Picker>

        {selectedPlan ? (
          <>
            <FlatList
              data={asignaturas}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View className="px-4 py-3 mb-4 border border-gray-300 rounded-md">
                  <Text className="text-sm font-bold text-gray-700">
                    Código: <Text className="font-normal">{item.id}</Text>
                  </Text>
                  <Text className="text-sm font-bold text-gray-700">
                    Nombre: <Text className="font-normal">{item.nombre}</Text>
                  </Text>
                  <Text className="text-sm font-bold text-gray-700">
                    Créditos: <Text className="font-normal">{item.creditos}</Text>
                  </Text>
                  <Text className="text-sm font-bold text-gray-700">
                    Horas Prácticas:{" "}
                    <Text className="font-normal">{item.horasPracticas}</Text>
                  </Text>
                  <Text className="text-sm font-bold text-gray-700">
                    Horas Teóricas:{" "}
                    <Text className="font-normal">{item.horasTeoricas}</Text>
                  </Text>
                  <Text className="text-sm font-bold text-gray-700">
                    Prerrequisitos:{" "}
                    <Text className="font-normal">{item.prerequisitos}</Text>
                  </Text>
                  <Text className="text-sm font-bold text-gray-700">
                    Semestre: <Text className="font-normal">{item.semestre}</Text>
                  </Text>
                  <Text className="text-sm font-bold text-gray-700">
                    Equivalente:{" "}
                    <Text className="font-normal">{item.equivalente}</Text>
                  </Text>

                  {/* Botones de eliminar */}
                  <View className="flex-row justify-end mt-2 space-x-3">
                    <TouchableOpacity
                      onPress={() => eliminarAsignatura(item.id)}
                    >
                      <Feather name="trash-2" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />

            <TouchableOpacity
              className="items-center py-3 mt-6 bg-blue-800 rounded-md"
              onPress={() => setModalNuevaVisible(true)}
            >
              <Text className="text-base font-bold text-white">
                + Nueva Asignatura
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text className="text-center text-gray-500">
            Selecciona un plan para ver o agregar asignaturas.
          </Text>
        )}

        <View className="mt-6">
          <TouchableOpacity
            className="items-center py-3 bg-gray-800 rounded-md"
            onPress={() => router.push("/")}
          >
            <Text className="text-base font-bold text-white">Volver a la Página Principal</Text>
          </TouchableOpacity>
        </View>

        {/* Modal nueva asignatura */}
        <Modal visible={modalNuevaVisible} transparent animationType="slide">
          <View className="items-center justify-center flex-1 px-4 bg-black/30">
            <View className="w-full p-6 bg-white rounded-xl">
              <Text className="mb-4 text-lg font-bold text-blue-900">
                Nueva Asignatura
              </Text>

              {/* Campos para nueva asignatura */}
              <Text className="mb-1 text-sm text-gray-700">Código</Text>
              <TextInput
                value={nuevoId}
                onChangeText={setNuevoId}
                placeholder="Ej. INF203"
                className="px-3 py-2 mb-4 border border-gray-300 rounded-md"
              />

              <Text className="mb-1 text-sm text-gray-700">Nombre</Text>
              <TextInput
                value={nuevoNombre}
                onChangeText={setNuevoNombre}
                placeholder="Ej. Estructura de Datos"
                className="px-3 py-2 mb-4 border border-gray-300 rounded-md"
              />

              <Text className="mb-1 text-sm text-gray-700">Créditos</Text>
              <TextInput
                value={nuevoCreditos}
                onChangeText={setNuevoCreditos}
                placeholder="Ej. 4"
                keyboardType="numeric"
                className="px-3 py-2 mb-4 border border-gray-300 rounded-md"
              />

              <Text className="mb-1 text-sm text-gray-700">Horas Prácticas</Text>
              <TextInput
                value={nuevasHorasPracticas}
                onChangeText={setNuevasHorasPracticas}
                placeholder="Ej. 2"
                keyboardType="numeric"
                className="px-3 py-2 mb-4 border border-gray-300 rounded-md"
              />

              <Text className="mb-1 text-sm text-gray-700">Horas Teóricas</Text>
              <TextInput
                value={nuevasHorasTeoricas}
                onChangeText={setNuevasHorasTeoricas}
                placeholder="Ej. 3"
                keyboardType="numeric"
                className="px-3 py-2 mb-4 border border-gray-300 rounded-md"
              />

              <Text className="mb-1 text-sm text-gray-700">Semestre</Text>
              <TextInput
                value={nuevoSemestre}
                onChangeText={setNuevoSemestre}
                placeholder="Ej. 1"
                keyboardType="numeric"
                className="px-3 py-2 mb-4 border border-gray-300 rounded-md"
              />

              <Text className="mb-1 text-sm text-gray-700">Prerrequisitos</Text>
              <TextInput
                value={nuevosPrerequisitos}
                onChangeText={setNuevosPrerequisitos}
                placeholder="Ej. INF101, MAT102"
                className="px-3 py-2 mb-4 border border-gray-300 rounded-md"
              />

              <Text className="mb-1 text-sm text-gray-700">Equivalente</Text>
              <TextInput
                value={nuevoEquivalente}
                onChangeText={setNuevoEquivalente}
                placeholder="Ej. INF202"
                className="px-3 py-2 mb-6 border border-gray-300 rounded-md"
              />

              <View className="flex-row justify-end space-x-3">
                <TouchableOpacity onPress={() => setModalNuevaVisible(false)}>
                  <Text className="font-semibold text-gray-600">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={agregarAsignatura}>
                  <Text className="font-bold text-blue-600">Agregar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}