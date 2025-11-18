import NextAuth from "next-auth";
import prisma from "../../../../lib/prisma";
import { authOptions } from "../authOptions";
import type { Session } from "next-auth";

// Create an extended auth options object that includes a session callback
const extendedAuthOptions = {
	...(authOptions as any),
	callbacks: {
		...(authOptions as any).callbacks,
		async session({ session }: { session: Session & { user?: { role?: string; email?: string } } }) {
			try {
				if (session?.user?.email) {
					const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
					const role = (dbUser as unknown as { role?: string })?.role ?? "USER";
					session.user = { ...session.user, role } as any;
				}
			} catch {
				// Ignore errors here; session will proceed without role if lookup fails
			}
			return session;
		},
	},
};

const handler = NextAuth(extendedAuthOptions as any);

export { handler as GET, handler as POST };
