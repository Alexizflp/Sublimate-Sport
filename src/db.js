// db.js
const { Pool } = require('pg');
require('dotenv').config(); // cargar .env

// Validar variables de entorno
const requiredVars = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASS', 'DB_PORT'];
for (const v of requiredVars) {
  if (!process.env[v]) {
    console.error(`❌ ERROR: Falta la variable de entorno ${v}`);
    process.exit(1); // sale del proceso si falta algo
  }
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

pool.on('connect', () => console.log('✅ Conectado a PostgreSQL correctamente'));
pool.on('error', (err) => console.error('❌ Error en la conexión:', err));

module.exports = pool;





