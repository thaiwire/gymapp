"use server";

import { createSupabaseServerClient } from "@/config/supabase-server-config";
import { IDepartment } from "@/interfaces";
import { revalidatePath } from "next/cache";

export type DepartmentRow = Pick<
  IDepartment,
  "id" | "name" | "description" | "is_active" | "created_at" | "updated_at"
>;

type GetDepartmentsResult =
  | { success: true; data: DepartmentRow[] }
  | { success: false; error: string };

type DepartmentMutationResult =
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
  if (profile.role !== "admin") throw new Error("Only admin can manage departments.");
};

export const getAllDepartments = async (): Promise<GetDepartmentsResult> => {
  try {
    const supabase = await createSupabaseServerClient();
    await assertAdminContext(supabase);

    const { data, error } = await supabase
      .from("department")
      .select("id, name, description, is_active, created_at, updated_at")
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);

    return { success: true, data: (data ?? []) as DepartmentRow[] };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const createDepartment = async (payload: {
  name: string;
  description: string;
  is_active: boolean;
}): Promise<DepartmentMutationResult> => {
  try {
    const supabase = await createSupabaseServerClient();
    await assertAdminContext(supabase);

    const { error } = await supabase.from("department").insert({
      name: payload.name.trim(),
      description: payload.description.trim(),
      is_active: payload.is_active,
    });

    if (error) throw new Error(error.message);

    revalidatePath("/admin/departments");

    return { success: true, message: "Department created successfully!" };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const updateDepartment = async (payload: {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
}): Promise<DepartmentMutationResult> => {
  try {
    const supabase = await createSupabaseServerClient();
    await assertAdminContext(supabase);

    const { error } = await supabase
      .from("department")
      .update({
        name: payload.name.trim(),
        description: payload.description.trim(),
        is_active: payload.is_active,
      })
      .eq("id", payload.id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/departments");

    return { success: true, message: "Department updated successfully!" };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const deleteDepartment = async (
  id: string
): Promise<DepartmentMutationResult> => {
  try {
    const supabase = await createSupabaseServerClient();
    await assertAdminContext(supabase);

    const { error } = await supabase.from("department").delete().eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/admin/departments");

    return { success: true, message: "Department deleted successfully!" };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};
