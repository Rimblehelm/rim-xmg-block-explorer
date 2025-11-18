import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/authOptions";
import prisma from "../../../lib/prisma";
import AdminUserList from "../../../components/AdminUserList";

export default async function Page() {
  const session = await getServerSession(authOptions as any);
  if (!session || !session.user || !session.user.email) {
    return <div className="p-4">Unauthorized</div>;
  }

  const requester = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!requester || requester.role !== "ADMIN") {
    return <div className="p-4">Forbidden — admin access only</div>;
  }

  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true } });
  const currentUserId = requester.id;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin: Manage Users</h1>
      {/* @ts-expect-error Server -> Client prop */}
      <AdminUserList initial={users} currentUserId={currentUserId} />
    </div>
  );
}
