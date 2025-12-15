const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM proveedor');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener proveedores');
  }
});

router.post('/', async (req, res) => {
  const { nombre_proveedor, telefono1, telefono2, tipo_suministro } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO proveedor (nombre_proveedor, telefono1, telefono2, tipo_suministro)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [nombre_proveedor, telefono1, telefono2, tipo_suministro]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al crear proveedor');
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre_proveedor, telefono1, telefono2, tipo_suministro } = req.body;
  try {
    const result = await pool.query(
      `UPDATE proveedor SET nombre_proveedor=$1, telefono1=$2, telefono2=$3, tipo_suministro=$4
       WHERE id_proveedor=$5 RETURNING *`,
      [nombre_proveedor, telefono1, telefono2, tipo_suministro, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar proveedor');
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM proveedor WHERE id_proveedor=$1', [id]);
    res.send(`Proveedor ${id} eliminado`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar proveedor');
  }
});

module.exports = router;
