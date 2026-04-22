import pool from '../db.js'

export const getProducts = async (req, res) => {
  try {
    const { category_id } = req.query
    let query = 'SELECT * FROM products'
    let params = []

    if (category_id && category_id !== 'null' && category_id !== 'undefined') {
      query += ' WHERE category_id = $1'
      params = [category_id]
    }

    query += ' ORDER BY name ASC'

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error obteniendo productos' })
  }
}

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error obteniendo producto' })
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