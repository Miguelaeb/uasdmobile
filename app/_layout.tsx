import { Stack } from "expo-router";
import "./globals.css";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Esto oculta el título como "index"
      }}
    />
  );
}
