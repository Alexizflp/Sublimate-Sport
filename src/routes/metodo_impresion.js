const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM metodo_impresion');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener métodos de impresión');
  }
});

router.post('/', async (req, res) => {
  const { nombre_metodo, descripcion, restriccion_material } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO metodo_impresion (nombre_metodo, descripcion, restriccion_material)
       VALUES ($1,$2,$3) RETURNING *`,
      [nombre_metodo, descripcion, restriccion_material]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al crear método de impresión');
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre_metodo, descripcion, restriccion_material } = req.body;
  try {
    const result = await pool.query(
      `UPDATE metodo_impresion SET nombre_metodo=$1, descripcion=$2, restriccion_material=$3
       WHERE id_metodo=$4 RETURNING *`,
      [nombre_metodo, descripcion, restriccion_material, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar método de impresión');
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM metodo_impresion WHERE id_metodo=$1', [id]);
    res.send(`Método de impresión ${id} eliminado`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar método de impresión');
  }
});

module.exports = router;
