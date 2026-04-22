import { MercadoPagoConfig, Preference } from 'mercadopago'
import pool from '../db.js'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
})

export const createPreference = async (req, res) => {
  try {
    const { items, order_id } = req.body

    const preference = new Preference(client)

    const result = await preference.create({
      body: {
        items: items.map((item) => ({
          title: item.name,
          quantity: item.quantity,
          unit_price: Number(item.unit_price),
          currency_id: 'ARS',
        })),
        back_urls: {
          success: 'http://localhost:5173/tracking?status=success',
          failure: 'http://localhost:5173/cart?status=failure',
          pending: 'http://localhost:5173/tracking?status=pending',
        },
        external_reference: String(order_id),
        notification_url: 'http://localhost:3001/api/payments/webhook',
      },
    })

    res.json({
      init_point: result.init_point,
      preference_id: result.id,
    })
  } catch (error) {
    console.error('Error creando preferencia MP:', error)
    res.status(500).json({ error: 'Error creando preferencia de pago' })
  }
}

export const webhook = async (req, res) => {
  try {
    const { type, data } = req.body

    if (type === 'payment') {
      const paymentId = data.id

      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          },
        }
      )

      const payment = await response.json()

      if (payment.status === 'approved') {
        const orderId = payment.external_reference
        await pool.query(
          'UPDATE orders SET status = $1 WHERE id = $2',
          ['preparing', orderId]
        )
      }
    }

    res.sendStatus(200)
  } catch (error) {
    console.error('Error en webhook:', error)
    res.sendStatus(500)
  }
}