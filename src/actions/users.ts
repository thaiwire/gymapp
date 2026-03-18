"use server";

import { createSupabaseServerClient } from "@/config/supabase-server-config";
import { IUser } from "@/interfaces";
import { revalidatePath } from "next/cache";

export type AdminUserRow = Pick<IUser, "id" | "email" | "name" | "role"> & {
  is_active: boolean;
};

type LoginSuccessResult = {
  success: true;
  message: string;
  role: IUser["role"];
  redirectPath: string;
};

type LoginErrorResult = {
  success: false;
  error: string;
};

type LoginActionResult = LoginSuccessResult | LoginErrorResult;

type LogoutActionResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

type UpdatePersonalInfoResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

type UpdateProfileNameResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

type UpdatePasswordResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

type GetUsersResult =
  | {
      success: true;
      data: AdminUserRow[];
    }
  | {
      success: false;
      error: string;
    };

type UpsertUserProfileResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

type DeleteUserProfileResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

type AdminAuthContext = {
  adminEmail: string;
};

const assertAdminContext = async (
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<AdminAuthContext> => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(authError.message);
  }

  if (!user?.email) {
    throw new Error("Please log in as admin.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profile")
    .select("role")
    .eq("email", user.email)
    .single();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (profile.role !== "admin") {
    throw new Error("Only admin can manage users.");
  }

  return {
    adminEmail: user.email,
  };
};

export const registerUser = async (payload : Partial<IUser>) => {
    try {
      const supabase = await createSupabaseServerClient();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: payload.email!,
        password: payload.password!,
        options: {
          data: {
            name: payload.name || null,
          },
        },
      });
      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error("Unable to create user account.");
      }
      
        const { error } = await supabase.from("user_profile").insert({
            email : payload.email!,
            name : payload.name || null,
            role : "user",
            is_active : false,
        })
        if(error) {
            throw new Error(error.message);
        }
        return {
            success : true,
            message : 'User registered successfully!'
        }


     

    } catch (error) {
       return {
        success : false,
        error : (error as Error).message
       } 
    }
}

export const loginUser = async (payload: Partial<IUser>): Promise<LoginActionResult> => {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: payload.email!,
      password: payload.password!,
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error("Unable to log in user account.");
    }

    const { data: profile, error: profileError } = await supabase
      .from("user_profile")
      .select("role, is_active")
      .eq("email", payload.email!)
      .maybeSingle();

    if (profileError) {
      throw new Error(profileError.message);
    }

    if (!profile?.role) {
      throw new Error("User role is missing. Please contact support.");
    }

    const isActive = profile.is_active as boolean | undefined;
    if (isActive === false) {
      await supabase.auth.signOut();
      throw new Error("Your account is not active. Please contact Admin support.");
    }

    const role = profile.role as IUser["role"];

    if (payload.role && payload.role !== role) {
      await supabase.auth.signOut();
      throw new Error(`This account does not have ${payload.role} access.`);
    }

    return {
      success: true,
      message: "Login successful!",
      role,
      redirectPath: role === "admin" ? "/admin/dashboard" : "/user/template",
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};
  
export const getLoggedInUser = async () => {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      throw new Error(authError.message);
    }
    if (!user) {
      return null;
    }
    const { data: profileData, error: profileError } = await supabase
      .from("user_profile")
      .select("id, email, name, role, resume_data")
      .eq("email", user.email!)
      .single();

    if (profileError) {
      throw new Error(profileError.message);
    }
    
    return {
       success: true,
       data : profileData
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    }
  }
}

