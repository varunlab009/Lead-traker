import { Router } from 'express'
import bcrypt from 'bcryptjs'
import sql from '../lib/db.js'
import { signToken } from '../lib/token.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' })

  try {
    const [user] = await sql`
      SELECT * FROM users WHERE email = ${email} AND is_active = true
    `
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).json({ error: 'Invalid credentials' })

    await sql`UPDATE users SET last_login = now() WHERE id = ${user.id}`

    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name })
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/me', requireAuth, async (req, res) => {
  try {
    const [user] = await sql`
      SELECT id, name, email, role, created_at FROM users WHERE id = ${req.user.id}
    `
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/logout', requireAuth, (req, res) => {
  res.json({ message: 'Logged out' })
})

export default router
