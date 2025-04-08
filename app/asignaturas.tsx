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
import { Feather } from "@expo/vector-icons";

export default function AsignaturasScreen() {
  interface Asignatura {
    id: string;
    nombre: string;
    creditos: number;
    horasPracticas: number;
    horasTeoricas: number;
    prerequisitos: string;
  }

  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);

  // Modal edición
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState("");
  const [editNombre, setEditNombre] = useState("");
  const [editCreditos, setEditCreditos] = useState("");
  const [editHorasPracticas, setEditHorasPracticas] = useState("");
  const [editHorasTeoricas, setEditHorasTeoricas] = useState("");
  const [editPrerequisitos, setEditPrerequisitos] = useState("");

  // Modal nueva
  const [modalNuevaVisible, setModalNuevaVisible] = useState(false);
  const [nuevoId, setNuevoId] = useState("");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoCreditos, setNuevoCreditos] = useState("");
  const [nuevasHorasPracticas, setNuevasHorasPracticas] = useState("");
  const [nuevasHorasTeoricas, setNuevasHorasTeoricas] = useState("");
  const [nuevosPrerequisitos, setNuevosPrerequisitos] = useState("");

  const API_URL = "http://localhost:4000"; // Cambia esto si tu backend está en otro lugar

  // Obtener asignaturas desde la base de datos
  useEffect(() => {
    const fetchAsignaturas = async () => {
      try {
        const response = await fetch(`${API_URL}/asignaturas`);
        const data = await response.json();
        setAsignaturas(data);
      } catch (error) {
        console.error("Error al obtener asignaturas:", error);
        Alert.alert("Error", "No se pudieron cargar las asignaturas");
      }
    };

    fetchAsignaturas();
  }, []);

  // Eliminar asignatura
  const eliminarAsignatura = async (id: any) => {
    try {
      await fetch(`${API_URL}/asignaturas/${id}`, {
        method: "DELETE",
      });
      setAsignaturas(asignaturas.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Error al eliminar asignatura:", error);
      Alert.alert("Error", "No se pudo eliminar la asignatura");
    }
  };

  // Abrir editor
  const abrirEditor = (asignatura: Asignatura) => {
    setEditId(asignatura.id);
    setEditNombre(asignatura.nombre);
    setEditCreditos(asignatura.creditos.toString());
    setEditHorasPracticas(asignatura.horasPracticas.toString());
    setEditHorasTeoricas(asignatura.horasTeoricas.toString());
    setEditPrerequisitos(asignatura.prerequisitos);
    setModalVisible(true);
  };

  // Guardar cambios en la asignatura
  const guardarCambios = async () => {
    try {
      await fetch(`${API_URL}/asignaturas/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editId,
          nombre: editNombre,
          creditos: parseInt(editCreditos),
          horasPracticas: parseInt(editHorasPracticas),
          horasTeoricas: parseInt(editHorasTeoricas),
          prerequisitos: editPrerequisitos,
        }),
      });

      const nuevasAsignaturas = asignaturas.map((a) =>
        a.id === editId
          ? {
              ...a,
              nombre: editNombre,
              creditos: parseInt(editCreditos),
              horasPracticas: parseInt(editHorasPracticas),
              horasTeoricas: parseInt(editHorasTeoricas),
              prerequisitos: editPrerequisitos,
            }
          : a
      );
      setAsignaturas(nuevasAsignaturas);
      setModalVisible(false);
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      Alert.alert("Error", "No se pudieron guardar los cambios");
    }
  };

  // Agregar nueva asignatura
  const agregarAsignatura = async () => {
    if (
      !nuevoId ||
      !nuevoNombre ||
      !nuevoCreditos ||
      !nuevasHorasPracticas ||
      !nuevasHorasTeoricas ||
      !nuevosPrerequisitos
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
      } else {
        Alert.alert("Error", "No se pudo agregar la asignatura");
      }
    } catch (error) {
      console.error("Error al agregar asignatura:", error);
      Alert.alert("Error", "No se pudo agregar la asignatura");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-4 pt-6 bg-white">
        <Text className="mb-4 text-xl font-bold text-blue-900">
          Asignaturas
        </Text>

        <View className="flex-row justify-between px-2 py-2 border-b border-gray-300">
          <Text className="w-[80px] font-bold text-gray-600">Código</Text>
          <Text className="flex-1 font-bold text-gray-600">Nombre</Text>
          <Text className="w-[60px] font-bold text-gray-600">Créditos</Text>
          <Text className="w-[60px] font-bold text-gray-600">Prácticas</Text>
          <Text className="w-[60px] font-bold text-gray-600">Teóricas</Text>
          <Text className="flex-1 font-bold text-gray-600">Prerrequisitos</Text>
          <Text className="w-[80px] font-bold text-gray-600 text-right">
            Acciones
          </Text>
        </View>

        <FlatList
          data={asignaturas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="flex-row items-center justify-between px-2 py-3 border-b border-gray-100">
              <Text className="w-[80px] text-gray-800">{item.id}</Text>
              <Text className="flex-1 text-gray-800">{item.nombre}</Text>
              <Text className="w-[60px] text-center text-gray-800">
                {item.creditos}
              </Text>
              <Text className="w-[60px] text-center text-gray-800">
                {item.horasPracticas}
              </Text>
              <Text className="w-[60px] text-center text-gray-800">
                {item.horasTeoricas}
              </Text>
              <Text className="flex-1 text-gray-800">{item.prerequisitos}</Text>
              <View className="w-[80px] flex-row justify-end space-x-3">
                <TouchableOpacity onPress={() => abrirEditor(item)}>
                  <Feather name="edit" size={20} color="#3b82f6" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => eliminarAsignatura(item.id)}>
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

        {/* Modal editar */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View className="items-center justify-center flex-1 px-4 bg-black/30">
            <View className="w-full p-6 bg-white rounded-xl">
              <Text className="mb-4 text-lg font-bold text-blue-900">
                Editar Asignatura
              </Text>

              <Text className="mb-1 text-sm text-gray-700">Nombre</Text>
              <TextInput
                value={editNombre}
                onChangeText={setEditNombre}
                className="px-3 py-2 mb-4 border border-gray-300 rounded-md"
              />

              <Text className="mb-1 text-sm text-gray-700">Créditos</Text>
              <TextInput
                value={editCreditos}
                onChangeText={setEditCreditos}
                keyboardType="numeric"
                className="px-3 py-2 mb-4 border border-gray-300 rounded-md"
              />

              <Text className="mb-1 text-sm text-gray-700">Horas Prácticas</Text>
              <TextInput
                value={editHorasPracticas}
                onChangeText={setEditHorasPracticas}
                keyboardType="numeric"
                className="px-3 py-2 mb-4 border border-gray-300 rounded-md"
              />

              <Text className="mb-1 text-sm text-gray-700">Horas Teóricas</Text>
              <TextInput
                value={editHorasTeoricas}
                onChangeText={setEditHorasTeoricas}
                keyboardType="numeric"
                className="px-3 py-2 mb-4 border border-gray-300 rounded-md"
              />

              <Text className="mb-1 text-sm text-gray-700">Prerrequisitos</Text>
              <TextInput
                value={editPrerequisitos}
                onChangeText={setEditPrerequisitos}
                placeholder="Ej. INF101, MAT102"
                className="px-3 py-2 mb-6 border border-gray-300 rounded-md"
              />

              <View className="flex-row justify-end space-x-3">
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text className="font-semibold text-gray-600">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={guardarCambios}>
                  <Text className="font-bold text-blue-600">Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal nueva asignatura */}
        <Modal visible={modalNuevaVisible} transparent animationType="slide">
          <View className="items-center justify-center flex-1 px-4 bg-black/30">
            <View className="w-full p-6 bg-white rounded-xl">
              <Text className="mb-4 text-lg font-bold text-blue-900">
                Nueva Asignatura
              </Text>

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

              <Text className="mb-1 text-sm text-gray-700">Prerrequisitos</Text>
              <TextInput
                value={nuevosPrerequisitos}
                onChangeText={setNuevosPrerequisitos}
                placeholder="Ej. INF101, MAT102"
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