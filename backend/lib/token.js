import jwt from 'jsonwebtoken'

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '24h').trim()
  })
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET)
}
