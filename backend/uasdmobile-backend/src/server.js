const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sql = require("mssql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // Importar jsonwebtoken
const asignaturasRoutes = require("./routes/asignaturas");
const planesRoutes = require("./routes/planes");
const personalRoutes = require("./routes/personal");
const pagoRoutes = require("./routes/pago"); // Cambiado para evitar conflicto
const competenciasRoutes = require("./routes/competencias");    // Importar rutas de competencias

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

const JWT_SECRET = "tu_secreto_super_seguro"; // Cambia esto por una clave secreta segura

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
app.use("/competencias", competenciasRoutes); // Configura la ruta base para las rutas de competencias
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

        // Generar un token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email }, // Datos que incluir en el token
            JWT_SECRET, // Clave secreta
            { expiresIn: "1h" } // Tiempo de expiración
        );

        // Devolver el token y los datos del usuario
        res.status(200).json({
            message: "Inicio de sesión exitoso",
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.email,
            },
        });
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

// Ruta: Actualizar usuario
app.put("/updateUser", async (req, res) => {
    const { name, lastName, email, photo } = req.body; // Incluye el campo photo
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "No autorizado" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        console.log("Datos recibidos:", { name, lastName, email, photo }); // Verifica los datos recibidos

        const pool = await sql.connect(dbConfig);
        await pool
            .request()
            .input("id", sql.Int, userId)
            .input("nombre", sql.NVarChar, name)
            .input("apellido", sql.NVarChar, lastName)
            .input("email", sql.NVarChar, email)
            .input("photo", sql.NVarChar, photo) // Guarda la URL de la foto
            .query(
                "UPDATE Usuarios SET nombre = @nombre, apellido = @apellido, email = @email, photo = @photo WHERE id = @id"
            );

        const updatedUser = {
            id: userId,
            name,
            lastName,
            email,
            photo,
        };

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error al actualizar usuario:", error.message);
        res.status(500).json({ error: "Error al actualizar usuario" });
    }
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

// Función para manejar la actualización de usuario desde el frontend
const handleSave = async () => {
    try {
        const userData = { name, lastName, email, photo }; // Incluye la foto
        console.log("Datos enviados al backend:", userData); // Verifica los datos enviados
        const token = await AsyncStorage.getItem("authToken");

        const response = await fetch("http://localhost:8081/updateUser", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
        });

        if (response.ok) {
            const updatedUser = await response.json();
            await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
            updateUser(updatedUser); // Actualiza los datos en el contexto
            Alert.alert("Éxito", "Tus datos han sido actualizados.");
            router.back(); // Regresa al Home
        } else {
            const errorData = await response.json();
            Alert.alert("Error", errorData.error || "No se pudieron actualizar los datos.");
        }
    } catch (error) {
        console.error("Error en handleSave:", error);
        Alert.alert("Error", "Hubo un problema al actualizar los datos.");
    }
};

// Función para seleccionar una imagen desde la galería
const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
    });

    if (!result.canceled) {
        console.log("Imagen seleccionada:", result.assets[0].uri); // Verifica la URI de la imagen
        setPhoto(result.assets[0].uri); // Guarda la URI de la imagen seleccionada
    }
};