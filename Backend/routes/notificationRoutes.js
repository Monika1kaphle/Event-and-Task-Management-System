const express = require('express')
const router = express.Router()
const { loginRequired, attachUser } = require('../middleware/auth')
const db = require('../config/db')

router.use(loginRequired, attachUser)

// GET my notifications
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT mark all as read
router.put('/read-all', async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT mark one as read
router.put('/:id/read', async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router