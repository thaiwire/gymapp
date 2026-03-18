"use server";

import { createSupabaseServerClient } from "@/config/supabase-server-config";
import { IDocumentGroup } from "@/interfaces";
import { revalidatePath } from "next/cache";

export type DocumentGroupRow = Pick<
  IDocumentGroup,
  "id" | "name" | "description" | "is_active" | "created_at" | "updated_at"
>;

type GetDocumentGroupsResult =
  | { success: true; data: DocumentGroupRow[] }
  | { success: false; error: string };

type DocumentGroupMutationResult =
  | { success: true; message: string }
  | { success: false; error: string };

const assertAdminContext = async (
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
) => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw new Error(authError.message);
  if (!user?.email) throw new Error("Please log in as admin.");

  const { data: profile, error: profileError } = await supabase
    .from("user_profile")
    .select("role")
    .eq("email", user.email)
    .single();

  if (profileError) throw new Error(profileError.message);
  if (profile.role !== "admin")
    throw new Error("Only admin can manage document groups.");
};

export const getAllDocumentGroups =
  async (): Promise<GetDocumentGroupsResult> => {
    try {
      const supabase = await createSupabaseServerClient();
      await assertAdminContext(supabase);

      const { data, error } = await supabase
        .from("document_group")
        .select("id, name, description, is_active, created_at, updated_at")
        .order("name", { ascending: true });

      if (error) throw new Error(error.message);

      return { success: true, data: (data ?? []) as DocumentGroupRow[] };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

export const createDocumentGroup = async (payload: {
  name: string;
  description: string;
  is_active: boolean;
}): Promise<DocumentGroupMutationResult> => {
  try {
    const supabase = await createSupabaseServerClient();
    await assertAdminContext(supabase);

    const { error } = await supabase.from("document_group").insert({
      name: payload.name.trim(),
      description: payload.description.trim(),
      is_active: payload.is_active,
    });

    if (error) throw new Error(error.message);

    revalidatePath("/admin/docgroup");

    return { success: true, message: "Document group created successfully!" };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const updateDocumentGroup = async (payload: {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
}): Promise<DocumentGroupMutationResult> => {
  try {
    const supabase = await createSupabaseServerClient();
    await assertAdminContext(supabase);

    const { error } = await supabase
      .from("document_group")
      .update({
        name: payload.name.trim(),
        description: payload.description.trim(),
        is_active: payload.is_active,
      })
      .eq("id", payload.id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/docgroup");

    return { success: true, message: "Document group updated successfully!" };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const deleteDocumentGroup = async (
  id: string
): Promise<DocumentGroupMutationResult> => {
  try {
    const supabase = await createSupabaseServerClient();
    await assertAdminContext(supabase);

    const { error } = await supabase
      .from("document_group")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/docgroup");

    return { success: true, message: "Document group deleted successfully!" };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};