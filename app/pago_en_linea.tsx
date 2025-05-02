import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  Modal,
  Platform,
} from "react-native";
import RNHTMLtoPDF from "react-native-html-to-pdf"; // Importa la biblioteca para generar PDFs
import * as FileSystem from "expo-file-system"; // Para manejar archivos en Expo
import { Picker } from "@react-native-picker/picker"; // Importar Picker
import { Feather } from "@expo/vector-icons"; // Asegúrate de importar Feather para el ícono de retroceder
import { useRouter } from "expo-router"; // Importa useRouter

const API_URL = "http://localhost:8081"; // Cambia esto por la URL de tu API

const BackButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{ flexDirection: "row", alignItems: "center", marginTop: 16, marginBottom: 16 }}
  >
    <Feather name="arrow-left" size={24} color="#3b82f6" />
    <Text style={{ marginLeft: 8, color: "#3b82f6", fontWeight: "600" }}>Volver</Text>
  </TouchableOpacity>
);

export default function PagoEnLinea() {
  const router = useRouter(); // Usa el router para navegar

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [cedula, setCedula] = useState("");
  const [comprobante, setComprobante] = useState<string | null>(null);
  const [planes, setPlanes] = useState<{ id: number; nombre: string; fechaCreacion?: string; monto?: string }[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null); // Estado para el plan seleccionado
  const [modalVisible, setModalVisible] = useState(false); // Estado para el modal
  const [tarjeta, setTarjeta] = useState("");
  const [titular, setTitular] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [cvc, setCvc] = useState("");
  const [carta, setCarta] = useState(""); // Estado para la carta
  const [cartaAsunto, setCartaAsunto] = useState(""); // Estado para el asunto de la carta
  const [cartaPlanNombre, setCartaPlanNombre] = useState(""); // Estado para el nombre del plan en la carta
  const [modalCartaVisible, setModalCartaVisible] = useState(false); // Modal para la carta
  const [currentStep, setCurrentStep] = useState(1); // Controla el paso actual (1: Carta, 2: Pago)
  const [comprobanteData, setComprobanteData] = useState<any>(null); // Datos del comprobante
  const [modalComprobanteVisible, setModalComprobanteVisible] = useState(false); // Modal para el comprobante
  const [email, setEmail] = useState(""); // Nuevo estado para el correo electrónico
  const [planPagado, setPlanPagado] = useState(false); // Estado para rastrear si el plan fue pagado

  useEffect(() => {
    const fetchPlanes = async () => {
      try {
        const response = await fetch(`${API_URL}/planes`);
        if (!response.ok) {
          throw new Error("Error al obtener los planes");
        }
        const data = await response.json();

        // Agregar un monto aleatorio a cada plan
        const planesConMonto = data.map((plan: any) => ({
          ...plan,
          monto: (Math.random() * (500 - 100) + 100).toFixed(2), // Generar monto entre 100 y 500
        }));

        setPlanes(planesConMonto);

        // Verificar si el plan seleccionado ya fue pagado
        if (selectedPlan) {
          const verificarResponse = await fetch(`${API_URL}/Pagos/verificar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cedula, planId: selectedPlan }),
          });

          if (verificarResponse.ok) {
            const verificarData = await verificarResponse.json();
            setPlanPagado(verificarData.pagado);
          }
        }
      } catch (error) {
        console.error("Error al obtener los planes:", error);
        Alert.alert("Error", "No se pudieron cargar los planes de estudio");
      }
    };

    fetchPlanes();
  }, [selectedPlan]);

  const handleCargarComprobante = () => {
    if (!selectedPlan) {
      Alert.alert("Error", "Por favor, selecciona un plan de estudio.");
      return;
    }
    setModalVisible(true); // Mostrar el modal
  };

  const handleGenerarCarta = () => {
    if (!selectedPlan) {
      Alert.alert("Error", "Por favor, selecciona un plan de estudio.");
      return;
    }

    if (planPagado) {
      Alert.alert("Información", "Ya has pagado este plan. No es necesario generar otra carta.");
      return;
    }

    setModalCartaVisible(true); // Mostrar el modal para la carta
    setCurrentStep(1); // Iniciar en el paso 1 (datos personales)
  };

  const handleConfirmarDatos = () => {
    if (!nombre.trim() || !apellido.trim() || !cedula.trim()) {
      Alert.alert("Error", "Por favor, completa todos los campos.");
      return;
    }
    setCurrentStep(2); // Avanzar al paso 2 (escribir carta)
  };

  const handleConfirmarCarta = () => {
    if (!carta.trim() || !cartaAsunto.trim() || !cartaPlanNombre.trim()) {
      Alert.alert("Error", "Por favor, completa todos los campos de la carta.");
      return;
    }
    setCurrentStep(3); // Avanzar al paso 3 (pago)
  };

  const handleConfirmarPago = async () => {
    if (!tarjeta || !titular || !fechaVencimiento || !cvc || !email.trim()) {
      Alert.alert("Error", "Por favor, completa todos los campos, incluido el correo electrónico.");
      return;
    }

    try {
      const pagoResponse = await fetch(`${API_URL}/Pagos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          apellido,
          cedula,
          planId: selectedPlan,
          monto: planes.find((plan) => plan.id.toString() === selectedPlan)?.monto,
          fecha: new Date().toISOString(),
          email,
        }),
      });

      if (!pagoResponse.ok) {
        throw new Error("Error al registrar el pago.");
      }

      Alert.alert(
        "Pago Confirmado",
        `El comprobante ha sido enviado a tu correo. Has pagado los impuestos del plan: ${
          planes.find((plan) => plan.id.toString() === selectedPlan)?.nombre
        } por un monto de $${planes.find((plan) => plan.id.toString() === selectedPlan)?.monto}.`
      );

      setPlanPagado(true); // Marcar el plan como pagado
      setModalCartaVisible(false); // Cerrar el modal
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      Alert.alert("Error", "No se pudo procesar el pago.");
    }
  };

  const handlePlanSeleccionado = async (planId: string | null) => {
    setSelectedPlan(planId);

    if (!planId) {
      Alert.alert("Error", "Por favor, selecciona un plan.");
      return;
    }

    try {
      const verificarResponse = await fetch(`${API_URL}/Pagos/verificar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      if (!verificarResponse.ok) {
        const errorData = await verificarResponse.json();
        console.error("Error al verificar el plan:", errorData.error || "Error desconocido");
        throw new Error("Error al verificar el estado del plan.");
      }

      const verificarData = await verificarResponse.json();
      setPlanPagado(verificarData.pagado); // Actualiza el estado del plan pagado

      if (verificarData.pagado) {
        Alert.alert(
          "Plan ya pagado",
          "Ya has pagado los impuestos de este plan. No es necesario realizar otro pago."
        );
      }
    } catch (error) {
      console.error("Error al verificar el plan:", error);
      Alert.alert("Error", "No se pudo verificar el estado del plan.");
    }
  };

  const handleVerComprobante = async () => {
    if (!selectedPlan) {
        Alert.alert("Error", "Por favor, selecciona un plan.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/Pagos/comprobante/${selectedPlan}`);
        if (!response.ok) {
            if (response.status === 404) {
                Alert.alert("Error", "No se encontró un comprobante para este plan.");
            } else {
                throw new Error("Error al obtener el comprobante.");
            }
            return;
        }

        const data = await response.json();
        setComprobanteData(data); // Guardar los datos del comprobante
        setModalComprobanteVisible(true); // Mostrar el modal
    } catch (error) {
        console.error("Error al obtener el comprobante:", error);
        Alert.alert("Error", "No se pudo obtener el comprobante. Por favor, intenta nuevamente.");
    }
};

  const handleBack = () => {
    router.push("/home"); // Navega de regreso a la pantalla principal
  };

  return (
    <View style={styles.container}>
      {/* Título */}
      
      {/* Botón de retroceder */}
      <BackButton onPress={handleBack} />
      <Text style={styles.title}>Pago en Línea</Text>

      {/* Subtítulo */}
      <Text style={styles.subtitle}>Selecciona un plan de estudio:</Text>

      {/* Picker con contenedor estilizado */}
      <View
     
      >
       
                 <Picker
                   selectedValue={selectedPlan}
                   onValueChange={(itemValue) => setSelectedPlan(itemValue)}
                   className="mb-4 border border-gray-300 rounded-md"
                 >
                   <Picker.Item label="Seleccionar..." value="" />
                   {planes.map((plan: any) => (
                     <Picker.Item key={plan.id} label={plan.nombre} value={plan.id} />
                   ))}
                 </Picker>
      </View>

      {/* Botones */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 150 }}>
        <TouchableOpacity
          onPress={handleGenerarCarta}
          style={[
            styles.generateButton,
            { flex: 1, marginRight: 8, backgroundColor: planPagado ? "#d1d5db" : "#6366f1" },
          ]}
          disabled={!selectedPlan || planPagado} // Desactiva si no hay plan seleccionado o si ya fue pagado
        >
          <Text style={styles.buttonText}>
            {planPagado ? "Plan Pagado" : "Generar Carta de Solicitud y Pago"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleVerComprobante}
          style={[
            styles.generateButton,
            { flex: 1, marginLeft: 8, backgroundColor: planPagado ? "#4caf50" : "#d1d5db" },
          ]}
          disabled={!planPagado} // Desactiva si el plan no ha sido pagado
        >
          <Text style={styles.buttonText}>Ver Comprobante</Text>
        </TouchableOpacity>
      </View>

      {/* Texto "Plan seleccionado" */}
      {selectedPlan && (
        <Text style={styles.selectedPlanText}>
          Plan seleccionado: {planes.find((plan) => plan.id.toString() === selectedPlan)?.nombre}
        </Text>
      )}

      {/* Modal para la carta */}
      <Modal visible={modalCartaVisible} animationType="slide">
        <View style={styles.container}>
          {currentStep === 1 && (
            <>
              <Text style={styles.subtitle}>Datos Personales</Text>
              <TextInput
                placeholder="Nombre"
                value={nombre}
                onChangeText={setNombre}
                style={styles.input}
              />
              <TextInput
                placeholder="Apellido"
                value={apellido}
                onChangeText={setApellido}
                style={styles.input}
              />
              <TextInput
                placeholder="Cédula"
                value={cedula}
                onChangeText={setCedula}
                style={styles.input}
              />
              <TouchableOpacity
                onPress={handleConfirmarDatos}
                style={styles.generateButton}
              >
                <Text style={styles.buttonText}>Confirmar Datos</Text>
              </TouchableOpacity>
            </>
          )}

          {currentStep === 2 && (
            <>
              <Text style={styles.subtitle}>Escribe tu Carta</Text>
              <TextInput
                placeholder="Asunto"
                value={cartaAsunto}
                onChangeText={setCartaAsunto}
                style={styles.input}
              />
              <TextInput
                placeholder="Nombre del Plan"
                value={cartaPlanNombre}
                onChangeText={setCartaPlanNombre}
                style={styles.input}
              />
              <TextInput
                placeholder="Escribe aquí tu carta..."
                value={carta}
                onChangeText={setCarta}
                style={[styles.input, { height: 100, textAlignVertical: "top" }]}
                multiline
              />
              <TouchableOpacity
                onPress={handleConfirmarCarta}
                style={styles.generateButton}
              >
                <Text style={styles.buttonText}>Confirmar Carta</Text>
              </TouchableOpacity>
            </>
          )}

          {currentStep === 3 && (
            <>
              <Text style={styles.subtitle}>Información de Pago</Text>
              <Text style={styles.infoText}>
                Estás pagando los impuestos del plan:{" "}
                <Text style={{ fontWeight: "bold" }}>
                  {planes.find((plan) => plan.id.toString() === selectedPlan)?.nombre}
                </Text>
              </Text>
              <Text style={styles.infoText}>
                Monto a pagar:{" "}
                <Text style={{ fontWeight: "bold", color: "#16a34a" }}>
                  ${planes.find((plan) => plan.id.toString() === selectedPlan)?.monto}
                </Text>
              </Text>
              <TextInput
                placeholder="Número de Tarjeta"
                value={tarjeta}
                onChangeText={setTarjeta}
                style={styles.input}
              />
              <TextInput
                placeholder="Titular de la Tarjeta"
                value={titular}
                onChangeText={setTitular}
                style={styles.input}
              />
              <TextInput
                placeholder="Fecha de Vencimiento (MM/AA)"
                value={fechaVencimiento}
                onChangeText={setFechaVencimiento}
                style={styles.input}
              />
              <TextInput
                placeholder="CVC"
                value={cvc}
                onChangeText={setCvc}
                style={styles.input}
              />
              <TextInput
                placeholder="Correo Electrónico"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
              />
              <TouchableOpacity
                onPress={handleConfirmarPago}
                style={styles.generateButton}
              >
                <Text style={styles.buttonText}>Confirmar Pago</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            onPress={() => setModalCartaVisible(false)}
            style={[styles.generateButton, { backgroundColor: "#ef4444" }]}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Modal para el comprobante */}
      <Modal visible={modalComprobanteVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Comprobante de Pago</Text>
            {comprobanteData ? (
              <>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: "bold" }}>Nombre:</Text> {comprobanteData.nombre}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: "bold" }}>Apellido:</Text> {comprobanteData.apellido}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: "bold" }}>Cédula:</Text> {comprobanteData.cedula}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: "bold" }}>Plan:</Text> {comprobanteData.planNombre}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: "bold" }}>Monto:</Text> ${comprobanteData.monto}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: "bold" }}>Fecha:</Text> {new Date(comprobanteData.fecha).toLocaleDateString()}
                </Text>
              </>
            ) : (
              <Text style={styles.modalText}>Cargando comprobante...</Text>
            )}
            <TouchableOpacity
              onPress={() => setModalComprobanteVisible(false)}
              style={[styles.generateButton, { backgroundColor: "#ef4444", marginTop: 16 }]}
            >
              <Text style={styles.buttonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1d4ed8",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  picker: {
    height: 50,
    color: "#1e293b",
    marginBottom: 16, // Espaciado entre el picker y el texto seleccionado
  },
  selectedPlanText: {
    fontSize: 16,
    color: "#1e293b",
    marginTop: 32, // Espaciado adicional para colocarlo al final
    textAlign: "center",
  },
  generateButton: {
    backgroundColor: "#6366f1",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  infoText: {
    fontSize: 16,
    color: "#1e293b",
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    color: "#1e293b",
    marginBottom: 8,
    textAlign: "center",
  },
});