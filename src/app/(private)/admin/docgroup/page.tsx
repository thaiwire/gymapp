"use client";

import {
  DocumentGroupRow,
  createDocumentGroup,
  deleteDocumentGroup,
  getAllDocumentGroups,
  updateDocumentGroup,
} from "@/actions/documentgroup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type DocumentGroupDraft = {
  name: string;
  description: string;
  is_active: boolean;
};

function DocumentGroupPage() {
  const [documentGroups, setDocumentGroups] = useState<DocumentGroupRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, DocumentGroupDraft>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newActive, setNewActive] = useState(true);

  const countLabel = useMemo(() => {
    if (documentGroups.length === 1) return "1 document group";
    return `${documentGroups.length} document groups`;
  }, [documentGroups.length]);

  const mapToDrafts = (rows: DocumentGroupRow[]) =>
    rows.reduce<Record<string, DocumentGroupDraft>>((acc, row) => {
      acc[row.id] = {
        name: row.name ?? "",
        description: row.description ?? "",
        is_active: row.is_active ?? false,
      };
      return acc;
    }, {});

  const loadDocumentGroups = async () => {
    setIsLoading(true);
    const result = await getAllDocumentGroups();

    if (!result.success) {
      toast.error(result.error || "Unable to fetch document groups.");
      setDocumentGroups([]);
      setDrafts({});
      setIsLoading(false);
      return;
    }

    setDocumentGroups(result.data);
    setDrafts(mapToDrafts(result.data));
    setIsLoading(false);
  };

  useEffect(() => {
    loadDocumentGroups();
  }, []);

  const updateDraft = (
    id: string,
    key: keyof DocumentGroupDraft,
    value: string | boolean
  ) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? { name: "", description: "", is_active: false }),
        [key]: value,
      },
    }));
  };

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast.error("Name is required.");
      return;
    }

    setIsCreating(true);
    const result = await createDocumentGroup({
      name: newName,
      description: newDescription,
      is_active: newActive,
    });
    setIsCreating(false);

    if (!result.success) {
      toast.error(result.error || "Unable to create document group.");
      return;
    }

    toast.success(result.message);
    setNewName("");
    setNewDescription("");
    setNewActive(true);
    await loadDocumentGroups();
  };

  const handleSave = async (id: string) => {
    const draft = drafts[id];
    if (!draft) return;

    setSavingId(id);
    const result = await updateDocumentGroup({
      id,
      name: draft.name,
      description: draft.description,
      is_active: draft.is_active,
    });
    setSavingId(null);

    if (!result.success) {
      toast.error(result.error || "Unable to update document group.");
      return;
    }

    toast.success(result.message);
    await loadDocumentGroups();
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const result = await deleteDocumentGroup(id);
    setDeletingId(null);

    if (!result.success) {
      toast.error(result.error || "Unable to delete document group.");
      return;
    }

    toast.success(result.message);
    await loadDocumentGroups();
  };

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          New Document Group
        </h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Name
            </label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Document group name"
            />
          </div>

          <div className="min-w-[260px] flex-[2]">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Description
            </label>
            <Input
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Short description"
            />
          </div>

          <div className="w-[140px]">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Status
            </label>
            <Select
              value={newActive ? "active" : "inactive"}
              onValueChange={(value) => setNewActive(value === "active")}
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

          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Document Group"}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-800">
            Manage Document Groups
          </h1>
          <p className="text-sm text-zinc-500">{countLabel}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td className="px-3 py-6 text-sm text-zinc-500" colSpan={4}>
                    Loading document groups...
                  </td>
                </tr>
              ) : documentGroups.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-sm text-zinc-500" colSpan={4}>
                    No document groups found.
                  </td>
                </tr>
              ) : (
                documentGroups.map((docgroup) => {
                  const draft = drafts[docgroup.id] ?? {
                    name: "",
                    description: "",
                    is_active: false,
                  };

                  return (
                    <tr key={docgroup.id} className="border-b border-zinc-100 align-top">
                      <td className="px-3 py-3">
                        <Input
                          value={draft.name}
                          onChange={(e) =>
                            updateDraft(docgroup.id, "name", e.target.value)
                          }
                          placeholder="Name"
                          className="h-9"
                        />
                      </td>

                      <td className="px-3 py-3">
                        <Input
                          value={draft.description}
                          onChange={(e) =>
                            updateDraft(docgroup.id, "description", e.target.value)
                          }
                          placeholder="Description"
                          className="h-9"
                        />
                      </td>

                      <td className="px-3 py-3">
                        <Select
                          value={draft.is_active ? "active" : "inactive"}
                          onValueChange={(value) =>
                            updateDraft(docgroup.id, "is_active", value === "active")
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
                            onClick={() => handleSave(docgroup.id)}
                            disabled={savingId === docgroup.id}
                          >
                            {savingId === docgroup.id ? "Saving..." : "Save"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(docgroup.id)}
                            disabled={deletingId === docgroup.id}
                          >
                            {deletingId === docgroup.id ? "Deleting..." : "Delete"}
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

export default DocumentGroupPage;