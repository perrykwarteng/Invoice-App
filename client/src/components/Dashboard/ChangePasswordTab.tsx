"use client";

import { useState } from "react";
import CustomInput from "../ui/Input";
import Button from "../ui/btn";
import { useMutation } from "@tanstack/react-query";
import { changePassword } from "@/services/settings";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type ChangePasswordTabProps = {};

export default function ChangePasswordTab({}: ChangePasswordTabProps) {
  const routes = useRouter();
  const { mutate: changePasswordMutate, isPending: changePasswordPending } =
    useMutation({
      mutationKey: ["ChangePassword"],
      mutationFn: changePassword,
      onSuccess: (data) => {
        toast.success(data?.message);
        localStorage.clear();
        routes.push("/login");
      },
      onError: (data) => {
        toast.error(data?.message);
      },
    });
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("New password and confirmation don't match");
      return;
    }

    changePasswordMutate({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    });
  };

  return (
    <div className="rounded-2xl border border-accent/30 bg-white p-5 sm:p-6">
      <h2 className="text-base font-semibold text-gray-900">Change password</h2>
      <p className="mt-1 text-sm text-gray-500">Use at least 8 characters.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5 max-w-md">
        <CustomInput
          label="Current password"
          id="currentPassword"
          type="password"
          value={form.currentPassword}
          placeholder="Enter current password"
          onChange={(e: any) => handleChange("currentPassword", e.target.value)}
        />

        <CustomInput
          label="New password"
          id="newPassword"
          type="password"
          value={form.newPassword}
          placeholder="Enter new password"
          onChange={(e: any) => handleChange("newPassword", e.target.value)}
        />

        <CustomInput
          label="Confirm new password"
          id="confirmPassword"
          type="password"
          value={form.confirmPassword}
          placeholder="Confirm new password"
          onChange={(e: any) => handleChange("confirmPassword", e.target.value)}
        />

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            disabled={changePasswordPending}
            loading={changePasswordPending}
          >
            {changePasswordPending ? "Updating..." : "Update password"}
          </Button>
        </div>
      </form>
    </div>
  );
}
