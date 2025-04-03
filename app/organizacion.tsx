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

const organizacionEjemplo = [
  {
    id: "1",
    nombre: "Facultad de Ingeniería",
    telefono: "+1 234 567 8910",
    correo: "ingenieria@universidad.edu",
  },
  {
    id: "2",
    nombre: "Facultad de Ciencias",
    telefono: "+1 234 567 8911",
    correo: "ciencias@universidad.edu",
  },
  {
    id: "3",
    nombre: "Facultad de Humanidades",
    telefono: "+1 234 567 8912",
    correo: "humanidades@universidad.edu",
  },
];

export default function OrganizacionScreen() {
  const [organizacion, setOrganizacion] = useState(organizacionEjemplo);

  // Editar
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  // Nuevo
  const [modalNuevoVisible, setModalNuevoVisible] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoCorreo, setNuevoCorreo] = useState("");
  const [nuevoTelefono, setNuevoTelefono] = useState("");

  const eliminar = (id: string) => {
    setOrganizacion(organizacion.filter((o) => o.id !== id));
  };

  const abrirEditor = (item: any) => {
    setEditItem(item);
    setModalVisible(true);
  };

  const guardarEdicion = () => {
    setOrganizacion((prev) =>
      prev.map((o) => (o.id === editItem.id ? editItem : o))
    );
    setModalVisible(false);
  };

  const agregarNuevo = () => {
    if (!nuevoNombre || !nuevoCorreo || !nuevoTelefono) {
      Alert.alert("Todos los campos son obligatorios");
      return;
    }

    const nuevo = {
      id: Date.now().toString(),
      nombre: nuevoNombre,
      correo: nuevoCorreo,
      telefono: nuevoTelefono,
    };

    setOrganizacion([...organizacion, nuevo]);
    setModalNuevoVisible(false);
    setNuevoNombre("");
    setNuevoCorreo("");
    setNuevoTelefono("");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-4 pt-6 bg-white">
        <Text className="mb-4 text-xl font-bold text-blue-900">
          Organización
        </Text>

        <FlatList
          data={organizacion}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="p-4 mb-3 bg-white border border-gray-200 rounded-lg shadow-sm">
              <View className="flex-row items-start justify-between">
                <View>
                  <Text className="text-base font-semibold text-gray-800">
                    {item.nombre}
                  </Text>
                  <Text className="text-sm text-gray-600">{item.telefono}</Text>
                  <Text className="text-sm text-gray-600">{item.correo}</Text>
                </View>
                <View className="flex-row space-x-3">
                  <TouchableOpacity onPress={() => abrirEditor(item)}>
                    <Feather name="edit" size={20} color="#3b82f6" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => eliminar(item.id)}>
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
              + Nuevo Registro
            </Text>
          </TouchableOpacity>
        </View>

        {/* Modal Editar */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View className="items-center justify-center flex-1 px-4 bg-black/30">
            <View className="w-full p-6 bg-white rounded-xl">
              <Text className="mb-4 text-lg font-bold text-blue-900">
                Editar Organización
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
                value={editItem?.correo}
                onChangeText={(text) =>
                  setEditItem({ ...editItem, correo: text })
                }
                placeholder="Correo"
                keyboardType="email-address"
                className="px-3 py-2 mb-4 border border-gray-300 rounded-md"
              />

              <TextInput
                value={editItem?.telefono}
                onChangeText={(text) =>
                  setEditItem({ ...editItem, telefono: text })
                }
                placeholder="Teléfono"
                keyboardType="phone-pad"
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

        {/* Modal Nuevo */}
        <Modal visible={modalNuevoVisible} transparent animationType="slide">
          <View className="items-center justify-center flex-1 px-4 bg-black/30">
            <View className="w-full p-6 bg-white rounded-xl">
              <Text className="mb-4 text-lg font-bold text-blue-900">
                Nueva Organización
              </Text>

              <TextInput
                value={nuevoNombre}
                onChangeText={setNuevoNombre}
                placeholder="Nombre"
                className="px-3 py-2 mb-4 border border-gray-300 rounded-md"
              />

              <TextInput
                value={nuevoCorreo}
                onChangeText={setNuevoCorreo}
                placeholder="Correo"
                keyboardType="email-address"
                className="px-3 py-2 mb-4 border border-gray-300 rounded-md"
              />

              <TextInput
                value={nuevoTelefono}
                onChangeText={setNuevoTelefono}
                placeholder="Teléfono"
                keyboardType="phone-pad"
                className="px-3 py-2 mb-6 border border-gray-300 rounded-md"
              />

              <View className="flex-row justify-end space-x-3">
                <TouchableOpacity onPress={() => setModalNuevoVisible(false)}>
                  <Text className="font-semibold text-gray-600">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={agregarNuevo}>
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
