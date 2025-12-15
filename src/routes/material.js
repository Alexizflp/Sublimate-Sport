const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM material');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener materiales');
  }
});

router.post('/', async (req, res) => {
  const { nombre_material, descripcion, stock, unidad_medida, costo_unitario, id_proveedor } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO material (nombre_material, descripcion, stock, unidad_medida, costo_unitario, id_proveedor)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [nombre_material, descripcion, stock, unidad_medida, costo_unitario, id_proveedor]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al crear material');
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre_material, descripcion, stock, unidad_medida, costo_unitario, id_proveedor } = req.body;
  try {
    const result = await pool.query(
      `UPDATE material SET nombre_material=$1, descripcion=$2, stock=$3, unidad_medida=$4, costo_unitario=$5, id_proveedor=$6
       WHERE id_material=$7 RETURNING *`,
      [nombre_material, descripcion, stock, unidad_medida, costo_unitario, id_proveedor, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar material');
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM material WHERE id_material=$1', [id]);
    res.send(`Material ${id} eliminado`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar material');
  }
});

module.exports = router;
