const express = require("express");
const asignaturasRoutes = require("./routes/asignaturas");
const planesRoutes = require("./routes/planes");
const personalRoutes = require("./routes/personal");

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/asignaturas", asignaturasRoutes);
app.use("/planes", planesRoutes);
app.use("/personal", personalRoutes);

module.exports = app;