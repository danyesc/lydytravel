const mysql = require('mysql2'); // Importar la librería mysql2
require('dotenv').config();

// Crear la conexión a la base de datos utilizando un pool
const db = mysql.createPool({
  host: process.env.DB_HOST,      // Host de la base de datos
  user: process.env.DB_USER,      // Usuario
  password: process.env.DB_PASSWORD, // Contraseña
  database: process.env.DB_NAME,  // Nombre de la base de datos
  waitForConnections: true,       // Esperar conexiones cuando el pool esté lleno
  connectionLimit: 10,            // Número máximo de conexiones
  queueLimit: 0,                  // Tamaño máximo de la cola
  charset: 'utf8mb4'
});

// Probar la conexión a la base de datos
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err.message);
  } else {
    console.log('Conexión exitosa a la base de datos');
    connection.release(); // Liberar la conexión después de probar
  }
});

// Exportar la conexión para usarla en otros archivos
module.exports = db;

