import { Router } from 'express'
import sql from '../lib/db.js'
import { requireAuth } from '../middleware/auth.js'
import { requireRole } from '../middleware/role.js'

const router = Router()

router.post('/preview', requireAuth, requireRole('admin'), async (req, res) => {
  const { rows } = req.body
  if (!rows?.length) return res.status(400).json({ error: 'No rows provided' })

  const results = { valid: [], errors: [], duplicates: [] }

  try {
    for (const row of rows) {
      if (!row.name || !row.contact) {
        results.errors.push({ ...row, error: 'Name and Contact are required' })
        continue
      }
      const clean = row.contact.replace(/\s/g, '')
      if (!/^\d{10}$/.test(clean)) {
        results.errors.push({ ...row, error: 'Contact must be 10 digits' })
        continue
      }
      const existing = await sql`
        SELECT id FROM leads
        WHERE contact = ${clean}
        OR (email IS NOT NULL AND email = ${row.email || ''} AND ${row.email || ''} != '')
        LIMIT 1
      `
      if (existing.length) {
        results.duplicates.push({ ...row, error: 'Duplicate contact/email' })
        continue
      }
      results.valid.push({ ...row, contact: clean })
    }

    res.json({
      total: rows.length,
      valid: results.valid.length,
      errors: results.errors.length,
      duplicates: results.duplicates.length,
      preview: results,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/confirm', requireAuth, requireRole('admin'), async (req, res) => {
  const { rows, filename, totals } = req.body
  if (!rows?.length) return res.status(400).json({ error: 'No rows to insert' })

  try {
    const [batch] = await sql`
      INSERT INTO csv_uploads (uploaded_by, filename, total_rows, valid_rows, duplicate_rows, status)
      VALUES (${req.user.id}, ${filename}, ${totals.total}, ${totals.valid}, ${totals.duplicates}, 'done')
      RETURNING id
    `
    for (const row of rows) {
      let assignedUserId = null
      if (row.assigned_user) {
        const [u] = await sql`SELECT id FROM users WHERE email = ${row.assigned_user} LIMIT 1`
        assignedUserId = u?.id || null
      }
      if (assignedUserId) {
        await sql`
          INSERT INTO leads (name, business_name, contact, email, city, niche, address, source, status, notes, assigned_to, assigned_at, upload_batch_id)
          VALUES (${row.name}, ${row.business_name || null}, ${row.contact}, ${row.email || null}, ${row.city || null}, ${row.niche || null}, ${row.address || null}, ${row.source || 'Unknown'}, ${row.status || 'follow_up'}, ${row.notes || null}, ${assignedUserId}, now(), ${batch.id})
        `
      } else {
        await sql`
          INSERT INTO leads (name, business_name, contact, email, city, niche, address, source, status, notes, upload_batch_id)
          VALUES (${row.name}, ${row.business_name || null}, ${row.contact}, ${row.email || null}, ${row.city || null}, ${row.niche || null}, ${row.address || null}, ${row.source || 'Unknown'}, ${row.status || 'follow_up'}, ${row.notes || null}, ${batch.id})
        `
      }
    }
    res.json({ inserted: rows.length, batchId: batch.id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const uploads = await sql`
      SELECT u.*, usr.name as uploaded_by_name
      FROM csv_uploads u
      JOIN users usr ON usr.id = u.uploaded_by
      ORDER BY u.created_at DESC
    `
    res.json(uploads)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
