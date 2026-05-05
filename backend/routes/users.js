import { Router } from 'express'
import bcrypt from 'bcryptjs'
import sql from '../lib/db.js'
import { requireAuth } from '../middleware/auth.js'
import { requireRole } from '../middleware/role.js'

const router = Router()
router.use(requireAuth, requireRole('admin'))

router.get('/', async (req, res) => {
  try {
    const users = await sql`
      SELECT u.id, u.name, u.email, u.role, u.is_active, u.last_login, u.created_at,
        COUNT(l.id) FILTER (WHERE l.assigned_to = u.id) as assigned_leads,
        COUNT(l.id) FILTER (WHERE l.assigned_to = u.id AND l.status = 'converted') as converted_leads
      FROM users u
      LEFT JOIN leads l ON l.assigned_to = u.id
      GROUP BY u.id
      ORDER BY u.created_at ASC
    `
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/', async (req, res) => {
  const { name, email, password, role = 'user' } = req.body
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password required' })

  try {
    const password_hash = await bcrypt.hash(password, 10)
    const [user] = await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${name}, ${email}, ${password_hash}, ${role})
      RETURNING id, name, email, role, created_at
    `
    res.status(201).json(user)
  } catch (err) {
    if (err.message?.includes('unique')) {
      return res.status(409).json({ error: 'Email already exists' })
    }
    res.status(500).json({ error: 'Server error' })
  }
})

router.patch('/:id', async (req, res) => {
  const { name, email, role } = req.body
  try {
    const [user] = await sql`
      UPDATE users SET name = ${name}, email = ${email}, role = ${role}
      WHERE id = ${req.params.id}
      RETURNING id, name, email, role, is_active
    `
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await sql`UPDATE users SET is_active = false WHERE id = ${req.params.id}`
    res.json({ message: 'User deactivated' })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/:id/stats', async (req, res) => {
  try {
    const [stats] = await sql`
      SELECT
        COUNT(*) FILTER (WHERE assigned_to = ${req.params.id}) as total_assigned,
        COUNT(*) FILTER (WHERE assigned_to = ${req.params.id} AND status = 'converted') as converted,
        COUNT(*) FILTER (WHERE assigned_to = ${req.params.id} AND status = 'lost') as lost,
        COUNT(*) FILTER (WHERE assigned_to = ${req.params.id} AND status = 'follow_up') as in_progress
      FROM leads
    `
    res.json(stats)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
