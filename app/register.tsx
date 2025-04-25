import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (name && lastName && email && password) {
      try {
        const response = await fetch("http://localhost:4000/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: name,
            apellido: lastName, // Asegúrate de incluir este campo
            email,
            password,
          }),
        });

        if (response.ok) {
          alert("Registro exitoso. Ahora puedes iniciar sesión.");
          router.replace("/login");
        } else {
          const errorData = await response.json();
          alert(errorData.error || "Error al registrar usuario.");
        }
      } catch (error) {
        alert("Error al conectar con el servidor.");
      }
    } else {
      alert("Por favor, completa todos los campos.");
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="mb-6 text-2xl font-bold text-center text-blue-900">
        Registrarse
      </Text>
      <TextInput
        placeholder="Nombre completo"
        placeholderTextColor="#94a3b8"
        value={name}
        onChangeText={setName}
        className="px-4 py-3 mb-4 text-sm bg-gray-100 rounded-full"
      />
      <TextInput
        placeholder="Apellido"
        placeholderTextColor="#94a3b8"
        value={lastName}
        onChangeText={setLastName}
        className="px-4 py-3 mb-4 text-sm bg-gray-100 rounded-full"
      />
      <TextInput
        placeholder="Correo electrónico"
        placeholderTextColor="#94a3b8"
        value={email}
        onChangeText={setEmail}
        className="px-4 py-3 mb-4 text-sm bg-gray-100 rounded-full"
      />
      <TextInput
        placeholder="Contraseña"
        placeholderTextColor="#94a3b8"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        className="px-4 py-3 mb-6 text-sm bg-gray-100 rounded-full"
      />
      <TouchableOpacity
        onPress={handleRegister}
        className="w-full py-3 mb-4 bg-blue-500 rounded-full"
      >
        <Text className="text-sm font-semibold text-center text-white">
          Registrarse
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text className="text-sm text-center text-blue-500">
          ¿Ya tienes cuenta? Inicia sesión
        </Text>
      </TouchableOpacity>
    </View>
  );
}