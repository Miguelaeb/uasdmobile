// filepath: /uasdmobile-backend/uasdmobile-backend/src/routes/asignaturas.js
const express = require("express");
const sql = require("mssql");
const dbConfig = require("../config/dbConfig");

const API_URL = "http://localhost:8081"; // Asegúrate de que esta IP sea correcta

const router = express.Router();

// Ruta: Obtener todas las asignaturas
router.get("/", async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query("SELECT * FROM Asignaturas");
        res.json(result.recordset);
    } catch (err) {
        console.error("Error al obtener asignaturas:", err.message);
        res.status(500).send("Error al obtener asignaturas");
    }
});

// Ruta: Obtener asignaturas por plan de estudio
router.get("/:planId", async (req, res) => {
    const { planId } = req.params;

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool
            .request()
            .input("planId", sql.Int, planId)
            .query("SELECT * FROM Asignaturas WHERE planId = @planId");
        res.json(result.recordset);
    } catch (err) {
        console.error("Error al obtener asignaturas del plan:", err.message);
        res.status(500).send("Error al obtener asignaturas del plan");
    }
});

// Ruta: Crear una nueva asignatura
router.post("/", async (req, res) => {
    const {
        id,
        nombre,
        creditos,
        horasPracticas,
        horasTeoricas,
        prerequisitos,
        semestre,
        equivalente,
        planId,
    } = req.body;

    if (
        !id ||
        !nombre ||
        !creditos ||
        !horasPracticas ||
        !horasTeoricas ||
        !prerequisitos ||
        !semestre ||
        !equivalente ||
        !planId
    ) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    try {
        const pool = await sql.connect(dbConfig);
        await pool
            .request()
            .input("id", sql.VarChar, id)
            .input("nombre", sql.VarChar, nombre)
            .input("creditos", sql.Int, creditos)
            .input("horasPracticas", sql.Int, horasPracticas)
            .input("horasTeoricas", sql.Int, horasTeoricas)
            .input("prerequisitos", sql.VarChar, prerequisitos)
            .input("semestre", sql.Int, semestre)
            .input("equivalente", sql.VarChar, equivalente)
            .input("planId", sql.Int, planId)
            .query(
                "INSERT INTO Asignaturas (id, nombre, creditos, horasPracticas, horasTeoricas, prerequisitos, semestre, equivalente, planId) VALUES (@id, @nombre, @creditos, @horasPracticas, @horasTeoricas, @prerequisitos, @semestre, @equivalente, @planId)"
            );

        res.status(201).json({ message: "Asignatura creada exitosamente" });
    } catch (err) {
        console.error("Error al crear la asignatura:", err.message);
        res.status(500).send("Error al crear la asignatura");
    }
});

// Ruta: Editar una asignatura
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const {
        nombre,
        creditos,
        horasPracticas,
        horasTeoricas,
        prerequisitos,
        semestre,
        equivalente,
    } = req.body;

    if (
        !nombre ||
        !creditos ||
        !horasPracticas ||
        !horasTeoricas ||
        !prerequisitos ||
        !semestre ||
        !equivalente
    ) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool
            .request()
            .input("id", sql.VarChar, id)
            .input("nombre", sql.VarChar, nombre)
            .input("creditos", sql.Int, creditos)
            .input("horasPracticas", sql.Int, horasPracticas)
            .input("horasTeoricas", sql.Int, horasTeoricas)
            .input("prerequisitos", sql.VarChar, prerequisitos)
            .input("semestre", sql.Int, semestre)
            .input("equivalente", sql.VarChar, equivalente)
            .query(
                "UPDATE Asignaturas SET nombre = @nombre, creditos = @creditos, horasPracticas = @horasPracticas, horasTeoricas = @horasTeoricas, prerequisitos = @prerequisitos, semestre = @semestre, equivalente = @equivalente WHERE id = @id"
            );

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Asignatura no encontrada" });
        }

        res.status(200).json({ message: "Asignatura actualizada exitosamente" });
    } catch (err) {
        console.error("Error al actualizar la asignatura:", err.message);
        res.status(500).send("Error al actualizar la asignatura");
    }
});

// Ruta: Eliminar una asignatura
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool
            .request()
            .input("id", sql.VarChar, id)
            .query("DELETE FROM Asignaturas WHERE id = @id");

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Asignatura no encontrada" });
        }

        res.status(200).json({ message: "Asignatura eliminada exitosamente" });
    } catch (err) {
        console.error("Error al eliminar la asignatura:", err.message);
        res.status(500).send("Error al eliminar la asignatura");
    }
});

// Ruta: Obtener todos los planes
router.get("/planes", async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query("SELECT * FROM Planes");
        res.json(result.recordset);
    } catch (err) {
        console.error("Error al obtener planes:", err.message);
        res.status(500).send("Error al obtener planes");
    }
});

module.exports = router;