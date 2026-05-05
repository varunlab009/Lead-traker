import { verifyToken } from '../lib/token.js'

export function requireAuth(req, res, next) {
  const header = req.headers['authorization']
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    const payload = verifyToken(header.split(' ')[1])
    req.user = payload
    next()
  } catch {
    return res.status(401).json({ error: 'Token expired or invalid' })
  }
}
