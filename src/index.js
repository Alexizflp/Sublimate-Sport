// src/index.js

require('dotenv').config();
const express = require('express');
const app = express();
const pool = require('./db'); // 💡 MOVIDO AQUÍ: Conexión a DB debe ir temprano

app.use(express.json());

// 🔹 Prueba de Conexión a PostgreSQL (Se ejecuta al inicio)
pool.query('SELECT NOW()', (err, res) => {
  if(err) return console.error('❌ Error en la prueba de conexión:', err);
  console.log('✅ Conectado a PostgreSQL correctamente');
  console.log('🟢 Conexión OK, hora del servidor:', res.rows[0]);
});

// 🔹 Importar rutas
const empleadoRoutes = require('./routes/empleado');
const clienteRoutes = require('./routes/cliente');
const proveedorRoutes = require('./routes/proveedor');
const productoRoutes = require('./routes/producto');
const pedidoRoutes = require('./routes/pedido');
const pagoRoutes = require('./routes/pago');
const detallePedidoRoutes = require('./routes/detalle_pedido');
const disenoRoutes = require('./routes/diseno');
const metodoImpresionRoutes = require('./routes/metodo_impresion');
const materialRoutes = require('./routes/material');
const authRoutes = require('./routes/auth');

// 🔹 Usar rutas
// (Generalmente es buena práctica agrupar rutas bajo un prefijo /api)
app.use('/api/empleado', empleadoRoutes); 
app.use('/api/cliente', clienteRoutes);
app.use('/api/proveedor', proveedorRoutes);
app.use('/api/producto', productoRoutes);
app.use('/api/pedido', pedidoRoutes);
app.use('/api/pago', pagoRoutes);
app.use('/api/detalle_pedido', detallePedidoRoutes);
app.use('/api/diseno', disenoRoutes);
app.use('/api/metodo_impresion', metodoImpresionRoutes);
app.use('/api/material', materialRoutes);
app.use('/api/auth', authRoutes);

// 🔹 Ruta base
app.get('/', (req, res) => {
  res.send('🚀 API funcionando correctamente');
});

// 🔹 Ruta de Diagnóstico (Checkeo de Tablas)
app.get('/api/check-tables', async (req, res) => {
  try {
    const tables = ['empleado','cliente','proveedor','producto','pedido','pago','detalle_pedido','material','metodo_impresion','diseno'];
    const results = {};

    for (const table of tables) {
      const result = await pool.query(`SELECT * FROM ${table} LIMIT 5`);
      results[table] = result.rows;
    }

    res.json(results);
  } catch (err) {
    console.error('Error al chequear tablas:', err);
    res.status(500).send('Error al obtener datos de las tablas');
  }
});

// 🔹 Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟢 Servidor corriendo en el puerto ${PORT}`);
});