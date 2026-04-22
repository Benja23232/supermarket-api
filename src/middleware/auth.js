import jwt from 'jsonwebtoken'
import pool from '../db.js'

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token requerido' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.id

    next()
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' })
  }
}

export const adminMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token requerido' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.id

    const result = await pool.query('SELECT role FROM users WHERE id = $1', [decoded.id])
    if (result.rows[0]?.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' })
    }

    next()
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' })
  }
}