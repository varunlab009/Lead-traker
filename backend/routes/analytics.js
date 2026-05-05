import { Router } from 'express'
import sql from '../lib/db.js'
import { requireAuth } from '../middleware/auth.js'
import { requireRole } from '../middleware/role.js'

const router = Router()
router.use(requireAuth, requireRole('admin'))

router.get('/overview', async (req, res) => {
  try {
    const [stats] = await sql`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'converted')      as converted,
        COUNT(*) FILTER (WHERE status = 'lost')           as lost,
        COUNT(*) FILTER (WHERE status = 'follow_up')      as in_progress,
        COUNT(*) FILTER (WHERE status = 'interested')     as interested,
        COUNT(*) FILTER (WHERE status = 'not_interested') as not_interested,
        COUNT(*) FILTER (WHERE assigned_to IS NULL)       as unassigned
      FROM leads
    `
    res.json(stats)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/by-user', async (req, res) => {
  try {
    const stats = await sql`
      SELECT
        u.id, u.name,
        COUNT(l.id) as total_assigned,
        COUNT(l.id) FILTER (WHERE l.status = 'converted') as converted,
        COUNT(l.id) FILTER (WHERE l.status = 'lost') as lost,
        ROUND(
          COUNT(l.id) FILTER (WHERE l.status = 'converted')::numeric
          / NULLIF(COUNT(l.id), 0) * 100, 1
        ) as conversion_rate
      FROM users u
      LEFT JOIN leads l ON l.assigned_to = u.id
      WHERE u.role = 'user'
      GROUP BY u.id, u.name
      ORDER BY converted DESC
    `
    res.json(stats)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/by-source', async (req, res) => {
  try {
    const stats = await sql`
      SELECT source, COUNT(*) as count
      FROM leads
      GROUP BY source
      ORDER BY count DESC
    `
    res.json(stats)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/trend', async (req, res) => {
  try {
    const stats = await sql`
      SELECT
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'converted') as converted
      FROM leads
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY month
      ORDER BY month ASC
    `
    res.json(stats)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
