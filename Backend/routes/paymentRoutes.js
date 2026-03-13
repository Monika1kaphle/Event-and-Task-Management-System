const express = require('express')
const router = express.Router()
const { loginRequired } = require('../middleware/auth')
const db = require('../config/db')
const axios = require('axios')
const crypto = require('crypto')

// ── KHALTI ──────────────────────────────────────────────────────────────────

router.post('/khalti/initiate', loginRequired, async (req, res) => {
  const { eventId, amount, eventName } = req.body
  const userId = req.user.id

  try {
    const response = await axios.post(
      'https://dev.khalti.com/api/v2/epayment/initiate/', // sandbox URL
      {
        return_url: 'http://localhost:5173/payment/success',
        website_url: 'http://localhost:5173',
        amount: amount, // in paisa (Rs.1 = 100 paisa)
        purchase_order_id: `EVENT-${eventId}-USER-${userId}-${Date.now()}`,
        purchase_order_name: eventName,
        customer_info: {
          name: req.user.name || 'Customer',
          email: req.user.email || 'customer@example.com',
        },
      },
      {
        headers: {
          Authorization: `Key YOUR_KHALTI_SECRET_KEY`, // 🔑 replace with your Khalti test key
          'Content-Type': 'application/json',
        },
      }
    )
    res.json({ payment_url: response.data.payment_url })
  } catch (err) {
    console.error('Khalti initiate error:', err.response?.data || err.message)
    res.status(500).json({ error: 'Khalti payment initiation failed' })
  }
})

// ── KHALTI VERIFY ────────────────────────────────────────────────────────────

router.post('/khalti/verify', loginRequired, async (req, res) => {
  const { pidx, eventId } = req.body

  if (!pidx || !eventId) {
    return res.status(400).json({ error: 'pidx and eventId are required' })
  }

  try {
    const response = await axios.post(
      'https://dev.khalti.com/api/v2/epayment/lookup/',
      { pidx },
      {
        headers: {
          Authorization: `Key YOUR_KHALTI_SECRET_KEY`, // 🔑 replace with your Khalti test key
          'Content-Type': 'application/json',
        },
      }
    )

    if (response.data.status === 'Completed') {
      // Check if already booked to avoid duplicate
      const [existing] = await db.query(
        'SELECT id FROM bookings WHERE user_id = ? AND event_id = ?',
        [req.user.id, eventId]
      )
      if (existing.length > 0) {
        return res.json({ success: true, message: 'Already booked!' })
      }

      await db.query(
        'INSERT INTO bookings (user_id, event_id, booking_date) VALUES (?, ?, NOW())',
        [req.user.id, eventId]
      )
      res.json({ success: true, message: 'Booking confirmed via Khalti!' })
    } else {
      res.status(400).json({ error: `Payment status: ${response.data.status}` })
    }
  } catch (err) {
    console.error('Khalti verify error:', err.response?.data || err.message)
    res.status(500).json({ error: 'Khalti payment verification failed' })
  }
})

// ── ESEWA INITIATE ───────────────────────────────────────────────────────────

router.post('/esewa/initiate', loginRequired, async (req, res) => {
  const { eventId, amount } = req.body

  const transactionId = `EVENT-${eventId}-USER-${req.user.id}-${Date.now()}`
  const totalAmount = String(amount)
  const productCode = 'EPAYTEST' // sandbox merchant code

  // ✅ eSewa sandbox secret key (official public sandbox key from eSewa docs)
  const secretKey = '8gBm/:&EnhH.1/q'

  // ✅ Message must follow EXACT order: total_amount, transaction_uuid, product_code
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionId},product_code=${productCode}`

  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(message)
    .digest('base64')

  res.json({
    fields: {
      amount: totalAmount,
      tax_amount: '0',
      total_amount: totalAmount,
      transaction_uuid: transactionId,
      product_code: productCode,
      product_service_charge: '0',
      product_delivery_charge: '0',
      success_url: 'http://localhost:5173/payment/success',
      failure_url: 'http://localhost:5173/payment/failure',
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      signature: signature,
    },
  })
})

// ── ESEWA VERIFY ─────────────────────────────────────────────────────────────

router.post('/esewa/verify', loginRequired, async (req, res) => {
  const { transaction_uuid, total_amount, eventId } = req.body

  if (!transaction_uuid || !total_amount || !eventId) {
    return res.status(400).json({ error: 'transaction_uuid, total_amount and eventId are required' })
  }

  try {
    const response = await axios.get(
      'https://rc.esewa.com.np/api/epay/transaction/status/',
      {
        params: {
          product_code: 'EPAYTEST',
          total_amount: total_amount,
          transaction_uuid: transaction_uuid,
        },
      }
    )

    console.log('eSewa verify response:', response.data)

    if (response.data.status === 'COMPLETE') {
      // Check if already booked to avoid duplicate
      const [existing] = await db.query(
        'SELECT id FROM bookings WHERE user_id = ? AND event_id = ?',
        [req.user.id, eventId]
      )
      if (existing.length > 0) {
        return res.json({ success: true, message: 'Already booked!' })
      }

      await db.query(
        'INSERT INTO bookings (user_id, event_id, booking_date) VALUES (?, ?, NOW())',
        [req.user.id, eventId]
      )
      res.json({ success: true, message: 'Booking confirmed via eSewa!' })
    } else {
      res.status(400).json({ error: `Payment not complete. Status: ${response.data.status}` })
    }
  } catch (err) {
    console.error('eSewa verify error:', err.response?.data || err.message)
    res.status(500).json({ error: 'eSewa payment verification failed' })
  }
})

module.exports = router