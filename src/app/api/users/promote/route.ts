import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/authOptions";
import type { Session } from "next-auth";
import prisma from "../../../../lib/prisma";

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions as any)) as Session | null;
  if (!session || !session.user || !session.user.email) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // Refresh DB user to read role
  const requester = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!requester || requester.role !== 'ADMIN') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const body = await req.json();
  const { email, role } = body as { email?: string; role?: string };
  if (!email || !role) {
    return new Response(JSON.stringify({ error: 'Missing email or role' }), { status: 400 });
  }
  if (role !== 'ADMIN' && role !== 'USER') {
    return new Response(JSON.stringify({ error: 'Invalid role' }), { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { email } });
  if (!target) {
    return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
  }

  const updated = await prisma.user.update({ where: { email }, data: { role } as any });
  return new Response(JSON.stringify({ ok: true, user: { id: updated.id, email: updated.email, role: updated.role } }), { status: 200 });
}
