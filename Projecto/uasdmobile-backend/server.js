const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sql = require("mssql");

// Configuración de la base de datos
const dbConfig = {
    user: "sa",
    password: "1234567",
    server: "_PC_VARGAS_", // Cambia esto si usas localhost o una IP
    database: "uasdmobile", // Nombre de la base de datos
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
    port: 1433,
};

// Crear el servidor
const app = express();
const port = 4000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Ruta para la raíz
app.get("/", (req, res) => {
    res.send("Bienvenido al backend de UASD Mobile");
});

// Ruta: Obtener todas las asignaturas
app.get("/asignaturas", async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query("SELECT * FROM Asignaturas");
        res.json(result.recordset);
    } catch (err) {
        console.error("Error al obtener asignaturas:", err.message);
        res.status(500).send("Error al obtener asignaturas");
    }
});

// Ruta: Agregar una nueva asignatura
app.post("/asignaturas", async (req, res) => {
    const { id, nombre, creditos } = req.body;
    try {
        const pool = await sql.connect(dbConfig);
        await pool
            .request()
            .input("id", sql.VarChar, id)
            .input("nombre", sql.VarChar, nombre)
            .input("creditos", sql.Int, creditos)
            .query(
                "INSERT INTO Asignaturas (id, nombre, creditos) VALUES (@id, @nombre, @creditos)"
            );
        res.send("Asignatura agregada correctamente");
    } catch (err) {
        console.error("Error al agregar asignatura:", err.message);
        res.status(500).send("Error al agregar asignatura");
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});