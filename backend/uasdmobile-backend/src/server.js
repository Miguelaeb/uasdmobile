const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const asignaturasRoutes = require("./routes/asignaturas");
const planesRoutes = require("./routes/planes");
const personalRoutes = require("./routes/personal");

// Crear el servidor
const app = express();
const port = 4000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Configurar rutas
app.use("/asignaturas", asignaturasRoutes);
app.use("/planes", planesRoutes);
app.use("/personal", personalRoutes);

// Ruta para la raíz
app.get("/", (req, res) => {
    res.send("Bienvenido al backend de UASD Mobile");
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});