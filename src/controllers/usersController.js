import pool from '../db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body

    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await pool.query(
      'INSERT INTO users (name, email, password, phone, address) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, address',
      [name, email, hashedPassword, phone, address]
    )

    const user = result.rows[0]
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.status(201).json({ user, token })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error registrando usuario' })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Email o contraseña incorrectos' })
    }

    const user = result.rows[0]
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(400).json({ error: 'Email o contraseña incorrectos' })
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.json({
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, address: user.address },
      token
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error iniciando sesión' })
  }
}

export const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, address, created_at FROM users WHERE id = $1',
      [req.userId]
    )
    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error obteniendo perfil' })
  }
}