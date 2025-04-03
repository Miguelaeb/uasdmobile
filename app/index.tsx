import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import {
  FontAwesome5,
  Feather,
  Ionicons,
  MaterialIcons,
  AntDesign,
} from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";

const dashboardCards = [
  {
    label: "Ingresar Plan",
    icon: <Feather name="file-text" size={22} color="#ef4444" />,
    color: "#fee2e2",
    href: "/nuevo_plan",
  },
  {
    label: "Mis Planes",
    icon: <Feather name="folder" size={22} color="#3b82f6" />,
    color: "#dbeafe",
    href: "/mis-planes",
  },
  {
    label: "Asignaturas",
    icon: <Feather name="book-open" size={22} color="#8b5cf6" />,
    color: "#ede9fe",
    href: "/asignaturas",
  },
  {
    label: "Personal",
    icon: <Ionicons name="people-outline" size={22} color="#ec4899" />,
    color: "#fce7f3",
    href: "/personal",
  },
  {
    label: "Organización",
    icon: <Feather name="grid" size={22} color="#10b981" />,
    color: "#d1fae5",
    href: "/organizacion",
  },
  {
    label: "Competencias",
    icon: <FontAwesome5 name="tasks" size={22} color="#eab308" />,
    color: "#fef9c3",
    href: "/competencias",
  },
  {
    label: "Educación Virtual",
    icon: <MaterialIcons name="computer" size={22} color="#6366f1" />,
    color: "#e0e7ff",
    href: "/educacion_virtual",
  },
  {
    label: "Configuración",
    icon: <Feather name="settings" size={22} color="#6b7280" />,
    color: "#f3f4f6",
    href: "/configuracion",
  },
] as const;

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 40,
        }}
      >
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-sm text-gray-500">Hola,</Text>
            <Text className="text-2xl font-bold text-blue-900">Miguel</Text>
          </View>
          <View className="items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
            <AntDesign name="smileo" size={20} color="#2563eb" />
          </View>
        </View>

        <View className="p-4 mb-6 bg-blue-500 shadow-sm rounded-2xl">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Image
                source={{
                  uri: "https://randomuser.me/api/portraits/men/32.jpg",
                }}
                className="w-10 h-10 mr-3 rounded-full"
              />
              <View>
                <Text className="text-base font-bold text-white">
                  Miguel Evangelista
                </Text>
                <Text className="text-sm text-blue-100">
                  Front End developer
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color="white" />
          </View>

          <View className="flex-row justify-between pt-3 border-t border-blue-400">
            <View className="flex-row items-center">
              <Feather name="calendar" size={16} color="white" />
              <Text className="ml-2 text-sm text-white">
                Miercoles, 2 Abril
              </Text>
            </View>
            <View className="flex-row items-center">
              <Feather name="clock" size={16} color="white" />
              <Text className="ml-2 text-sm text-white">11:00 – 12:00 AM</Text>
            </View>
          </View>
        </View>

        <View className="mb-5">
          <TextInput
            placeholder="Buscar sección o módulo"
            placeholderTextColor="#94a3b8"
            className="px-4 py-3 text-sm bg-gray-100 rounded-full"
          />
        </View>

        {/* Dashboard Cards */}
        <View className="flex-row flex-wrap justify-between gap-y-4">
          {dashboardCards.map((card, index) => (
            <Link href={card.href} key={index} asChild>
              <TouchableOpacity
                style={{ backgroundColor: card.color }}
                className="w-[47%] rounded-xl p-4 shadow-sm"
              >
                <View className="mb-2">{card.icon}</View>
                <Text className="text-sm font-semibold text-gray-700">
                  {card.label}
                </Text>
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
