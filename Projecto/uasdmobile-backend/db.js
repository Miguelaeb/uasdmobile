const sql = require("mssql");

// Configuración de la base de datos
const dbConfig = {
    user: "sa", // Usuario de tu base de datos
    password: "1234567", // Contraseña de tu base de datos
    server: "_PC_VARGAS_", // Nombre de tu servidor (sin \\SQLEXPRESS si no es necesario)
    database: "uasdmobile", // Nombre de tu base de datos
    options: {
        encrypt: false, // Desactiva el cifrado si no es necesario
        trustServerCertificate: true, // Permitir certificados no firmados
    },
    port: 1433, // Puerto configurado en SQL Server
};

// Crear una conexión al pool
const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then((pool) => {
        console.log("Conexión a SQL Server exitosa");
        return pool;
    })
    .catch((err) => {
        console.error("Error al conectar a SQL Server:", err.message);
    });

module.exports = {
    sql,
    poolPromise,
};