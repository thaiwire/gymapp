"use client";

import {
  AdminUserRow,
  createUserProfile,
  deleteUserProfile,
  getAllUsers,
  updateUserProfile,
} from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IUser } from "@/interfaces";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type UserDraft = {
  name: string;
  role: IUser["role"];
  is_active: boolean;
};

function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, UserDraft>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState<IUser["role"]>("user");
  const [newUserActive, setNewUserActive] = useState(false);

  const usersCountLabel = useMemo(() => {
    if (users.length === 1) {
      return "1 user";
    }
    return `${users.length} users`;
  }, [users.length]);

  const mapUsersToDrafts = (rows: AdminUserRow[]) => {
    return rows.reduce<Record<string, UserDraft>>((acc, row) => {
      acc[row.id] = {
        name: row.name ?? "",
        role: row.role,
        is_active: row.is_active,
      };
      return acc;
    }, {});
  };

  const loadUsers = async () => {
    setIsLoading(true);
    const result = await getAllUsers();

    if (!result.success) {
      toast.error(result.error || "Unable to fetch users.");
      setUsers([]);
      setDrafts({});
      setIsLoading(false);
      return;
    }

    setUsers(result.data);
    setDrafts(mapUsersToDrafts(result.data));
    setIsLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const updateDraft = (id: string, key: keyof UserDraft, value: string | boolean) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? { name: "", role: "user", is_active: false }),
        [key]: value,
      },
    }));
  };

  const handleCreateUser = async () => {
    if (!newUserEmail.trim()) {
      toast.error("Email is required.");
      return;
    }

    setIsCreating(true);
    const result = await createUserProfile({
      email: newUserEmail,
      name: newUserName,
      role: newUserRole,
      is_active: newUserActive,
    });
    setIsCreating(false);

    if (!result.success) {
      toast.error(result.error || "Unable to create user.");
      return;
    }

    toast.success(result.message);
    setNewUserEmail("");
    setNewUserName("");
    setNewUserRole("user");
    setNewUserActive(false);
    await loadUsers();
  };

  const handleSaveUser = async (id: string) => {
    const draft = drafts[id];
    if (!draft) {
      return;
    }

    setSavingUserId(id);
    const result = await updateUserProfile({
      id,
      name: draft.name,
      role: draft.role,
      is_active: draft.is_active,
    });
    setSavingUserId(null);

    if (!result.success) {
      toast.error(result.error || "Unable to update user.");
      return;
    }

    toast.success(result.message);
    await loadUsers();
  };

  const handleDeleteUser = async (id: string) => {
    setDeletingUserId(id);
    const result = await deleteUserProfile(id);
    setDeletingUserId(null);

    if (!result.success) {
      toast.error(result.error || "Unable to delete user.");
      return;
    }

    toast.success(result.message);
    await loadUsers();
  };

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Email
            </label>
            <Input
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </div>

          <div className="min-w-[180px] flex-1">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Name
            </label>
            <Input
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="User name"
            />
          </div>

          <div className="w-[140px]">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Role
            </label>
            <Select
              value={newUserRole}
              onValueChange={(value) => setNewUserRole(value as IUser["role"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">user</SelectItem>
                <SelectItem value="admin">admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[140px]">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Status
            </label>
            <Select
              value={newUserActive ? "active" : "inactive"}
              onValueChange={(value) => setNewUserActive(value === "active")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">active</SelectItem>
                <SelectItem value="inactive">inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleCreateUser} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create User"}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-800">Manage Users</h1>
          <p className="text-sm text-zinc-500">{usersCountLabel}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td className="px-3 py-6 text-sm text-zinc-500" colSpan={5}>
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-sm text-zinc-500" colSpan={5}>
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const draft = drafts[user.id] ?? {
                    name: "",
                    role: "user" as const,
                    is_active: false,
                  };

                  return (
                    <tr key={user.id} className="border-b border-zinc-100 align-top">
                      <td className="px-3 py-3 text-sm text-zinc-700">{user.email}</td>

                      <td className="px-3 py-3">
                        <Input
                          value={draft.name}
                          onChange={(e) => updateDraft(user.id, "name", e.target.value)}
                          placeholder="Name"
                          className="h-9"
                        />
                      </td>

                      <td className="px-3 py-3">
                        <Select
                          value={draft.role}
                          onValueChange={(value) =>
                            updateDraft(user.id, "role", value as IUser["role"])
                          }
                        >
                          <SelectTrigger className="h-9 w-[130px]">
                            <SelectValue placeholder="Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">user</SelectItem>
                            <SelectItem value="admin">admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>

                      <td className="px-3 py-3">
                        <Select
                          value={draft.is_active ? "active" : "inactive"}
                          onValueChange={(value) =>
                            updateDraft(user.id, "is_active", value === "active")
                          }
                        >
                          <SelectTrigger className="h-9 w-[140px]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">active</SelectItem>
                            <SelectItem value="inactive">inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveUser(user.id)}
                            disabled={savingUserId === user.id}
                          >
                            {savingUserId === user.id ? "Saving..." : "Save"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={deletingUserId === user.id}
                          >
                            {deletingUserId === user.id ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default AdminUsersPage;
