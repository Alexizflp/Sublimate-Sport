// routes/pagos.js (MEJORADO CON LÓGICA DE ACTUALIZACIÓN DE PEDIDO)

const express = require('express');
const router = express.Router();
const pool = require('../db');

// =========================================================
// POST: CREAR PAGO Y ACTUALIZAR ESTADO DEL PEDIDO (Transaccional)
// =========================================================
router.post('/', async (req, res) => {
    const { fecha_pago, monto, metodo_pago, estado_pago, id_pedido } = req.body;
    
    // Usamos el cliente para iniciar y controlar la transacción
    const client = await pool.connect();

    try {
        // INICIO DE LA TRANSACCIÓN
        await client.query('BEGIN'); 

        // 1. INSERTAR el nuevo PAGO
        const pagoResult = await client.query(
            `INSERT INTO pago (fecha_pago, monto, metodo_pago, estado_pago, id_pedido)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [fecha_pago, monto, metodo_pago, estado_pago, id_pedido]
        );
        const nuevoPago = pagoResult.rows[0];

        // 2. ACTUALIZAR ESTADO DEL PEDIDO ASOCIADO
        // Si el pago es 'Completo', marcamos el pedido como 'Finalizado y Pagado'.
        if (estado_pago === 'Completo') {
             await client.query(
                `UPDATE pedido 
                 SET estado_pedido = 'Finalizado y Pagado' 
                 WHERE id_pedido = $1`, 
                [id_pedido]
            );
        } else if (estado_pago === 'Anticipo') {
             await client.query(
                `UPDATE pedido 
                 SET estado_pedido = 'Pendiente de Saldo' 
                 WHERE id_pedido = $1 AND estado_pedido != 'Finalizado y Pagado'`, 
                [id_pedido]
            );
        }
        
        // COMMIT: Si ambas operaciones fueron exitosas
        await client.query('COMMIT'); 

        res.status(201).json({ 
            mensaje: `Pago registrado. Pedido ${id_pedido} actualizado a ${estado_pago === 'Completo' ? 'Finalizado y Pagado' : 'Pendiente de Saldo'}`,
            pago: nuevoPago
        });

    } catch (err) {
        // ROLLBACK: Si algo falló, se revierten la inserción del pago y la actualización del pedido
        await client.query('ROLLBACK'); 
        console.error('❌ Error fatal en transacción de pago:', err);
        res.status(500).json({ error: 'Error al procesar el pago. Cambios revertidos.', detalles: err.message });
        
    } finally {
        // Liberar la conexión
        client.release();
    }
});


// =========================================================
// GET, PUT y DELETE (Se mantienen como CRUD estándar)
// =========================================================

// GET todos los pagos
router.get('/', async (req, res) => {
    try {
        // Opcional: Podrías hacer un JOIN a la tabla PEDIDO aquí para mostrar el cliente asociado.
        const result = await pool.query('SELECT * FROM pago');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener pagos');
    }
});

// GET pagos por ID de Pedido
router.get('/pedido/:idPedido', async (req, res) => {
    try {
        const { idPedido } = req.params;
        const result = await pool.query('SELECT * FROM pago WHERE id_pedido = $1 ORDER BY fecha_pago DESC', [idPedido]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener pagos del pedido');
    }
});

// PUT actualizar pago (solo si es necesario, sin lógica de estado de pedido compleja)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { fecha_pago, monto, metodo_pago, estado_pago, id_pedido } = req.body;
    try {
        const result = await pool.query(
            `UPDATE pago SET fecha_pago=$1, monto=$2, metodo_pago=$3, estado_pago=$4, id_pedido=$5
             WHERE id_pago=$6 RETURNING *`,
            [fecha_pago, monto, metodo_pago, estado_pago, id_pedido, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).send('Pago no encontrado para actualizar');
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al actualizar pago');
    }
});

// DELETE pago
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM pago WHERE id_pago=$1', [id]);
        res.send(`Pago ${id} eliminado`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al eliminar pago');
    }
});

module.exports = router;