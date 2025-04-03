import React, { useState } from "react";
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

const competenciasEjemplo = [
  {
    id: "CT1",
    nombre: "Competencia Técnica",
    descripcion: "Descripción técnica",
  },
];

export default function CompetenciasScreen() {
  const [competencias, setCompetencias] = useState(competenciasEjemplo);

  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const [modalNuevoVisible, setModalNuevoVisible] = useState(false);
  const [nuevoId, setNuevoId] = useState("");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoDescripcion, setNuevoDescripcion] = useState("");

  const eliminarCompetencia = (id: string) => {
    setCompetencias(competencias.filter((c) => c.id !== id));
  };

  const abrirEditor = (item: any) => {
    setEditItem(item);
    setModalVisible(true);
  };

  const guardarEdicion = () => {
    setCompetencias((prev) =>
      prev.map((c) => (c.id === editItem.id ? editItem : c))
    );
    setModalVisible(false);
  };

  const agregarCompetencia = () => {
    if (!nuevoId || !nuevoNombre || !nuevoDescripcion) {
      Alert.alert("Todos los campos son obligatorios");
      return;
    }

    const yaExiste = competencias.find((c) => c.id === nuevoId);
    if (yaExiste) {
      Alert.alert("Ya existe una competencia con ese ID");
      return;
    }

    const nueva = {
      id: nuevoId,
      nombre: nuevoNombre,
      descripcion: nuevoDescripcion,
    };

    setCompetencias([...competencias, nueva]);
    setModalNuevoVisible(false);
    setNuevoId("");
    setNuevoNombre("");
    setNuevoDescripcion("");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-4 pt-6 bg-white">
        <Text className="mb-4 text-xl font-bold text-blue-900">
          Competencias
        </Text>

        <FlatList
          data={competencias}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="p-4 mb-3 bg-white border border-gray-200 rounded-lg shadow-sm">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-2">
                  <Text className="text-base font-semibold text-gray-800">
                    {item.nombre}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {item.descripcion}
                  </Text>
                </View>
                <View className="flex-row space-x-3">
                  <TouchableOpacity onPress={() => abrirEditor(item)}>
                    <Feather name="edit" size={20} color="#3b82f6" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => eliminarCompetencia(item.id)}
                  >
                    <Feather name="trash-2" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />

        <View className="mt-6">
          <TouchableOpacity
            className="items-center py-3 bg-blue-800 rounded-md"
            onPress={() => setModalNuevoVisible(true)}
          >
            <Text className="text-base font-bold text-white">
              + Nueva Competencia
            </Text>
          </TouchableOpacity>
        </View>

        {/* Modal Editar Competencia */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View className="items-center justify-center flex-1 px-4 bg-black/30">
            <View className="w-full p-6 bg-white rounded-xl">
              <Text className="mb-4 text-lg font-bold text-blue-900">
                Editar Competencia
              </Text>

              <TextInput
                value={editItem?.nombre}
                onChangeText={(text) =>
                  setEditItem({ ...editItem, nombre: text })
                }
                placeholder="Nombre"
                className="px-3 py-2 mb-4 border border-gray-300 rounded-md"
              />

              <TextInput
                value={editItem?.descripcion}
                onChangeText={(text) =>
                  setEditItem({ ...editItem, descripcion: text })
                }
                placeholder="Descripción"
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

        {/* Modal Nueva Competencia */}
        <Modal visible={modalNuevoVisible} transparent animationType="slide">
          <View className="items-center justify-center flex-1 px-4 bg-black/30">
            <View className="w-full p-6 bg-white rounded-xl">
              <Text className="mb-4 text-lg font-bold text-blue-900">
                Nueva Competencia
              </Text>

              <TextInput
                value={nuevoId}
                onChangeText={setNuevoId}
                placeholder="ID (ej. CT2)"
                className="px-3 py-2 mb-4 border border-gray-300 rounded-md"
              />

              <TextInput
                value={nuevoNombre}
                onChangeText={setNuevoNombre}
                placeholder="Nombre"
                className="px-3 py-2 mb-4 border border-gray-300 rounded-md"
              />

              <TextInput
                value={nuevoDescripcion}
                onChangeText={setNuevoDescripcion}
                placeholder="Descripción"
                className="px-3 py-2 mb-6 border border-gray-300 rounded-md"
              />

              <View className="flex-row justify-end space-x-3">
                <TouchableOpacity onPress={() => setModalNuevoVisible(false)}>
                  <Text className="font-semibold text-gray-600">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={agregarCompetencia}>
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
