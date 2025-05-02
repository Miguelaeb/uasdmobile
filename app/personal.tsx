import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import { ProtectedRoute } from "./protectedRoute"; // Importa el componente ProtectedRoute

const API_URL = "http://localhost:8081"; // Cambia esto si tu backend está en otro lugar

const BackButton = () => {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.push("/home")} className="flex-row items-center p-2">
      <Feather name="arrow-left" size={24} color="#3b82f6" />
      <Text className="ml-2 text-blue-600 font-semibold">Volver</Text>
    </TouchableOpacity>
  );
};

export default function PersonalScreen() {
  const router = useRouter();

  interface Personal {
    id: string;
    nombre: string;
    apellido: string;
    correo: string;
    telefono: string;
    puesto: string;
  }

  const [personal, setPersonal] = useState<Personal[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal editar
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<Personal | null>(null);

  // Modal nuevo
  const [modalNuevoVisible, setModalNuevoVisible] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoApellido, setNuevoApellido] = useState("");
  const [nuevoCorreo, setNuevoCorreo] = useState("");
  const [nuevoTelefono, setNuevoTelefono] = useState("");
  const [nuevoPuesto, setNuevoPuesto] = useState("");

  // Obtener datos de la API
  const fetchPersonal = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/personal`);
      setPersonal(response.data as Personal[]);
    } catch (error) {
      Alert.alert("Error", "No se pudo cargar el personal.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonal();
  }, []);

  const eliminarPersonal = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/personal/${id}`);
      setPersonal((prev) => prev.filter((p) => p.id !== id));
      Alert.alert("Éxito", "Personal eliminado exitosamente.");
    } catch (error) {
      console.error("Error al eliminar el personal:", error);
      Alert.alert("Error", "No se pudo eliminar el personal.");
    }
  };

  const abrirEditor = (item: Personal) => {
    setEditItem(item);
    setModalVisible(true);
  };

  const guardarEdicion = async () => {
    if (!editItem) return;

    try {
      await axios.put(`${API_URL}/personal/${editItem.id}`, editItem);
      await fetchPersonal();
      setEditItem(null);
      setModalVisible(false);
      Alert.alert("Éxito", "Personal actualizado exitosamente.");
    } catch (error) {
      console.error("Error al guardar la edición:", error);
      Alert.alert("Error", "No se pudo guardar la edición.");
    }
  };

  const agregarPersonal = async () => {
    if (!nuevoNombre || !nuevoApellido || !nuevoCorreo || !nuevoTelefono || !nuevoPuesto) {
      Alert.alert("Error", "Todos los campos son obligatorios.");
      return;
    }

    const nuevo = {
      nombre: nuevoNombre.trim(),
      apellido: nuevoApellido.trim(),
      correo: nuevoCorreo.trim(),
      telefono: nuevoTelefono.trim(),
      puesto: nuevoPuesto.trim(),
    };

    try {
      const response = await axios.post<{ id: string }>(`${API_URL}/personal`, nuevo);
      setPersonal((prev) => [...prev, { ...nuevo, id: response.data.id }]);
      setNuevoNombre("");
      setNuevoApellido("");
      setNuevoCorreo("");
      setNuevoTelefono("");
      setNuevoPuesto("");
      setModalNuevoVisible(false);
      Alert.alert("Éxito", "Personal agregado exitosamente.");
    } catch (error) {
      console.error("Error al agregar el personal:", error);
      Alert.alert("Error", "No se pudo agregar el personal.");
    }
  };

  return (
    <ProtectedRoute>
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 px-4 pt-6 bg-white">
          <BackButton />
          <Text className="mb-4 text-xl font-bold text-blue-900">Personal</Text>

          {loading ? (
            <Text className="text-center text-gray-500">Cargando...</Text>
          ) : (
            <FlatList
              data={personal}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View className="p-4 mb-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <View className="flex-row items-start justify-between">
                    <View>
                      <Text className="text-base font-semibold text-gray-800">
                        {item.nombre} {item.apellido}
                      </Text>
                      <Text className="text-sm text-gray-600">Correo: {item.correo}</Text>
                      <Text className="text-sm text-gray-600">Teléfono: {item.telefono}</Text>
                      <Text className="text-sm text-gray-600">Puesto: {item.puesto}</Text>
                    </View>
                    <View className="flex-row space-x-3">
                      <TouchableOpacity onPress={() => abrirEditor(item)}>
                        <Feather name="edit" size={20} color="#3b82f6" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => eliminarPersonal(item.id)}>
                        <Feather name="trash-2" size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            />
          )}

          <TouchableOpacity
            className="items-center py-3 mt-6 bg-blue-800 rounded-md"
            onPress={() => setModalNuevoVisible(true)}
          >
            <Text className="text-base font-bold text-white">+ Nuevo Personal</Text>
          </TouchableOpacity>

          {/* Modal para editar */}
          <Modal visible={modalVisible} transparent animationType="slide">
            <View className="items-center justify-center flex-1 px-4 bg-black/30">
              <View className="w-full p-6 bg-white rounded-xl">
                <Text className="mb-4 text-lg font-bold text-blue-900">Editar Personal</Text>
                <TextInput
                  value={editItem?.nombre}
                  onChangeText={(text) => editItem && setEditItem({ ...editItem, nombre: text })}
                  placeholder="Nombre"
                  className="px-3 py-2 mb-4 border border-gray-300 rounded-md"
                />
                <TextInput
                  value={editItem?.apellido}
                  onChangeText={(text) => editItem && setEditItem({ ...editItem, apellido: text })}
                  placeholder="Apellido"
                  className="px-3 py-2 mb-4 border border-gray-300 rounded-md"
                />
                <TextInput
                  value={editItem?.correo}
                  onChangeText={(text) => editItem && setEditItem({ ...editItem, correo: text })}
                  placeholder="Correo"
                  className="px-3 py-2 mb-4 border border-gray-300 rounded-md"
                />
                <TextInput
                  value={editItem?.telefono}
                  onChangeText={(text) => editItem && setEditItem({ ...editItem, telefono: text })}
                  placeholder="Teléfono"
                  className="px-3 py-2 mb-4 border border-gray-300 rounded-md"
                />
                <TextInput
                  value={editItem?.puesto}
                  onChangeText={(text) => editItem && setEditItem({ ...editItem, puesto: text })}
                  placeholder="Puesto"
                  className="px-3 py-2 mb-6 border border-gray-300 rounded-md"
                />
                <View className="flex-row justify-end space-x-3">
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text className="font-semibold text-gray-600">Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={guardarEdicion}>
                    <Text className="font-bold text-blue-600">Guardar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Modal para agregar */}
          <Modal visible={modalNuevoVisible} transparent animationType="slide">
            <View className="items-center justify-center flex-1 px-4 bg-black/30">
              <View className="w-full p-6 bg-white rounded-xl">
                <Text className="mb-4 text-lg font-bold text-blue-900">Nuevo Personal</Text>
                <TextInput
                  value={nuevoNombre}
                  onChangeText={setNuevoNombre}
                  placeholder="Nombre"
                  className="px-3 py-2 mb-4 border border-gray-300 rounded-md"
                />
                <TextInput
                  value={nuevoApellido}
                  onChangeText={setNuevoApellido}
                  placeholder="Apellido"
                  className="px-3 py-2 mb-4 border border-gray-300 rounded-md"
                />
                <TextInput
                  value={nuevoCorreo}
                  onChangeText={setNuevoCorreo}
                  placeholder="Correo"
                  className="px-3 py-2 mb-4 border border-gray-300 rounded-md"
                />
                <TextInput
                  value={nuevoTelefono}
                  onChangeText={setNuevoTelefono}
                  placeholder="Teléfono"
                  className="px-3 py-2 mb-4 border border-gray-300 rounded-md"
                />
                <TextInput
                  value={nuevoPuesto}
                  onChangeText={setNuevoPuesto}
                  placeholder="Puesto"
                  className="px-3 py-2 mb-6 border border-gray-300 rounded-md"
                />
                <View className="flex-row justify-end space-x-3">
                  <TouchableOpacity onPress={() => setModalNuevoVisible(false)}>
                    <Text className="font-semibold text-gray-600">Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={agregarPersonal}>
                    <Text className="font-bold text-blue-600">Agregar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </SafeAreaView>
    </ProtectedRoute>
  );
}
