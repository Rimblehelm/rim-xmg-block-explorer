import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('../../src/lib/prisma')
vi.mock('../../src/app/api/auth/authOptions', () => ({ authOptions: {} }))

import { GET } from '../src/app/api/users/route'
import { getServerSession } from 'next-auth/next'
import prisma from '../../src/lib/prisma'

describe('GET /api/users', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    // Ensure prisma.user methods are mock functions
    ;(prisma as any).user = {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    }
  })

  it('returns 401 when not authenticated', async () => {
    ;(getServerSession as any).mockResolvedValue(null)
    const res = await GET(new Request('http://localhost/api/users'))
    const body = await res.text()
    expect(res.status).toBe(401)
    expect(body).toContain('Unauthorized')
  })

  it('returns 403 when not admin', async () => {
    ;(getServerSession as any).mockResolvedValue({ user: { email: 'user@example.com' } })
    ;(prisma.user.findUnique as any).mockResolvedValue({ id: '1', email: 'user@example.com', role: 'USER' })
    const res = await GET(new Request('http://localhost/api/users'))
    expect(res.status).toBe(403)
  })

  it('returns users when requester is admin', async () => {
    ;(getServerSession as any).mockResolvedValue({ user: { email: 'admin@example.com' } })
    ;(prisma.user.findUnique as any).mockResolvedValue({ id: '2', email: 'admin@example.com', role: 'ADMIN' })
    const mockUsers = [{ id: '2', email: 'admin@example.com', name: 'Admin', role: 'ADMIN' }]
    ;(prisma.user.findMany as any).mockResolvedValue(mockUsers)
    const res = await GET(new Request('http://localhost/api/users'))
    expect(res.status).toBe(200)
    const body = await res.text()
    expect(body).toContain('admin@example.com')
  })
})
