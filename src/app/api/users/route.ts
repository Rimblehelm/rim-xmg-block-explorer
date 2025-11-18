import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/authOptions";
import type { Session } from "next-auth";
import prisma from "../../../lib/prisma";

export async function GET(req: Request) {
  const session = (await getServerSession(authOptions as any)) as Session | null;

  if (!session || !session.user || !session.user.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const requester = await prisma.user.findUnique({ where: { email: session.user.email } });

  if (!requester || requester.role !== "ADMIN") {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? undefined;
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize") ?? "10")));

  const where = q
    ? ({
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
        ],
      } as any)
    : undefined;

  const total = await prisma.user.count({ where });
  const users = await prisma.user.findMany({
    where,
    select: { id: true, email: true, name: true, role: true },
    orderBy: { email: "asc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return new Response(JSON.stringify({ users, total, page, pageSize }), { status: 200 });
}
