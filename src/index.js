// index.js
require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());

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
app.use('/empleado', empleadoRoutes);
app.use('/cliente', clienteRoutes);
app.use('/proveedor', proveedorRoutes);
app.use('/producto', productoRoutes);
app.use('/pedido', pedidoRoutes);
app.use('/pago', pagoRoutes);
app.use('/detalle_pedido', detallePedidoRoutes);
app.use('/diseno', disenoRoutes);
app.use('/metodo_impresion', metodoImpresionRoutes);
app.use('/material', materialRoutes);
app.use('/auth', authRoutes);

// 🔹 Ruta base
app.get('/', (req, res) => {
  res.send('🚀 API funcionando correctamente');
});

// 🔹 Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟢 Servidor corriendo en http://localhost:${PORT}`);
});



const pool = require('./db');

pool.query('SELECT NOW()', (err, res) => {
  if(err) return console.error('❌ Error en la prueba de conexión:', err);
  console.log('🟢 Conexión OK, hora del servidor:', res.rows[0]);
});

// index.js
app.get('/check-tables', async (req, res) => {
  try {
    const tables = ['empleado','cliente','proveedor','producto','pedido','pago','detalle_pedido','material','metodo_impresion','diseno'];
    const results = {};

    for (const table of tables) {
      const result = await pool.query(`SELECT * FROM ${table} LIMIT 5`);
      results[table] = result.rows;
    }

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener datos de las tablas');
  }
});
