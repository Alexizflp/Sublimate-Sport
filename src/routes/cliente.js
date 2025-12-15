const express = require('express');
const router = express.Router();
const pool = require('../db');

// =========================================================
// GET: Obtener todos los clientes
// =========================================================
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM cliente ORDER BY nombre ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('❌ Error al obtener clientes:', err);
        res.status(500).json({ error: 'Error interno del servidor al obtener clientes' });
    }
});

// =========================================================
// POST: Crear un nuevo cliente
// =========================================================
router.post('/', async (req, res) => {
    // Nota: Se asume que el Frontend enviará fecha_registro o que la DB la genera por defecto.
    const { nombre, apellido, telefono1, telefono2, correo, tipo_cliente, fecha_registro } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO cliente (nombre, apellido, telefono1, telefono2, correo, tipo_cliente, fecha_registro)
             VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
            [nombre, apellido, telefono1, telefono2, correo, tipo_cliente, fecha_registro]
        );
        res.status(201).json(result.rows[0]); // Código 201 Created para una nueva creación
    } catch (err) {
        console.error('❌ Error al crear cliente:', err.stack);
        res.status(400).json({ error: 'Error al crear cliente. Verifique los datos enviados.' });
    }
});

// =========================================================
// PUT: Actualizar cliente (MEJORADO con manejo de 404)
// =========================================================
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, telefono1, telefono2, correo, tipo_cliente, fecha_registro } = req.body;
    try {
        const result = await pool.query(
            `UPDATE cliente SET nombre=$1, apellido=$2, telefono1=$3, telefono2=$4, correo=$5, tipo_cliente=$6, fecha_registro=$7
             WHERE id_cliente=$8 RETURNING *`,
            [nombre, apellido, telefono1, telefono2, correo, tipo_cliente, fecha_registro, id]
        );
        
        // Si no se actualizó ninguna fila, el ID no existe
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado. ID incorrecto.' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('❌ Error al actualizar cliente:', err.stack);
        res.status(500).json({ error: 'Error interno del servidor al actualizar.' });
    }
});

// =========================================================
// DELETE: Eliminar cliente (MEJORADO con manejo de 404)
// =========================================================
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM cliente WHERE id_cliente=$1 RETURNING id_cliente', [id]);
        
        // Si no se eliminó ninguna fila, el ID no existe
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado para eliminar.' });
        }
        
        res.json({ mensaje: `Cliente con ID ${id} eliminado correctamente.` });
    } catch (err) {
        console.error('❌ Error al eliminar cliente:', err.stack);
        // Sugerencia: Si falla por llave foránea (el cliente tiene pedidos), se usa 409 Conflict
        res.status(409).json({ error: 'No se puede eliminar. El cliente tiene pedidos asociados.' });
    }
});

module.exports = router;