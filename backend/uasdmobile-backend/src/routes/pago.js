const express = require("express");
const sql = require("mssql");
const dbConfig = require("../config/dbConfig");

const router = express.Router(); // Inicializa el router

// Ruta: Obtener todos los pagos
router.get("/", async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query("SELECT * FROM Pagos");
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error("Error al obtener los pagos:", err.message);
        res.status(500).send("Error al obtener los pagos");
    }
});

// Ruta: Crear un nuevo pago
router.post("/", async (req, res) => {
    const { nombre, apellido, cedula, planId, monto, fecha } = req.body;

    if (!nombre || !apellido || !cedula || !planId || !monto || !fecha) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    try {
        const pool = await sql.connect(dbConfig);

        const result = await pool
            .request()
            .input("nombre", sql.VarChar, nombre)
            .input("apellido", sql.VarChar, apellido)
            .input("cedula", sql.VarChar, cedula)
            .input("planId", sql.Int, planId)
            .input("monto", sql.Decimal(10, 2), monto)
            .input("fecha", sql.DateTime, fecha)
            .query(
                `INSERT INTO Pagos (nombre, apellido, cedula, planId, monto, fecha)
                 OUTPUT INSERTED.*
                 VALUES (@nombre, @apellido, @cedula, @planId, @monto, @fecha)`
            );

        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error("Error al crear el pago:", err.message);
        res.status(500).send("Error al crear el pago");
    }
});

// Ruta: Verificar si un plan ya fue pagado
router.post("/verificar", async (req, res) => {
    const { cedula, planId } = req.body;

    if (!cedula || !planId) {
        return res.status(400).json({ error: "Cédula y planId son obligatorios" });
    }

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool
            .request()
            .input("cedula", sql.VarChar, cedula)
            .input("planId", sql.Int, planId)
            .query("SELECT * FROM Pagos WHERE cedula = @cedula AND planId = @planId");

        if (result.recordset.length > 0) {
            return res.status(200).json({ pagado: true }); // Plan ya pagado
        }

        res.status(200).json({ pagado: false }); // Plan no pagado
    } catch (err) {
        console.error("Error al verificar el pago:", err.message);
        res.status(500).send("Error al verificar el pago");
    }
});

router.get("/comprobante/:cedula/:planId", async (req, res) => {
    const { cedula, planId } = req.params;

    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool
            .request()
            .input("cedula", sql.VarChar, cedula)
            .input("planId", sql.Int, planId)
            .query("SELECT * FROM Pagos WHERE cedula = @cedula AND planId = @planId");

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "No se encontró un comprobante para este plan." });
        }

        res.status(200).json(result.recordset[0]);
    } catch (err) {
        console.error("Error al obtener el comprobante:", err.message);
        res.status(500).send("Error al obtener el comprobante");
    }
});

// Exportar el router
module.exports = router;