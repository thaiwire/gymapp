"use client";

import {
  updateLoggedInUserName,
  updateLoggedInUserPassword,
} from "@/actions/users";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUserStore } from "@/store/users-store";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(100),
});

const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(100, "Password must be less than 100 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

function AdminProfilePage() {
  const { user, setUser } = useUserStore();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    values: {
      name: user?.name ?? "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    mode: "onChange",
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmitProfile = async (values: ProfileFormValues) => {
    const result = await updateLoggedInUserName(values.name);

    if (!result.success) {
      toast.error(result.error || "Unable to update profile.");
      return;
    }

    setUser(
      user
        ? {
            ...user,
            name: values.name.trim(),
          }
        : null
    );
    toast.success(result.message);
  };

  const onSubmitPassword = async (values: PasswordFormValues) => {
    const result = await updateLoggedInUserPassword(values.newPassword);

    if (!result.success) {
      toast.error(result.error || "Unable to update password.");
      return;
    }

    toast.success(result.message);
    passwordForm.reset();
  };

  return (
    <section className="mx-auto grid w-full max-w-4xl gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold text-zinc-800">Profile Details</h1>
        <p className="mt-1 text-sm text-zinc-500">Update your display name shown across admin screens.</p>

        <Form {...profileForm}>
          <form
            onSubmit={profileForm.handleSubmit(onSubmitProfile)}
            className="mt-5 space-y-4"
            noValidate
          >
            <FormField
              control={profileForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" autoComplete="name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={profileForm.formState.isSubmitting}>
              {profileForm.formState.isSubmitting ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </Form>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-zinc-800">Change Password</h2>
        <p className="mt-1 text-sm text-zinc-500">Set a new secure password for your account.</p>

        <Form {...passwordForm}>
          <form
            onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
            className="mt-5 space-y-4"
            noValidate
          >
            <FormField
              control={passwordForm.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
              {passwordForm.formState.isSubmitting ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </Form>
      </div>
    </section>
  );
}

export default AdminProfilePage;