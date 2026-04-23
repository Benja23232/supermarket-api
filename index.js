import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import bcrypt from 'bcryptjs'
import productsRouter from './src/routes/products.js'
import usersRouter from './src/routes/users.js'
import ordersRouter from './src/routes/orders.js'
import paymentsRouter from './src/routes/payments.js'
import adminRouter from './src/routes/admin.js'
import pool from './src/db.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  req.io = io
  next()
})

app.use('/api/products', productsRouter)
app.use('/api/users', usersRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/payments', paymentsRouter)
app.use('/api/admin', adminRouter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SuperYa API funcionando' })
})

app.get('/api/reset-password', async (req, res) => {
  try {
    const hash = await bcrypt.hash('admin123', 10)
    await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hash, 'benjaarncivia@gmail.com'])
    res.json({ ok: true, message: 'Contraseña reseteada' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id)
  socket.on('join_order', (orderId) => {
    socket.join(`order_${orderId}`)
  })
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id)
  })
})

export { io }

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
})