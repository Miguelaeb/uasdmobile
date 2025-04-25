const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sql = require("mssql");
const bcrypt = require("bcrypt");
const asignaturasRoutes = require("./routes/asignaturas");
const planesRoutes = require("./routes/planes");
const personalRoutes = require("./routes/personal");
const pagoRoutes = require("./routes/pago"); // Cambiado para evitar conflicto

// Configuración de la base de datos
const dbConfig = {
    user: "sa",
    password: "1234567",
    server: "_PC_VARGAS_",
    database: "uasdmobile",
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

// Configurar rutas
app.use("/asignaturas", asignaturasRoutes);
app.use("/planes", planesRoutes);
app.use("/personal", personalRoutes);
app.use("/Pagos", pagoRoutes); // Configura la ruta base para las rutas de pago

// Ruta para la raíz
app.get("/", (req, res) => {
    res.send("Bienvenido al backend de UASD Mobile");
});

// Ruta: Registro de usuario
app.post("/register", async (req, res) => {
    const { nombre, apellido, email, password } = req.body;

    if (!nombre || !apellido || !email || !password) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input("nombre", sql.NVarChar, nombre)
            .input("apellido", sql.NVarChar, apellido)
            .input("email", sql.NVarChar, email)
            .input("password", sql.NVarChar, hashedPassword)
            .query(`
                INSERT INTO Usuarios (nombre, apellido, email, password)
                VALUES (@nombre, @apellido, @email, @password)
            `);

        res.status(201).json({ message: "Usuario registrado exitosamente" });
    } catch (err) {
        if (err.originalError && err.originalError.info && err.originalError.info.number === 2627) {
            res.status(400).json({ error: "El correo ya está registrado" });
        } else {
            console.error("Error al registrar usuario:", err.message);
            res.status(500).send("Error al registrar usuario");
        }
    }
});

// Ruta: Login de usuario
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool
            .request()
            .input("email", sql.VarChar, email)
            .query("SELECT * FROM Usuarios WHERE email = @email");

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const user = result.recordset[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        res.status(200).json({ message: "Inicio de sesión exitoso", user: { id: user.id, nombre: user.nombre, email: user.email } });
    } catch (err) {
        console.error("Error al iniciar sesión:", err.message);
        res.status(500).send("Error al iniciar sesión");
    }
});

// Ruta: Obtener todos los usuarios
app.get("/usuarios", async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query("SELECT id, nombre, email, fechaRegistro FROM Usuarios");
        res.json(result.recordset);
    } catch (err) {
        console.error("Error al obtener usuarios:", err.message);
        res.status(500).send("Error al obtener usuarios");
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});