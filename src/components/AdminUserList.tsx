"use client";
import React, { useMemo, useState, useEffect } from "react";
import ConfirmModal from "./ConfirmModal";

type UserItem = {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
};

export default function AdminUserList({ initial, currentUserId }: { initial: UserItem[]; currentUserId?: string | null }) {
  const [users, setUsers] = useState<UserItem[]>(initial ?? []);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<UserItem | null>(null);

  async function fetchPage(p = page, q = query) {
    const params = new URLSearchParams();
    params.set("page", String(p));
    params.set("pageSize", String(pageSize));
    if (q) params.set("q", q);
    const res = await fetch(`/api/users?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to load users");
    const data = await res.json();
    setUsers(data.users);
    setTotal(data.total);
    setPage(data.page);
  }

  useEffect(() => {
    fetchPage(1, query).catch((e) => console.error(e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => fetchPage(1, query).catch(() => {}), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function openConfirm(user: UserItem) {
    setSelected(user);
    setModalOpen(true);
  }

  async function onConfirm() {
    if (!selected) return;
    const user = selected;
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    setLoadingId(user.id);
    try {
      const res = await fetch("/api/users/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, role: newRole }),
      });
      if (!res.ok) throw new Error("failed");
      await fetchPage(page, query);
    } catch (e) {
      window.alert("Failed to change role — check console for details");
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setLoadingId(null);
      setModalOpen(false);
      setSelected(null);
    }
  }

  const totalPages = total ? Math.ceil(total / pageSize) : 1;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h2 className="text-2xl font-semibold">Users</h2>
        <div className="flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by email or name"
            className="border px-3 py-2 rounded w-64"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-3 py-3">{u.email}</td>
                <td className="px-3 py-3">{u.name}</td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${u.role === "ADMIN" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <button
                    onClick={() => openConfirm(u)}
                    disabled={u.id === currentUserId}
                    className="px-3 py-1 rounded bg-slate-800 text-white disabled:opacity-50"
                    title={u.id === currentUserId ? "You cannot change your own role here" : "Toggle role"}
                  >
                    {loadingId === u.id ? "..." : u.role === "ADMIN" ? "Demote" : "Promote"}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-slate-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-slate-600">{total ?? "-"} users</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchPage(Math.max(1, page - 1), query).catch(() => {})}
            disabled={page <= 1}
            className="px-3 py-1 border rounded"
          >
            Prev
          </button>
          <div className="px-3 py-1">Page {page} / {totalPages}</div>
          <button
            onClick={() => fetchPage(Math.min(totalPages, page + 1), query).catch(() => {})}
            disabled={page >= totalPages}
            className="px-3 py-1 border rounded"
          >
            Next
          </button>
        </div>
      </div>

      <ConfirmModal
        open={modalOpen}
        title={selected ? `Change role for ${selected.email}` : undefined}
        message={selected ? `Change role to ${selected.role === 'ADMIN' ? 'USER' : 'ADMIN'}?` : undefined}
        onConfirm={onConfirm}
        onCancel={() => { setModalOpen(false); setSelected(null); }}
      />
    </div>
  );
}
