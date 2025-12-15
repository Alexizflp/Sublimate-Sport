const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET todos los detalles
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM detalle_pedido');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener detalles de pedidos');
  }
});

// POST crear detalle
router.post('/', async (req, res) => {
  const { talla, cantidad, id_pedido, id_producto, id_metodo, id_diseno } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO detalle_pedido (talla, cantidad, id_pedido, id_producto, id_metodo, id_diseno)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [talla, cantidad, id_pedido, id_producto, id_metodo, id_diseno]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al crear detalle de pedido');
  }
});

// PUT actualizar detalle
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { talla, cantidad, id_pedido, id_producto, id_metodo, id_diseno } = req.body;
  try {
    const result = await pool.query(
      `UPDATE detalle_pedido SET talla=$1, cantidad=$2, id_pedido=$3, id_producto=$4, id_metodo=$5, id_diseno=$6
       WHERE id_detalle=$7 RETURNING *`,
      [talla, cantidad, id_pedido, id_producto, id_metodo, id_diseno, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar detalle de pedido');
  }
});

// DELETE detalle
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM detalle_pedido WHERE id_detalle=$1', [id]);
    res.send(`Detalle de pedido ${id} eliminado`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar detalle de pedido');
  }
});

module.exports = router;
