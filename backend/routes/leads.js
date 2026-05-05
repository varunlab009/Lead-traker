import { Router } from 'express'
import sql from '../lib/db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, async (req, res) => {
  const { status, page = 1, search, dateFrom, dateTo, assignedTo } = req.query
  const limit = 20
  const offset = (Number(page) - 1) * limit
  const isAdmin = req.user.role === 'admin'

  try {
    let leads, total

    if (isAdmin) {
      if (status && search && dateFrom && dateTo && assignedTo) {
        leads = await sql`SELECT l.*, u.name as assigned_user_name, EXISTS(SELECT 1 FROM lead_activities la WHERE la.lead_id = l.id AND la.created_at > NOW() - INTERVAL '24 hours') as is_hot_lead FROM leads l LEFT JOIN users u ON u.id = l.assigned_to WHERE l.status = ${status} AND (l.name ILIKE ${'%'+search+'%'} OR l.contact ILIKE ${'%'+search+'%'}) AND l.created_at >= ${dateFrom} AND l.created_at <= ${dateTo} AND l.assigned_to = ${assignedTo} ORDER BY l.updated_at DESC LIMIT ${limit} OFFSET ${offset}`
        const [c] = await sql`SELECT COUNT(*) FROM leads l WHERE l.status = ${status} AND (l.name ILIKE ${'%'+search+'%'} OR l.contact ILIKE ${'%'+search+'%'}) AND l.created_at >= ${dateFrom} AND l.created_at <= ${dateTo} AND l.assigned_to = ${assignedTo}`
        total = c.count
      } else if (status && search) {
        leads = await sql`SELECT l.*, u.name as assigned_user_name, EXISTS(SELECT 1 FROM lead_activities la WHERE la.lead_id = l.id AND la.created_at > NOW() - INTERVAL '24 hours') as is_hot_lead FROM leads l LEFT JOIN users u ON u.id = l.assigned_to WHERE l.status = ${status} AND (l.name ILIKE ${'%'+search+'%'} OR l.contact ILIKE ${'%'+search+'%'}) ORDER BY l.updated_at DESC LIMIT ${limit} OFFSET ${offset}`
        const [c] = await sql`SELECT COUNT(*) FROM leads l WHERE l.status = ${status} AND (l.name ILIKE ${'%'+search+'%'} OR l.contact ILIKE ${'%'+search+'%'})`
        total = c.count
      } else if (status && assignedTo) {
        leads = await sql`SELECT l.*, u.name as assigned_user_name, EXISTS(SELECT 1 FROM lead_activities la WHERE la.lead_id = l.id AND la.created_at > NOW() - INTERVAL '24 hours') as is_hot_lead FROM leads l LEFT JOIN users u ON u.id = l.assigned_to WHERE l.status = ${status} AND l.assigned_to = ${assignedTo} ORDER BY l.updated_at DESC LIMIT ${limit} OFFSET ${offset}`
        const [c] = await sql`SELECT COUNT(*) FROM leads l WHERE l.status = ${status} AND l.assigned_to = ${assignedTo}`
        total = c.count
      } else if (status) {
        leads = await sql`SELECT l.*, u.name as assigned_user_name, EXISTS(SELECT 1 FROM lead_activities la WHERE la.lead_id = l.id AND la.created_at > NOW() - INTERVAL '24 hours') as is_hot_lead FROM leads l LEFT JOIN users u ON u.id = l.assigned_to WHERE l.status = ${status} ORDER BY l.updated_at DESC LIMIT ${limit} OFFSET ${offset}`
        const [c] = await sql`SELECT COUNT(*) FROM leads l WHERE l.status = ${status}`
        total = c.count
      } else if (search) {
        leads = await sql`SELECT l.*, u.name as assigned_user_name, EXISTS(SELECT 1 FROM lead_activities la WHERE la.lead_id = l.id AND la.created_at > NOW() - INTERVAL '24 hours') as is_hot_lead FROM leads l LEFT JOIN users u ON u.id = l.assigned_to WHERE (l.name ILIKE ${'%'+search+'%'} OR l.contact ILIKE ${'%'+search+'%'}) ORDER BY l.updated_at DESC LIMIT ${limit} OFFSET ${offset}`
        const [c] = await sql`SELECT COUNT(*) FROM leads l WHERE (l.name ILIKE ${'%'+search+'%'} OR l.contact ILIKE ${'%'+search+'%'})`
        total = c.count
      } else if (assignedTo) {
        leads = await sql`SELECT l.*, u.name as assigned_user_name, EXISTS(SELECT 1 FROM lead_activities la WHERE la.lead_id = l.id AND la.created_at > NOW() - INTERVAL '24 hours') as is_hot_lead FROM leads l LEFT JOIN users u ON u.id = l.assigned_to WHERE l.assigned_to = ${assignedTo} ORDER BY l.updated_at DESC LIMIT ${limit} OFFSET ${offset}`
        const [c] = await sql`SELECT COUNT(*) FROM leads l WHERE l.assigned_to = ${assignedTo}`
        total = c.count
      } else {
        leads = await sql`SELECT l.*, u.name as assigned_user_name, EXISTS(SELECT 1 FROM lead_activities la WHERE la.lead_id = l.id AND la.created_at > NOW() - INTERVAL '24 hours') as is_hot_lead FROM leads l LEFT JOIN users u ON u.id = l.assigned_to ORDER BY l.updated_at DESC LIMIT ${limit} OFFSET ${offset}`
        const [c] = await sql`SELECT COUNT(*) FROM leads`
        total = c.count
      }
    } else {
      const uid = req.user.id
      if (status && search) {
        leads = await sql`SELECT l.*, u.name as assigned_user_name, EXISTS(SELECT 1 FROM lead_activities la WHERE la.lead_id = l.id AND la.created_at > NOW() - INTERVAL '24 hours') as is_hot_lead FROM leads l LEFT JOIN users u ON u.id = l.assigned_to WHERE l.assigned_to = ${uid} AND l.status = ${status} AND (l.name ILIKE ${'%'+search+'%'} OR l.contact ILIKE ${'%'+search+'%'}) ORDER BY l.updated_at DESC LIMIT ${limit} OFFSET ${offset}`
        const [c] = await sql`SELECT COUNT(*) FROM leads l WHERE l.assigned_to = ${uid} AND l.status = ${status} AND (l.name ILIKE ${'%'+search+'%'} OR l.contact ILIKE ${'%'+search+'%'})`
        total = c.count
      } else if (status) {
        leads = await sql`SELECT l.*, u.name as assigned_user_name, EXISTS(SELECT 1 FROM lead_activities la WHERE la.lead_id = l.id AND la.created_at > NOW() - INTERVAL '24 hours') as is_hot_lead FROM leads l LEFT JOIN users u ON u.id = l.assigned_to WHERE l.assigned_to = ${uid} AND l.status = ${status} ORDER BY l.updated_at DESC LIMIT ${limit} OFFSET ${offset}`
        const [c] = await sql`SELECT COUNT(*) FROM leads l WHERE l.assigned_to = ${uid} AND l.status = ${status}`
        total = c.count
      } else if (search) {
        leads = await sql`SELECT l.*, u.name as assigned_user_name, EXISTS(SELECT 1 FROM lead_activities la WHERE la.lead_id = l.id AND la.created_at > NOW() - INTERVAL '24 hours') as is_hot_lead FROM leads l LEFT JOIN users u ON u.id = l.assigned_to WHERE l.assigned_to = ${uid} AND (l.name ILIKE ${'%'+search+'%'} OR l.contact ILIKE ${'%'+search+'%'}) ORDER BY l.updated_at DESC LIMIT ${limit} OFFSET ${offset}`
        const [c] = await sql`SELECT COUNT(*) FROM leads l WHERE l.assigned_to = ${uid} AND (l.name ILIKE ${'%'+search+'%'} OR l.contact ILIKE ${'%'+search+'%'})`
        total = c.count
      } else {
        leads = await sql`SELECT l.*, u.name as assigned_user_name, EXISTS(SELECT 1 FROM lead_activities la WHERE la.lead_id = l.id AND la.created_at > NOW() - INTERVAL '24 hours') as is_hot_lead FROM leads l LEFT JOIN users u ON u.id = l.assigned_to WHERE l.assigned_to = ${uid} ORDER BY l.updated_at DESC LIMIT ${limit} OFFSET ${offset}`
        const [c] = await sql`SELECT COUNT(*) FROM leads l WHERE l.assigned_to = ${uid}`
        total = c.count
      }
    }

    res.json({ leads, page: Number(page), limit, total: Number(total) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const [lead] = await sql`
      SELECT l.*, u.name as assigned_user_name,
        EXISTS(
          SELECT 1 FROM lead_activities la
          WHERE la.lead_id = l.id AND la.created_at > NOW() - INTERVAL '24 hours'
        ) as is_hot_lead
      FROM leads l
      LEFT JOIN users u ON u.id = l.assigned_to
      WHERE l.id = ${req.params.id}
    `
    if (!lead) return res.status(404).json({ error: 'Lead not found' })
    if (req.user.role !== 'admin' && lead.assigned_to !== req.user.id)
      return res.status(403).json({ error: 'Access denied' })
    res.json(lead)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.patch('/:id/status', requireAuth, async (req, res) => {
  const { status } = req.body
  const validStatuses = ['interested', 'not_interested', 'follow_up', 'converted', 'lost']
  if (!validStatuses.includes(status))
    return res.status(400).json({ error: 'Invalid status' })

  try {
    const [lead] = await sql`SELECT * FROM leads WHERE id = ${req.params.id}`
    if (!lead) return res.status(404).json({ error: 'Lead not found' })
    if (req.user.role !== 'admin' && lead.assigned_to !== req.user.id)
      return res.status(403).json({ error: 'Access denied' })

    const [updated] = await sql`
      UPDATE leads SET status = ${status}, updated_at = now()
      WHERE id = ${req.params.id} RETURNING *
    `
    await sql`
      INSERT INTO lead_activities (lead_id, activity_type, comment, old_status, new_status, updated_by)
      VALUES (${req.params.id}, 'status_change',
        ${'Status changed from ' + lead.status + ' to ' + status},
        ${lead.status}, ${status}, ${req.user.id})
    `
    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
