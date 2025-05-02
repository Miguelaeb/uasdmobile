import React from "react";
import { useAuth } from "./authContext";
import { useRouter } from "expo-router";
import { View, Text } from "react-native";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    if (!isAuthenticated) {
        router.replace("/login");
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Text>Redirigiendo...</Text>
            </View>
        );
    }

    return <>{children}</>;
};