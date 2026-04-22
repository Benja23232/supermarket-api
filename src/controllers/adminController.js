import pool from '../db.js'

export const getAdminStats = async (req, res) => {
  try {
    const orders = await pool.query('SELECT COUNT(*) FROM orders')
    const users = await pool.query('SELECT COUNT(*) FROM users')
    const products = await pool.query('SELECT COUNT(*) FROM products')
    const revenue = await pool.query("SELECT SUM(total) FROM orders WHERE status != 'pending'")

    res.json({
      orders: Number(orders.rows[0].count),
      users: Number(users.rows[0].count),
      products: Number(products.rows[0].count),
      revenue: Number(revenue.rows[0].sum || 0),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error obteniendo estadísticas' })
  }
}

export const getAllOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, u.name as user_name, u.email as user_email
      FROM orders o
      JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC
    `)
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error obteniendo pedidos' })
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

    req.io.to(`order_${id}`).emit('order_status_updated', {
      orderId: id,
      status,
    })

    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error actualizando pedido' })
  }
}

export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, address, role, created_at FROM users ORDER BY created_at DESC'
    )
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error obteniendo usuarios' })
  }
}

export const createProduct = async (req, res) => {
  try {
    const { category_id, name, brand, price, emoji, stock } = req.body
    const result = await pool.query(
      'INSERT INTO products (category_id, name, brand, price, emoji, stock) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [category_id, name, brand, price, emoji, stock]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error creando producto' })
  }
}

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params
    const { category_id, name, brand, price, emoji, stock } = req.body
    const result = await pool.query(
      'UPDATE products SET category_id=$1, name=$2, brand=$3, price=$4, emoji=$5, stock=$6 WHERE id=$7 RETURNING *',
      [category_id, name, brand, price, emoji, stock, id]
    )
    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error actualizando producto' })
  }
}

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params
    await pool.query('DELETE FROM products WHERE id = $1', [id])
    res.json({ message: 'Producto eliminado' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error eliminando producto' })
  }
}