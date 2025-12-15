// src/routes/auth.js
const express = require('express');
const pool = require('../db');
const router = express.Router();
// 💡 CORRECCIÓN CRÍTICA: Usamos 'bcryptjs' en lugar de 'bcrypt' para evitar errores de compilación en Railway.
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');


// ----------------------------
// LOGIN EMPLEADO
// ----------------------------
router.post('/login', async (req, res) => {
  const { usuario_login, contrasena } = req.body;
  if (!usuario_login || !contrasena) return res.status(400).json({ error: 'Usuario y contraseña requeridos' });

  try {
    const result = await pool.query(
      'SELECT * FROM empleado WHERE usuario_login=$1',
      [usuario_login]
    );

    if (result.rows.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });

    const empleado = result.rows[0];

    // NOTA IMPORTANTE: Actualmente, tu código usa contraseñas en texto plano.
    // Usaremos la comprobación simple (texto plano) por ahora.
    if (empleado.contrasena_hash !== contrasena) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Si decides usar la encriptación REAL (bcrypt), descomenta estas líneas y comenta las de arriba:
    /*
    const match = await bcrypt.compare(contrasena, empleado.contrasena_hash);
    if (!match) return res.status(401).json({ error: 'Contraseña incorrecta' });
    */

    res.json({
      mensaje: 'Login exitoso',
      empleado: {
        id: empleado.id_empleado,
        nombre: empleado.nombre,
        apellido: empleado.apellido,
        rol: empleado.rol
      }
    });

  } catch (err) {
    console.error('❌ Error en login empleado:', err);
    res.status(500).json({ error: 'Error en la base de datos' });
  }
});

// ----------------------------
// CAMBIAR CONTRASEÑA
// ----------------------------
router.put('/cambiar-contrasena/:id', async (req, res) => {
  const { id } = req.params;
  const { nueva_contrasena } = req.body;

  if (!nueva_contrasena) return res.status(400).json({ error: 'Nueva contraseña requerida' });

  try {
    // Si quieres hashear la contraseña con bcrypt (Recomendado):
    // const hash = await bcrypt.hash(nueva_contrasena, 10);
    // await pool.query('UPDATE empleado SET contrasena_hash=$1 WHERE id_empleado=$2', [hash, id]);

    // Usando texto plano (menos seguro, pero coincide con el resto de tu código actual)
    await pool.query('UPDATE empleado SET contrasena_hash=$1 WHERE id_empleado=$2', [nueva_contrasena, id]);

    res.json({ mensaje: 'Contraseña actualizada correctamente' });

  } catch (err) {
    console.error('❌ Error cambiando contraseña:', err);
    res.status(500).json({ error: 'Error en la base de datos' });
  }
});

module.exports = router;