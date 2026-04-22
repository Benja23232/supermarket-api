import { Router } from 'express'
import { createPreference, webhook } from '../controllers/paymentsController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.post('/create-preference', authMiddleware, createPreference)
router.post('/webhook', webhook)

export default router