const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET todos los empleados
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM empleado');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener empleados');
  }
});

// POST crear empleado
router.post('/', async (req, res) => {
  const { nombre, apellido, rol, telefono1, telefono2, usuario_login, contrasena_hash } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO empleado (nombre, apellido, rol, telefono1, telefono2, usuario_login, contrasena_hash)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [nombre, apellido, rol, telefono1, telefono2, usuario_login, contrasena_hash]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al crear empleado');
  }
});

// PUT actualizar empleado
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, rol, telefono1, telefono2, usuario_login, contrasena_hash } = req.body;
  try {
    const result = await pool.query(
      `UPDATE empleado SET nombre=$1, apellido=$2, rol=$3, telefono1=$4, telefono2=$5, usuario_login=$6, contrasena_hash=$7
       WHERE id_empleado=$8 RETURNING *`,
      [nombre, apellido, rol, telefono1, telefono2, usuario_login, contrasena_hash, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar empleado');
  }
});

// DELETE empleado
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM empleado WHERE id_empleado=$1', [id]);
    res.send(`Empleado ${id} eliminado`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar empleado');
  }
});

module.exports = router;
