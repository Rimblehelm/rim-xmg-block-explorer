import prisma from "../../../../lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  // Only allow in development or test environments
  if (process.env.NODE_ENV === "production") {
    return new Response(JSON.stringify({ error: "Not available" }), { status: 404 });
  }

  const body = await req.json();
  const email = body?.email;
  const role = body?.role ?? "ADMIN";
  if (!email) return new Response(JSON.stringify({ error: "Missing email" }), { status: 400 });

  // Ensure user exists and is an admin (for testing)
  const user = await prisma.user.upsert({
    where: { email },
    create: { email, name: body?.name ?? "Test User", role },
    update: { role },
  });

  // Create a session token and store it in the Sessions table
  const sessionToken = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expires,
    },
  });

  return new Response(JSON.stringify({ sessionToken }), { status: 200 });
}
