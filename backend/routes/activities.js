import { Router } from 'express'
import sql from '../lib/db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/:id/activities', requireAuth, async (req, res) => {
  try {
    const activities = await sql`
      SELECT a.*, u.name as user_name
      FROM lead_activities a
      JOIN users u ON u.id = a.updated_by
      WHERE a.lead_id = ${req.params.id}
      ORDER BY a.created_at DESC
    `
    res.json(activities)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/:id/notes', requireAuth, async (req, res) => {
  const { comment } = req.body
  if (!comment?.trim())
    return res.status(400).json({ error: 'Comment text is required' })

  try {
    const [lead] = await sql`SELECT * FROM leads WHERE id = ${req.params.id}`
    if (!lead) return res.status(404).json({ error: 'Lead not found' })
    if (req.user.role !== 'admin' && lead.assigned_to !== req.user.id)
      return res.status(403).json({ error: 'Access denied' })

    const [activity] = await sql`
      INSERT INTO lead_activities (lead_id, activity_type, comment, updated_by)
      VALUES (${req.params.id}, 'note_added', ${comment.trim()}, ${req.user.id})
      RETURNING *
    `
    await sql`UPDATE leads SET updated_at = now() WHERE id = ${req.params.id}`

    res.status(201).json(activity)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
