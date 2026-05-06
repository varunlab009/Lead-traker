import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import authRoutes       from './routes/auth.js'
import leadsRoutes      from './routes/leads.js'
import activitiesRoutes from './routes/activities.js'
import usersRoutes      from './routes/users.js'
import assignRoutes     from './routes/assignments.js'
import uploadsRoutes    from './routes/uploads.js'
import analyticsRoutes  from './routes/analytics.js'

dotenv.config()

const app = express()

app.use(cors({
  origin: process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(s => s.trim())
    : 'http://localhost:5173',
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))

app.use('/api/auth',      authRoutes)
app.use('/api/leads',     leadsRoutes)
app.use('/api/leads',     activitiesRoutes)
app.use('/api/users',     usersRoutes)
app.use('/api/leads',     assignRoutes)
app.use('/api/uploads',   uploadsRoutes)
app.use('/api/analytics', analyticsRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000
  app.listen(PORT, () => console.log(`LeadTrack API running on port ${PORT}`))
}

export default app
