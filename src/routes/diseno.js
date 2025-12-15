const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM diseno');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener diseños');
  }
});

router.post('/', async (req, res) => {
  const { nombre_diseno, formato, descripcion } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO diseno (nombre_diseno, formato, descripcion)
       VALUES ($1,$2,$3) RETURNING *`,
      [nombre_diseno, formato, descripcion]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al crear diseño');
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre_diseno, formato, descripcion } = req.body;
  try {
    const result = await pool.query(
      `UPDATE diseno SET nombre_diseno=$1, formato=$2, descripcion=$3
       WHERE id_diseno=$4 RETURNING *`,
      [nombre_diseno, formato, descripcion, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar diseño');
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM diseno WHERE id_diseno=$1', [id]);
    res.send(`Diseño ${id} eliminado`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar diseño');
  }
});

module.exports = router;