export const logoutUser = async (): Promise<LogoutActionResult> => {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/");
    revalidatePath("/login");
    revalidatePath("/user/template");
    revalidatePath("/admin/dashboard");

    return {
      success: true,
      message: "Logout successful!",
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

export const updateLoggedInUserName = async (
  name: string
): Promise<UpdateProfileNameResult> => {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      throw new Error(authError.message);
    }

    if (!user?.email) {
      throw new Error("Please log in to update your profile.");
    }

    const normalizedName = name.trim();

    const { error: profileError } = await supabase
      .from("user_profile")
      .update({ name: normalizedName || null })
      .eq("email", user.email);

    if (profileError) {
      throw new Error(profileError.message);
    }

    const { error: authUpdateError } = await supabase.auth.updateUser({
      data: {
        name: normalizedName || null,
      },
    });

    if (authUpdateError) {
      throw new Error(authUpdateError.message);
    }

    revalidatePath("/admin/profile");
    revalidatePath("/user/profile");

    return {
      success: true,
      message: "Profile updated successfully!",
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

export const updateLoggedInUserPassword = async (
  newPassword: string
): Promise<UpdatePasswordResult> => {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      throw new Error(authError.message);
    }

    if (!user) {
      throw new Error("Please log in to change your password.");
    }

    const { error: passwordError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (passwordError) {
      throw new Error(passwordError.message);
    }

    return {
      success: true,
      message: "Password updated successfully!",
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

export const updatePersonalInfo = async (
  payload: NonNullable<IUser["resume_data"]>["personal_info"]
): Promise<UpdatePersonalInfoResult> => {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      throw new Error(authError.message);
    }

    if (!user?.email) {
      throw new Error("Please log in to update personal information.");
    }

    const { data: currentProfile, error: currentProfileError } = await supabase
      .from("user_profile")
      .select("resume_data")
      .eq("email", user.email)
      .single();

    if (currentProfileError) {
      throw new Error(currentProfileError.message);
    }

    const nextResumeData = {
      ...(currentProfile?.resume_data ?? {}),
      personal_info: payload,
    };

    const { error: updateError } = await supabase
      .from("user_profile")
      .update({ resume_data: nextResumeData })
      .eq("email", user.email);

    if (updateError) {
      throw new Error(updateError.message);
    }

    revalidatePath("/user/resume-data");

    return {
      success: true,
      message: "Personal information updated successfully!",
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

export const getAllUsers = async (): Promise<GetUsersResult> => {
  try {
    const supabase = await createSupabaseServerClient();
    await assertAdminContext(supabase);

    const { data, error } = await supabase
      .from("user_profile")
      .select("id, email, name, role, is_active")
      .order("email", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      data: (data ?? []) as AdminUserRow[],
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

export const createUserProfile = async (payload: {
  email: string;
  name: string;
  role: IUser["role"];
  is_active: boolean;
}): Promise<UpsertUserProfileResult> => {
  try {
    const supabase = await createSupabaseServerClient();
    await assertAdminContext(supabase);

    const { error } = await supabase.from("user_profile").insert({
      email: payload.email.trim().toLowerCase(),
      name: payload.name.trim() || null,
      role: payload.role,
      is_active: payload.is_active,
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/users");

    return {
      success: true,
      message: "User created successfully!",
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

export const updateUserProfile = async (payload: {
  id: string;
  name: string;
  role: IUser["role"];
  is_active: boolean;
}): Promise<UpsertUserProfileResult> => {
  try {
    const supabase = await createSupabaseServerClient();
    const { adminEmail } = await assertAdminContext(supabase);

    const { data: currentTarget, error: currentTargetError } = await supabase
      .from("user_profile")
      .select("email")
      .eq("id", payload.id)
      .single();

    if (currentTargetError) {
      throw new Error(currentTargetError.message);
    }

    if (currentTarget.email === adminEmail && !payload.is_active) {
      throw new Error("You cannot deactivate your own account.");
    }

    const { error } = await supabase
      .from("user_profile")
      .update({
        name: payload.name.trim() || null,
        role: payload.role,
        is_active: payload.is_active,
      })
      .eq("id", payload.id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/users");

    return {
      success: true,
      message: "User updated successfully!",
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

export const deleteUserProfile = async (
  id: string
): Promise<DeleteUserProfileResult> => {
  try {
    const supabase = await createSupabaseServerClient();
    const { adminEmail } = await assertAdminContext(supabase);

    const { data: currentTarget, error: currentTargetError } = await supabase
      .from("user_profile")
      .select("email")
      .eq("id", id)
      .single();

    if (currentTargetError) {
      throw new Error(currentTargetError.message);
    }

    if (currentTarget.email === adminEmail) {
      throw new Error("You cannot delete your own account.");
    }

    const { error } = await supabase.from("user_profile").delete().eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/users");

    return {
      success: true,
      message: "User deleted successfully!",
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

