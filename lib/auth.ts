import { SignJWT, jwtVerify } from 'jose'

const secretKey = process.env.JWT_SECRET_KEY

if (!secretKey) {
  throw new Error('JWT_SECRET_KEY is not set')
}

const secretRole = process.env.JWT_ROLE

if (!secretRole) {
  throw new Error('JWT_ROLE is not set')
}

const key = new TextEncoder().encode(secretKey)

export async function createToken(): Promise<string> {
  return new SignJWT({ role: secretRole })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(key)
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, key)
    return payload.role === secretRole
  } catch {
    return false
  }
}
