// filepath: /uasdmobile-backend/uasdmobile-backend/src/routes/planes.js
const express = require("express");
const sql = require("mssql");
const dbConfig = require("../config/dbConfig");

const router = express.Router();

// Ruta: Obtener todos los planes de estudio
router.get("/", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT 
        p.id, 
        p.nombre, 
        p.codigo, 
        p.fechaCreacion, 
        c.nombre AS competencia_nombre 
      FROM Planes p
      INNER JOIN Competencias c ON p.id_competencia = c.id
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error al obtener planes de estudio:", err.message);
    res.status(500).send("Error al obtener planes de estudio");
  }
});

// Ruta: Crear un nuevo plan
router.post("/", async (req, res) => {
  const { nombre, codigo, id_competencia } = req.body;

  if (!nombre || !codigo || !id_competencia) {
    return res.status(400).send("Todos los campos son obligatorios");
  }

  try {
    const pool = await sql.connect(dbConfig);
    await pool
      .request()
      .input("nombre", sql.VarChar, nombre)
      .input("codigo", sql.VarChar, codigo)
      .input("id_competencia", sql.Int, id_competencia)
      .input("fechaCreacion", sql.DateTime, new Date())
      .query(`
        INSERT INTO Planes (nombre, codigo, id_competencia, fechaCreacion) 
        VALUES (@nombre, @codigo, @id_competencia, @fechaCreacion)
      `);
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

        // Eliminar las asignaturas asociadas al plan
        const deleteAsignaturasResult = await pool.request()
            .input("planId", sql.Int, id)
            .query("DELETE FROM Asignaturas WHERE planId = @planId");

        console.log(`Asignaturas eliminadas: ${deleteAsignaturasResult.rowsAffected[0]}`);

        // Eliminar los pagos asociados al plan
        const deletePagosResult = await pool.request()
            .input("planId", sql.Int, id)
            .query("DELETE FROM Pagos WHERE planId = @planId");

        console.log(`Pagos eliminados: ${deletePagosResult.rowsAffected[0]}`);

        // Eliminar el plan
        const deletePlanResult = await pool.request()
            .input("id", sql.Int, id)
            .query("DELETE FROM Planes WHERE id = @id");

        console.log(`Planes eliminados: ${deletePlanResult.rowsAffected[0]}`);

        if (deletePlanResult.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "El plan no existe o ya fue eliminado" });
        }

        res.status(200).json({ message: "Plan, asignaturas y pagos eliminados exitosamente" });
    } catch (err) {
        console.error("Error al eliminar el plan, asignaturas y pagos:", err.message);
        res.status(500).json({ error: "Error al eliminar el plan, asignaturas y pagos" });
    }
});

module.exports = router;