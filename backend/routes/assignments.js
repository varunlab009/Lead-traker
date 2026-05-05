import { Router } from 'express'
import sql from '../lib/db.js'
import { requireAuth } from '../middleware/auth.js'
import { requireRole } from '../middleware/role.js'

const router = Router()

router.post('/assign', requireAuth, requireRole('admin'), async (req, res) => {
  const { leadIds, userId } = req.body
  if (!leadIds?.length || !userId)
    return res.status(400).json({ error: 'leadIds and userId required' })

  try {
    for (const leadId of leadIds) {
      const [lead] = await sql`SELECT assigned_to FROM leads WHERE id = ${leadId}`
      await sql`
        UPDATE leads SET assigned_to = ${userId}, assigned_at = now(), updated_at = now()
        WHERE id = ${leadId}
      `
      await sql`
        INSERT INTO lead_assignments (lead_id, assigned_from, assigned_to, assigned_by)
        VALUES (${leadId}, ${lead?.assigned_to ?? null}, ${userId}, ${req.user.id})
      `
    }
    res.json({ assigned: leadIds.length })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/auto-assign', requireAuth, requireRole('admin'), async (req, res) => {
  const { leadIds } = req.body
  if (!leadIds?.length)
    return res.status(400).json({ error: 'leadIds required' })

  try {
    const users = await sql`
      SELECT u.id, COUNT(l.id) as lead_count
      FROM users u
      LEFT JOIN leads l ON l.assigned_to = u.id
      WHERE u.is_active = true AND u.role = 'user'
      GROUP BY u.id
      ORDER BY lead_count ASC
    `
    if (!users.length)
      return res.status(400).json({ error: 'No active users to assign to' })

    for (let i = 0; i < leadIds.length; i++) {
      const userId = users[i % users.length].id
      const leadId = leadIds[i]
      const [lead] = await sql`SELECT assigned_to FROM leads WHERE id = ${leadId}`
      await sql`
        UPDATE leads SET assigned_to = ${userId}, assigned_at = now(), updated_at = now()
        WHERE id = ${leadId}
      `
      await sql`
        INSERT INTO lead_assignments (lead_id, assigned_from, assigned_to, assigned_by)
        VALUES (${leadId}, ${lead?.assigned_to ?? null}, ${userId}, ${req.user.id})
      `
    }
    res.json({ assigned: leadIds.length })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
