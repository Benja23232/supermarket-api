import { Router } from 'express'
import { getProducts, getProductById, createProduct } from '../controllers/productsController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/', getProducts)
router.get('/:id', getProductById)
router.post('/', authMiddleware, createProduct)

export default router