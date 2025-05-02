const express = require("express");
const sql = require("mssql");
const dbConfig = require("../config/dbConfig");

const router = express.Router();

// Ruta: Obtener todas las competencias
router.get("/", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query("SELECT id, nombre, descripcion FROM Competencias");
    res.json(result.recordset);
  } catch (err) {
    console.error("Error al obtener competencias:", err.message);
    res.status(500).send("Error al obtener competencias");
  }
});

// Ruta: Crear una nueva competencia
router.post("/", async (req, res) => {
  const { nombre, descripcion } = req.body;

  if (!nombre || !descripcion) {
    return res.status(400).send("Todos los campos son obligatorios");
  }

  try {
    const pool = await sql.connect(dbConfig);
    await pool
      .request()
      .input("nombre", sql.VarChar, nombre)
      .input("descripcion", sql.VarChar, descripcion)
      .query("INSERT INTO Competencias (nombre, descripcion) VALUES (@nombre, @descripcion)");
    res.send("Competencia agregada correctamente");
  } catch (err) {
    console.error("Error al agregar competencia:", err.message);
    res.status(500).send("Error al agregar competencia");
  }
});

// Ruta: Eliminar una competencia por ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await sql.connect(dbConfig);
    await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Competencias WHERE id = @id");
    res.send("Competencia eliminada correctamente");
  } catch (err) {
    console.error("Error al eliminar competencia:", err.message);
    res.status(500).send("Error al eliminar competencia");
  }
});

module.exports = router;