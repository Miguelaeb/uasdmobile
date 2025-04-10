import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert, ScrollView } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

const API_URL = "http://localhost:4000";

export default function MisPlanesScreen() {
  interface Plan {
    id: number;
    nombre: string;
    fechaCreacion: string;
  }

  interface Asignatura {
    id: string;
    nombre: string;
    creditos: number;
    horasPracticas: number;
    horasTeoricas: number;
    prerequisitos: string;
    semestre: number;
    equivalente: string;
  }

  const [planes, setPlanes] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [pensum, setPensum] = useState<Asignatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPensum, setLoadingPensum] = useState(false);

  useEffect(() => {
    const fetchPlanes = async () => {
      try {
        const response = await fetch(`${API_URL}/planes`);
        if (!response.ok) {
          throw new Error("Error al obtener los planes");
        }
        const data = await response.json();
        setPlanes(data);
      } catch (error) {
        console.error("Error al obtener los planes:", error);
        Alert.alert("Error", "No se pudieron cargar los planes de estudio");
      } finally {
        setLoading(false);
      }
    };

    fetchPlanes();
  }, []);

  const fetchPensum = async (planId: number) => {
    setLoadingPensum(true);
    try {
      const response = await fetch(`${API_URL}/asignaturas/${planId}`);
      if (!response.ok) {
        throw new Error("Error al obtener el pensum");
      }
      const data = await response.json();
      setPensum(data);
    } catch (error) {
      console.error("Error al obtener el pensum:", error);
      Alert.alert("Error", "No se pudo cargar el pensum del plan seleccionado");
    } finally {
      setLoadingPensum(false);
    }
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    fetchPensum(plan.id);
  };

  const handleBackToPlans = () => {
    setSelectedPlan(null);
    setPensum([]);
  };

  const eliminarPlan = async (planId: number) => {
    try {
      const response = await fetch(`${API_URL}/planes/${planId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPlanes(planes.filter((plan) => plan.id !== planId)); // Actualiza la lista de planes
        Alert.alert("Éxito", "Plan eliminado correctamente");
      } else {
        Alert.alert("Error", "No se pudo eliminar el plan");
      }
    } catch (error) {
      console.error("Error al eliminar plan:", error);
      Alert.alert("Error", "No se pudo conectar con el servidor");
    }
  };

  const groupBySemester = (asignaturas: Asignatura[]) => {
    return asignaturas.reduce((acc: { [key: number]: Asignatura[] }, asignatura) => {
      if (!acc[asignatura.semestre]) {
        acc[asignatura.semestre] = [];
      }
      acc[asignatura.semestre].push(asignatura);
      return acc;
    }, {});
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-4 pt-6 bg-white">
        {!selectedPlan ? (
          <>
            <Text className="mb-4 text-xl font-bold text-blue-900">
              Mis Planes de Estudio
            </Text>
            <Text className="mb-4 text-gray-600">
              Selecciona un plan para ver su pensum:
            </Text>

            {loading ? (
              <Text className="italic text-gray-500">Cargando planes...</Text>
            ) : planes.length === 0 ? (
              <Text className="italic text-gray-500">No hay planes registrados.</Text>
            ) : (
              <FlatList
                data={planes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View className="relative p-4 mb-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <TouchableOpacity onPress={() => handlePlanSelect(item)}>
                      <Text className="text-base font-semibold text-gray-800">
                        {item.nombre}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        Creado el {new Date(item.fechaCreacion).toLocaleDateString()}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="absolute bottom-2 right-2 p-2"
                      onPress={() =>
                        Alert.alert(
                          "Eliminar Plan",
                          "¿Estás seguro de que deseas eliminar este plan?",
                          [
                            { text: "Cancelar", style: "cancel" },
                            { text: "Eliminar", style: "destructive", onPress: () => eliminarPlan(item.id) },
                          ]
                        )
                      }
                    >
                      <Feather name="trash-2" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </>
        ) : (
          <>
            <TouchableOpacity
              onPress={handleBackToPlans}
              className="mb-4 flex-row items-center"
            >
              <Feather name="arrow-left" size={20} color="#1d4ed8" />
              <Text className="ml-2 text-blue-800 font-bold">Volver a los planes</Text>
            </TouchableOpacity>

            <Text className="mb-4 text-lg font-bold text-blue-900">
              Pensum de {selectedPlan.nombre}
            </Text>
            {loadingPensum ? (
              <Text className="italic text-gray-500">Cargando pensum...</Text>
            ) : pensum.length === 0 ? (
              <Text className="italic text-gray-500">
                No hay asignaturas registradas para este plan.
              </Text>
            ) : (
              <ScrollView>
                {Object.entries(groupBySemester(pensum)).map(
                  ([semestre, asignaturas]) => (
                    <View key={semestre} className="mb-6">
                      <Text className="mb-2 text-lg font-bold text-blue-900">
                        Semestre {semestre}
                      </Text>
                      <View className="bg-gray-100 rounded-lg p-4">
                        <View className="flex-row border-b border-gray-300 pb-2 mb-2">
                          <Text style={{ flex: 1, fontWeight: "bold", textAlign: "center" }}>
                            Código
                          </Text>
                          <Text style={{ flex: 2, fontWeight: "bold", textAlign: "center" }}>
                            Asignatura
                          </Text>
                          <Text style={{ flex: 1, fontWeight: "bold", textAlign: "center" }}>
                            HT
                          </Text>
                          <Text style={{ flex: 1, fontWeight: "bold", textAlign: "center" }}>
                            HP
                          </Text>
                          <Text style={{ flex: 1, fontWeight: "bold", textAlign: "center" }}>
                            CR
                          </Text>
                          <Text style={{ flex: 2, fontWeight: "bold", textAlign: "center" }}>
                            Prerrequisitos
                          </Text>
                        </View>
                        {asignaturas.map((asignatura, index) => (
                          <View
                            key={index}
                            className="flex-row py-2 border-b border-gray-200 last:border-b-0"
                          >
                            <Text style={{ flex: 1, textAlign: "center" }}>{asignatura.id}</Text>
                            <Text style={{ flex: 2, textAlign: "center" }}>
                              {asignatura.nombre}
                            </Text>
                            <Text style={{ flex: 1, textAlign: "center" }}>
                              {asignatura.horasTeoricas}
                            </Text>
                            <Text style={{ flex: 1, textAlign: "center" }}>
                              {asignatura.horasPracticas}
                            </Text>
                            <Text style={{ flex: 1, textAlign: "center" }}>
                              {asignatura.creditos}
                            </Text>
                            <Text style={{ flex: 2, textAlign: "center" }}>
                              {asignatura.prerequisitos || "Ninguno"}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )
                )}
              </ScrollView>
            )}
          </>
        )}

        <View className="mt-6">
          <Link href="/nuevo_plan" asChild>
            <TouchableOpacity className="items-center py-3 bg-blue-800 rounded-md">
              <Text className="text-base font-bold text-white">+ Nuevo Plan</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}