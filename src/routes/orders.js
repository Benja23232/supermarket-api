import { Router } from 'express'
import { createOrder, getMyOrders, getOrderById, updateOrderStatus } from '../controllers/ordersController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.post('/', authMiddleware, createOrder)
router.get('/', authMiddleware, getMyOrders)
router.get('/:id', authMiddleware, getOrderById)
router.patch('/:id/status', updateOrderStatus)

export default router