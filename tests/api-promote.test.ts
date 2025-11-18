import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('../../src/lib/prisma')
vi.mock('../../src/app/api/auth/authOptions', () => ({ authOptions: {} }))

import { POST } from '../src/app/api/users/promote/route'
import { getServerSession } from 'next-auth/next'
import prisma from '../../src/lib/prisma'

describe('POST /api/users/promote', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    ;(prisma as any).user = {
      findUnique: vi.fn(),
      update: vi.fn(),
    }
  })

  it('returns 401 when not authenticated', async () => {
    ;(getServerSession as any).mockResolvedValue(null)
    const req = new Request('http://localhost', { method: 'POST', body: '{}' })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 403 when requester not admin', async () => {
    ;(getServerSession as any).mockResolvedValue({ user: { email: 'user@example.com' } })
    ;(prisma.user.findUnique as any).mockResolvedValue({ id: '1', email: 'user@example.com', role: 'USER' })
    const req = new Request('http://localhost', { method: 'POST', body: '{}' })
    const res = await POST(req)
    expect(res.status).toBe(403)
  })

  it('updates user role when admin', async () => {
    ;(getServerSession as any).mockResolvedValue({ user: { email: 'admin@example.com' } })
    ;(prisma.user.findUnique as any).mockResolvedValueOnce({ id: '2', email: 'admin@example.com', role: 'ADMIN' })
    ;(prisma.user.findUnique as any).mockResolvedValueOnce({ id: '3', email: 'target@example.com', role: 'USER' })
    ;(prisma.user.update as any).mockResolvedValue({ id: '3', email: 'target@example.com', role: 'ADMIN' })

    const req = new Request('http://localhost', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'target@example.com', role: 'ADMIN' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(json.user.role).toBe('ADMIN')
  })
})
