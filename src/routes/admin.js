import { Router } from 'express'
import {
  getAdminStats,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/adminController.js'
import { adminMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/stats', adminMiddleware, getAdminStats)
router.get('/orders', adminMiddleware, getAllOrders)
router.patch('/orders/:id/status', adminMiddleware, updateOrderStatus)
router.get('/users', adminMiddleware, getAllUsers)
router.post('/products', adminMiddleware, createProduct)
router.put('/products/:id', adminMiddleware, updateProduct)
router.delete('/products/:id', adminMiddleware, deleteProduct)

export default router