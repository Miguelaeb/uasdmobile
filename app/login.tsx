import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { useAuth } from "./authContext";
import { router } from "expo-router";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (email && password) {
      try {
        const response = await fetch("http://localhost:8081/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.token) {
            login(data.token, {
              name: data.user.nombre,
              lastName: data.user.apellido,
              email: data.user.email,
              photo: data.user.photo || null, // Asegúrate de incluir la foto si está disponible
            });
          } else {
            alert("Error al iniciar sesión. Inténtalo de nuevo.");
          }
        } else {
          const errorData = await response.json();
          alert(errorData.error || "Error al iniciar sesión.");
        }
      } catch (error) {
        alert("Error al conectar con el servidor.");
      }
    } else {
      alert("Por favor, ingresa tus credenciales.");
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      {/* Logo */}
      <View className="items-center mb-8">
        <Image
          source={{
            uri: "https://via.placeholder.com/100",
          }}
          className="w-24 h-24 mb-4"
        />
        <Text className="text-2xl font-bold text-blue-900">Bienvenido</Text>
        <Text className="text-sm text-gray-500">
          Inicia sesión para continuar
        </Text>
      </View>

      {/* Formulario */}
      <View className="mb-6">
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
      </View>

      {/* Botón de inicio de sesión */}
      <TouchableOpacity
        onPress={handleLogin}
        className="w-full py-3 mb-4 bg-blue-500 rounded-full"
      >
        <Text className="text-sm font-semibold text-center text-white">
          Iniciar Sesión
        </Text>
      </TouchableOpacity>

      {/* Enlace para registrarse */}
      <TouchableOpacity onPress={() => router.push("/register")}>
        <Text className="text-sm text-center text-blue-500">
          ¿No tienes cuenta? Regístrate
        </Text>
      </TouchableOpacity>
    </View>
  );
}