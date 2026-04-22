import pool from '../db.js'

export const createOrder = async (req, res) => {
  try {
    const { items, address } = req.body
    const userId = req.userId

    // calcular total
    const total = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)

    // crear el pedido
    const orderResult = await pool.query(
      'INSERT INTO orders (user_id, total, address) VALUES ($1, $2, $3) RETURNING *',
      [userId, total, address]
    )

    const order = orderResult.rows[0]

    // insertar cada item del pedido
    for (const item of items) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
        [order.id, item.product_id, item.quantity, item.unit_price]
      )
    }

    res.status(201).json(order)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error creando pedido' })
  }
}

export const getMyOrders = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    )
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error obteniendo pedidos' })
  }
}

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params

    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    )

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' })
    }

    const order = orderResult.rows[0]

    const itemsResult = await pool.query(
      `SELECT oi.*, p.name, p.emoji, p.brand 
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = $1`,
      [id]
    )

    res.json({ ...order, items: itemsResult.rows })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error obteniendo pedido' })
  }
}

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ['pending', 'preparing', 'on_the_way', 'delivered']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' })
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error actualizando pedido' })
  }
}