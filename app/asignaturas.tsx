import { useState } from "react";
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

const asignaturasIniciales = [
  { id: "MAT101", nombre: "Matemáticas Básicas", creditos: 4 },
  { id: "FIS102", nombre: "Física General", creditos: 5 },
  { id: "PRO103", nombre: "Programación I", creditos: 4 },
];

export default function AsignaturasScreen() {
  const [asignaturas, setAsignaturas] = useState(asignaturasIniciales);

  // Modal edición
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState("");
  const [editNombre, setEditNombre] = useState("");
  const [editCreditos, setEditCreditos] = useState("");

  // Modal nueva
  const [modalNuevaVisible, setModalNuevaVisible] = useState(false);
  const [nuevoId, setNuevoId] = useState("");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoCreditos, setNuevoCreditos] = useState("");

  const eliminarAsignatura = (id: string) => {
    setAsignaturas(asignaturas.filter((a) => a.id !== id));
  };

  const abrirEditor = (asignatura: any) => {
    setEditId(asignatura.id);
    setEditNombre(asignatura.nombre);
    setEditCreditos(asignatura.creditos.toString());
    setModalVisible(true);
  };

  const guardarCambios = () => {
    const nuevasAsignaturas = asignaturas.map((a) =>
      a.id === editId
        ? { ...a, nombre: editNombre, creditos: parseInt(editCreditos) }
        : a
    );
    setAsignaturas(nuevasAsignaturas);
    setModalVisible(false);
  };

  const agregarAsignatura = () => {
    if (!nuevoId || !nuevoNombre || !nuevoCreditos) {
      Alert.alert("Todos los campos son obligatorios");
      return;
    }

    const yaExiste = asignaturas.find((a) => a.id === nuevoId);
    if (yaExiste) {
      Alert.alert("El código ya existe");
      return;
    }

    setAsignaturas([
      ...asignaturas,
      {
        id: nuevoId,
        nombre: nuevoNombre,
        creditos: parseInt(nuevoCreditos),
      },
    ]);

    setModalNuevaVisible(false);
    setNuevoId("");
    setNuevoNombre("");
    setNuevoCreditos("");
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
