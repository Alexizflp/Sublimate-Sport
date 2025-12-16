const express = require('express');
const pool = require('../db');
const router = express.Router();
// const bcrypt = require('bcryptjs'); // Descomentar si usas encriptación real
const jwt = require('jsonwebtoken');

// Clave secreta para JWT (Debería estar en .env)
const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_super_seguro';

// ----------------------------
// LOGIN EMPLEADO
// ----------------------------
router.post('/login', async (req, res) => {
  const { usuario_login, contrasena } = req.body;
  
  console.log(`[AUTH] Intento de login para: ${usuario_login}`); // Log para depuración

  if (!usuario_login || !contrasena) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM empleado WHERE usuario_login=$1',
      [usuario_login]
    );

    if (result.rows.length === 0) {
        console.log(`[AUTH] Usuario no encontrado: ${usuario_login}`);
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const empleado = result.rows[0];

    // VERIFICACIÓN DE CONTRASEÑA (Texto Plano para pruebas)
    // Nota: Si en la DB dice 'hash1234', la contraseña es 'hash1234'
    if (empleado.contrasena_hash !== contrasena) {
      console.log(`[AUTH] Contraseña incorrecta para: ${usuario_login}`);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar Token JWT
    const token = jwt.sign(
        { 
            id: empleado.id_empleado, 
            rol: empleado.rol,
            nombre: empleado.nombre 
        },
        JWT_SECRET,
        { expiresIn: '8h' }
    );

    console.log(`[AUTH] Login exitoso para: ${usuario_login} (${empleado.rol})`);

    res.json({
      mensaje: 'Login exitoso',
      token: token, // Enviamos el token al frontend
      empleado: {
        id_empleado: empleado.id_empleado,
        nombre: empleado.nombre,
        apellido: empleado.apellido,
        rol: empleado.rol
      }
    });

  } catch (err) {
    console.error('❌ Error en login empleado:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;