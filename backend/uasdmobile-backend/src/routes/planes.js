// filepath: /uasdmobile-backend/uasdmobile-backend/src/routes/planes.js
const express = require("express");
const sql = require("mssql");
const dbConfig = require("../config/dbConfig");

const router = express.Router();

// Ruta: Obtener todos los planes de estudio
router.get("/", async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query("SELECT id, nombre, codigo, competencia, fechaCreacion FROM Planes");
        res.json(result.recordset);
    } catch (err) {
        console.error("Error al obtener planes de estudio:", err.message);
        res.status(500).send("Error al obtener planes de estudio");
    }
});

// Ruta: Crear un nuevo plan
router.post("/", async (req, res) => {
    const { nombre, codigo, competencia } = req.body;

    if (!nombre || !codigo || !competencia) {
        return res.status(400).send("Todos los campos son obligatorios");
    }

    try {
        const pool = await sql.connect(dbConfig);
        await pool
            .request()
            .input("nombre", sql.VarChar, nombre)
            .input("codigo", sql.VarChar, codigo)
            .input("competencia", sql.VarChar, competencia)
            .input("fechaCreacion", sql.DateTime, new Date())
            .query(
                "INSERT INTO Planes (nombre, codigo, competencia, fechaCreacion) VALUES (@nombre, @codigo, @competencia, @fechaCreacion)"
            );
        res.send("Plan agregado correctamente");
    } catch (err) {
        console.error("Error al agregar plan:", err.message);
        res.status(500).send("Error al agregar plan");
    }
});

// Ruta: Eliminar un plan por ID
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await sql.connect(dbConfig);
        await pool
            .request()
            .input("id", sql.Int, id)
            .query("DELETE FROM Planes WHERE id = @id");
        res.send("Plan eliminado correctamente");
    } catch (err) {
        console.error("Error al eliminar plan:", err.message);
        res.status(500).send("Error al eliminar plan");
    }
});

module.exports = router;