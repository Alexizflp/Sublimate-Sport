const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM producto');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener productos');
  }
});

router.post('/', async (req, res) => {
  const { nombre_producto, categoria, precio_base, id_material } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO producto (nombre_producto, categoria, precio_base, id_material)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [nombre_producto, categoria, precio_base, id_material]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al crear producto');
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre_producto, categoria, precio_base, id_material } = req.body;
  try {
    const result = await pool.query(
      `UPDATE producto SET nombre_producto=$1, categoria=$2, precio_base=$3, id_material=$4
       WHERE id_producto=$5 RETURNING *`,
      [nombre_producto, categoria, precio_base, id_material, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar producto');
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM producto WHERE id_producto=$1', [id]);
    res.send(`Producto ${id} eliminado`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar producto');
  }
});

module.exports = router;
