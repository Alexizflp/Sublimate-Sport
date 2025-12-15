// routes/pedidos.js

const express = require('express');
const router = express.Router();
// Asume que db.js está en el directorio superior (ej. '../db')
const pool = require('../db'); 

// =========================================================
// RUTA MEJORADA: GET todos los pedidos con JOINs (Mejora #2)
// Proporciona el nombre de Cliente y Empleado para el Frontend.
// =========================================================
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                p.id_pedido, 
                p.fecha_pedido, 
                p.estado_pedido, 
                p.total, 
                -- Información del Cliente
                c.nombre AS nombre_cliente,
                c.telefono1 AS telefono_cliente,
                -- Información del Empleado
                e.nombre AS nombre_empleado,
                e.rol AS rol_empleado
            FROM pedido p
            JOIN cliente c ON p.id_cliente = c.id_cliente
            JOIN empleado e ON p.id_empleado = e.id_empleado
            ORDER BY p.fecha_pedido DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('❌ Error al obtener pedidos con detalles:', err);
        res.status(500).send('Error al obtener pedidos');
    }
});


// =========================================================================================
// RUTA MEJORADA: POST para crear un Pedido (Transaccional y Stock Update) - CRÍTICO (Mejoras #1 y #3)
// =========================================================================================
router.post('/', async (req, res) => {
    // Nota: El Frontend debe enviar el pedido principal y una lista de detalles en req.body.detalles
    const { fecha_pedido, estado_pedido, total, id_cliente, id_empleado, detalles } = req.body;
    
    // Usamos el cliente para iniciar y controlar la transacción
    const client = await pool.connect(); 

    try {
        // INICIO DE LA TRANSACCIÓN (Punto de no retorno, se revierte si falla)
        await client.query('BEGIN'); 

        // 1. INSERTAR el PEDIDO MAESTRO
        const pedidoResult = await client.query(
            `INSERT INTO pedido (fecha_pedido, estado_pedido, total, id_cliente, id_empleado)
             VALUES ($1, $2, $3, $4, $5) RETURNING id_pedido`,
            [fecha_pedido, estado_pedido, total, id_cliente, id_empleado]
        );
        const nuevoIdPedido = pedidoResult.rows[0].id_pedido;

        // 2. PROCESAR CADA DETALLE, INSERTAR Y ACTUALIZAR STOCK
        for (const detalle of detalles) {
            const { talla, cantidad, id_producto, id_metodo, id_diseno } = detalle;
            
            // 2.1. Insertar el Detalle del Pedido
            await client.query(
                `INSERT INTO detalle_pedido (talla, cantidad, id_pedido, id_producto, id_metodo, id_diseno)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [talla, cantidad, nuevoIdPedido, id_producto, id_metodo, id_diseno]
            );

            // 2.2. Obtener el id_material asociado al id_producto
            const materialResult = await client.query(
                'SELECT id_material FROM producto WHERE id_producto = $1', 
                [id_producto]
            );
            const idMaterial = materialResult.rows[0]?.id_material;

            if (idMaterial) {
                // 2.3. Descontamos la cantidad del stock (Asumimos que 1 producto consume la cantidad de material)
                await client.query(
                    'UPDATE material SET stock = stock - ($1) WHERE id_material = $2',
                    [cantidad, idMaterial] 
                );
            }
        }

        // FIN DE LA TRANSACCIÓN: Todo salió bien, confirmamos todos los cambios
        await client.query('COMMIT'); 

        res.status(201).json({ 
            mensaje: 'Pedido, detalles y stock actualizados exitosamente (Transacción completada).',
            id_pedido: nuevoIdPedido
        });

    } catch (err) {
        // ERROR: Si algo falló en cualquier paso, revertimos todos los cambios
        await client.query('ROLLBACK'); 
        console.error('❌ Error fatal en transacción de pedido:', err);
        res.status(500).json({ error: 'Error al procesar el pedido. Cambios revertidos.', detalles: err.message });
        
    } finally {
        // Siempre liberamos la conexión al pool
        client.release();
    }
});


// =========================================================
// RUTAS CRUD ESTÁNDAR (Mantenidas)
// =========================================================

// GET Pedido por ID (simple)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM pedido WHERE id_pedido = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).send('Pedido no encontrado');
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener pedido');
    }
});

// PUT para actualizar un Pedido (simple, sin tocar detalles)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { estado_pedido, total } = req.body; 
        const result = await pool.query(
            'UPDATE pedido SET estado_pedido = $1, total = $2 WHERE id_pedido = $3 RETURNING *',
            [estado_pedido, total, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).send('Pedido no encontrado para actualizar');
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al actualizar pedido');
    }
});

// DELETE de un Pedido (simple)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // NOTA: Se asume que la base de datos (PostgreSQL) manejará la eliminación en cascada de detalle_pedido.
        await pool.query('DELETE FROM pedido WHERE id_pedido = $1', [id]);
        res.send(`Pedido con ID ${id} eliminado correctamente`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al eliminar pedido');
    }
});

module.exports = router;