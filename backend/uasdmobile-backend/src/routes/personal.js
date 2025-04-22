const express = require("express");
const sql = require("mssql");
const dbConfig = require("../config/dbConfig");

const router = express.Router();

// Ruta: Obtener todos los personales
router.get("/", async (_, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query("SELECT * FROM Personal");
        res.json(result.recordset);
    } catch (err) {
        console.error("Error al obtener el personal:", err.message);
        res.status(500).send("Error al obtener el personal");
    }
});

// Ruta: Crear un nuevo personal con respuesta detallada
router.post("/", async (req, res) => {
    const { nombre, apellido, correo, telefono, puesto } = req.body;

    if (!nombre || !apellido || !correo || !telefono || !puesto) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    try {
        const pool = await sql.connect(dbConfig);

        // Generar el próximo ID automáticamente
        const idResult = await pool.request().query(`
            SELECT TOP 1 id 
            FROM Personal 
            WHERE id LIKE 'EMP%' 
            ORDER BY CAST(SUBSTRING(id, 4, LEN(id)) AS INT) DESC
        `);

        let newId = "EMP001"; // ID inicial si no hay registros
        if (idResult.recordset.length > 0) {
            const lastId = idResult.recordset[0].id; // Ejemplo: "EMP009"
            const numericPart = parseInt(lastId.substring(3), 10); // Extraer el número: 9
            newId = `EMP${String(numericPart + 1).padStart(3, "0")}`; // Generar: "EMP010"
        }

        // Insertar el nuevo registro con el ID generado
        const result = await pool
            .request()
            .input("id", sql.VarChar, newId)
            .input("nombre", sql.VarChar, nombre)
            .input("apellido", sql.VarChar, apellido)
            .input("correo", sql.VarChar, correo)
            .input("telefono", sql.VarChar, telefono)
            .input("puesto", sql.VarChar, puesto)
            .query(
                "INSERT INTO Personal (id, nombre, apellido, correo, telefono, puesto) OUTPUT INSERTED.* VALUES (@id, @nombre, @apellido, @correo, @telefono, @puesto)"
            );

        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error("Error al agregar el personal:", err.message);
        res.status(500).send("Error al agregar el personal");
    }
});

// Ruta: Editar un personal
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, correo, telefono, puesto } = req.body;

    if (!nombre || !apellido || !correo || !telefono || !puesto) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool
            .request()
            .input("id", sql.VarChar, id)
            .input("nombre", sql.VarChar, nombre)
            .input("apellido", sql.VarChar, apellido)
            .input("correo", sql.VarChar, correo)
            .input("telefono", sql.VarChar, telefono)
            .input("puesto", sql.VarChar, puesto)
            .query(
                "UPDATE Personal SET nombre = @nombre, apellido = @apellido, correo = @correo, telefono = @telefono, puesto = @puesto WHERE id = @id"
            );

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Personal no encontrado" });
        }

        res.status(200).json({ message: "Personal actualizado exitosamente" });
    } catch (err) {
        console.error("Error al actualizar el personal:", err.message);
        res.status(500).send("Error al actualizar el personal");
    }
});

// Ruta: Eliminar un personal
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool
            .request()
            .input("id", sql.VarChar, id)
            .query("DELETE FROM Personal WHERE id = @id");

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Personal no encontrado" });
        }

        res.status(200).json({ message: "Personal eliminado exitosamente" });
    } catch (err) {
        console.error("Error al eliminar el personal:", err.message);
        res.status(500).send("Error al eliminar el personal");
    }
});

module.exports = router;