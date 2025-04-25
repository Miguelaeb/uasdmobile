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

const API_URL = "http://localhost:4000"; // Cambia esto por la URL de tu API

export default function PagoEnLinea() {
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
  const [modalCartaVisible, setModalCartaVisible] = useState(false); // Modal para la carta
  const [currentStep, setCurrentStep] = useState(1); // Controla el paso actual (1: Carta, 2: Pago)
  const [comprobanteData, setComprobanteData] = useState<any>(null); // Datos del comprobante
  const [modalComprobanteVisible, setModalComprobanteVisible] = useState(false); // Modal para el comprobante

  useEffect(() => {
    // Obtener los planes desde la API
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
      } catch (error) {
        console.error("Error al obtener los planes:", error);
        Alert.alert("Error", "No se pudieron cargar los planes de estudio");
      }
    };

    fetchPlanes();
  }, []);

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
    setModalCartaVisible(true); // Mostrar el modal
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
    if (!carta.trim()) {
      Alert.alert("Error", "Por favor, escribe el contenido de la carta.");
      return;
    }
    setCurrentStep(3); // Avanzar al paso 3 (pago)
  };

  const handleConfirmarPago = async () => {
    if (!tarjeta || !titular || !fechaVencimiento || !cvc) {
        Alert.alert("Error", "Por favor, completa todos los campos de la tarjeta.");
        return;
    }

    try {
        // Verificar si el plan ya fue pagado
        const verificarResponse = await fetch(`${API_URL}/Pagos/verificar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cedula, planId: selectedPlan }),
        });

        if (!verificarResponse.ok) {
            throw new Error("Error al verificar el estado del plan.");
        }

        const verificarData = await verificarResponse.json();
        if (verificarData.pagado) {
            Alert.alert("Error", "Este plan ya ha sido pagado. No puedes realizar otro pago.");
            setSelectedPlan(null); // Desmarcar el plan seleccionado
            return; // Detener el flujo si el plan ya fue pagado
        }

        // Continuar con el registro del pago
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
            }),
        });

        if (!pagoResponse.ok) {
            throw new Error("Error al registrar el pago.");
        }

        const pagoData = await pagoResponse.json();

        // Generar el comprobante en PDF
        const htmlContent = `
            <h1>Comprobante de Pago</h1>
            <p><strong>Nombre:</strong> ${nombre} ${apellido}</p>
            <p><strong>Cédula:</strong> ${cedula}</p>
            <p><strong>Plan:</strong> ${planes.find((plan) => plan.id.toString() === selectedPlan)?.nombre || "N/A"}</p>
            <p><strong>Monto:</strong> RD$${planes.find((plan) => plan.id.toString() === selectedPlan)?.monto || "0.00"}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
        `;

        const options = {
            html: htmlContent,
            fileName: "comprobante_pago",
            directory: "Documents",
        };

        const file = await RNHTMLtoPDF.convert(options);

        setComprobante(file.filePath ?? null); // Guarda la ruta del archivo generado
        Alert.alert(
            "Pago Confirmado",
            "El comprobante se ha generado correctamente. Puedes descargarlo o imprimirlo.",
            [
                {
                    text: "Descargar",
                    onPress: () => {
                        if (Platform.OS === "web") {
                            window.open(file.filePath, "_blank");
                        } else {
                            Alert.alert("Descarga", `Archivo guardado en: ${file.filePath}`);
                        }
                    },
                },
                {
                    text: "Imprimir",
                    onPress: () => {
                        Alert.alert("Imprimir", "Función de impresión no implementada.");
                    },
                },
            ]
        );
    } catch (error) {
        console.error("Error al procesar el pago:", error);
        Alert.alert("Error", "No se pudo procesar el pago.");
    }
};

  const handlePlanSeleccionado = async (planId: string | null) => {
    setSelectedPlan(planId);

    if (!planId) return;

    try {
      // Verificar si el plan ya fue pagado
      const verificarResponse = await fetch(`${API_URL}/Pagos/verificar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cedula, planId }),
      });

      if (!verificarResponse.ok) {
        throw new Error("Error al verificar el estado del plan.");
      }

      const verificarData = await verificarResponse.json();
      if (verificarData.pagado) {
        Alert.alert(
          "Plan ya pagado",
          "Ya has pagado los impuestos de este plan. No es necesario realizar otro pago."
        );
        setSelectedPlan(null); // Desmarcar el plan seleccionado
      }
    } catch (error) {
      console.error("Error al verificar el plan:", error);
      Alert.alert("Error", "No se pudo verificar el estado del plan.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pago en Línea</Text>

      <Text style={styles.subtitle}>Selecciona un plan de estudio:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedPlan}
          onValueChange={(itemValue) => handlePlanSeleccionado(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Seleccionar..." value={null} />
          {planes.map((plan) => (
            <Picker.Item
              key={plan.id}
              label={plan.nombre}
              value={plan.id.toString()}
            />
          ))}
        </Picker>
      </View>

      {selectedPlan && (
        <Text style={styles.selectedPlanText}>
          Plan seleccionado: {planes.find((plan) => plan.id.toString() === selectedPlan)?.nombre}
        </Text>
      )}

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
        <TouchableOpacity
          onPress={handleGenerarCarta}
          style={[styles.generateButton, { flex: 1, marginRight: 8 }]}
          disabled={!selectedPlan} // Deshabilitar si no hay plan seleccionado
        >
          <Text style={styles.buttonText}>Generar Carta de Solicitud y Pago</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={async () => {
            if (!selectedPlan) {
              Alert.alert("Error", "Por favor, selecciona un plan.");
              return;
            }

            try {
              const response = await fetch(`${API_URL}/Pagos/comprobante/${cedula}/${selectedPlan}`);
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
              Alert.alert("Error", "No se pudo obtener el comprobante.");
            }
          }}
          style={[
            styles.generateButton,
            { flex: 1, marginLeft: 8, backgroundColor: selectedPlan ? "#4caf50" : "#d1d5db" },
          ]}
          disabled={!selectedPlan} // Deshabilitar si no hay plan seleccionado
        >
          <Text style={styles.buttonText}>Ver Comprobante</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalCartaVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalCartaVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {currentStep === 1 && (
              <>
                <Text style={styles.modalTitle}>Datos Personales</Text>
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
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  onPress={handleConfirmarDatos}
                  style={styles.confirmButton}
                >
                  <Text style={styles.buttonText}>Siguiente</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setModalCartaVisible(false)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              </>
            )}

            {currentStep === 2 && (
              <>
                <Text style={styles.modalTitle}>Escribir Carta de Solicitud</Text>
                <TextInput
                  placeholder="Escribe aquí el contenido de la carta..."
                  value={carta}
                  onChangeText={setCarta}
                  style={[styles.input, { height: 200, textAlignVertical: "top" }]}
                  multiline={true}
                />
                <TouchableOpacity
                  onPress={handleConfirmarCarta}
                  style={styles.confirmButton}
                >
                  <Text style={styles.buttonText}>Siguiente</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setModalCartaVisible(false)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              </>
            )}

            {currentStep === 3 && (
              <>
                <Text style={styles.modalTitle}>Información del Pago</Text>
                <Text style={styles.modalText}>
                  Este monto corresponde al impuesto necesario para la creación del plan.
                </Text>
                <Text style={styles.modalText}>
                  Monto: RD${planes.find((plan) => plan.id.toString() === selectedPlan)?.monto || "0.00"}
                </Text>
                <Text style={styles.modalText}>
                  Plan: {planes.find((plan) => plan.id.toString() === selectedPlan)?.nombre || "No seleccionado"}
                </Text>

                <TextInput
                  placeholder="Número de Tarjeta"
                  value={tarjeta}
                  onChangeText={setTarjeta}
                  style={styles.input}
                  keyboardType="numeric"
                />
                <TextInput
                  placeholder="Titular"
                  value={titular}
                  onChangeText={setTitular}
                  style={styles.input}
                />
                <TextInput
                  placeholder="MM/YY"
                  value={fechaVencimiento}
                  onChangeText={setFechaVencimiento}
                  style={styles.input}
                />
                <TextInput
                  placeholder="CVC"
                  value={cvc}
                  onChangeText={setCvc}
                  style={styles.input}
                  keyboardType="numeric"
                />

                <TouchableOpacity
                  onPress={handleConfirmarPago}
                  style={styles.confirmButton}
                >
                  <Text style={styles.buttonText}>Confirmar Pago</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setModalCartaVisible(false)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalComprobanteVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalComprobanteVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {comprobanteData ? (
              <>
                <Text style={styles.modalTitle}>Comprobante de Pago</Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: "bold" }}>Nombre:</Text> {comprobanteData.nombre} {comprobanteData.apellido}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: "bold" }}>Cédula:</Text> {comprobanteData.cedula}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: "bold" }}>Plan:</Text> {planes.find((plan) => plan.id.toString() === selectedPlan)?.nombre || "N/A"}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: "bold" }}>Monto:</Text> RD${comprobanteData.monto}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: "bold" }}>Fecha:</Text> {new Date(comprobanteData.fecha).toLocaleDateString()}
                </Text>
                <TouchableOpacity
                  onPress={() => setModalComprobanteVisible(false)}
                  style={styles.confirmButton}
                >
                  <Text style={styles.buttonText}>Cerrar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.modalText}>Cargando comprobante...</Text>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    marginBottom: 16,
  },
  picker: {
    height: 50,
    color: "#1e293b",
  },
  selectedPlanText: {
    fontSize: 16,
    color: "#1e293b",
    marginBottom: 16,
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo semi-transparente
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 12,
  },
  input: {
    height: 40,
    borderColor: "#d1d5db",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  confirmButton: {
    backgroundColor: "#4caf50",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: "#f44336",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});