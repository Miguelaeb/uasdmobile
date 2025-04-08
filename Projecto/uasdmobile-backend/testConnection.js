const sql = require("mssql");

const dbConfig = {
    user: "sa", // Usuario de tu base de datos
    password: "1234567", // Contraseña de tu base de datos
    server: "_PC_VARGAS_", // Nombre de tu servidor (sin \\SQLEXPRESS)
    database: "uasdmobile", // Nombre de tu base de datos
    options: {
        encrypt: false, // Desactiva el cifrado si no es necesario
        trustServerCertificate: true, // Permitir certificados no firmados
    },
    port: 1433, // Puerto configurado en SQL Server
    connectionTimeout: 30000, // Aumenta el tiempo de espera a 30 segundos
};

async function testConnection() {
    try {
        console.log("Intentando conectar con la base de datos...");
        const pool = await sql.connect(dbConfig);
        console.log("Conexión exitosa a SQL Server");

        // Ejecutar una consulta de prueba
        const result = await pool.request().query("SELECT 1 AS Resultado");
        console.log("Resultado de la consulta:", result.recordset);

        pool.close();
    } catch (err) {
        console.error("Error al conectar a SQL Server:", err.message);
    }
}

testConnection();