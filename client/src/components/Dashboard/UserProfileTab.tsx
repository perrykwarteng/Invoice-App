"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import Button from "../ui/btn";
import CustomInput from "../ui/Input";
import { useUserStore } from "@/store/useUserStore";
import { imageUrls } from "@/types/types";
import { updateUserProfile } from "@/services/settings";

export default function UserProfileTab() {
  const { user } = useUserStore();

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "staff",
    isActive: false,
  });

  const [avatar, setAvatar] = useState<File | imageUrls | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    if (!user) return;

    setForm({
      name: user.name ?? "",
      email: user.email ?? "",
      role: user.role ?? "staff",
      isActive: user.isActive ?? false,
    });

    setAvatar(user.profilePic ?? null);
    setAvatarPreview(user.profilePic?.imageUrl ?? "");
  }, [user]);

  const { mutate: updateMutate, isPending: updatePending } = useMutation({
    mutationKey: ["UpdateUserProfile"],
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      toast.success(data?.message);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update profile.");
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setAvatar(file);

    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();

    if (avatar instanceof File) {
      formData.append("profilePic", avatar);
    } else if (avatar) {
      formData.append("profileImage", avatar.imageUrl);
    }

    updateMutate(formData);
  };

  return (
    <div className="rounded-2xl border border-accent/30 bg-white p-5 sm:p-6">
      <h2 className="text-base font-semibold text-gray-900">User profile</h2>

      <p className="mt-1 text-sm text-gray-500">
        User information, role and account status.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border bg-gray-100">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-center text-gray-400">
                {form.name ? form.name.charAt(0).toUpperCase() : "No Image"}
              </span>
            )}
          </div>

          <div>
            <input
              id="avatar"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />

            <Button type="button" variant="outline">
              <label htmlFor="avatar" className="cursor-pointer">
                Change photo
              </label>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <CustomInput
            label="Full name"
            id="name"
            type="text"
            value={form.name}
            disabled
            placeholder="Name"
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
          />

          <CustomInput
            label="Email"
            id="email"
            type="email"
            value={form.email}
            disabled
            placeholder="Email"
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                email: e.target.value,
              }))
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-700">Role</label>

            <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="font-medium text-gray-800">
                {form.role === "super_admin" && "Super Admin"}
                {form.role === "org_admin" && "Organisation Admin"}
                {form.role === "staff" && "Staff"}
              </p>

              <p className="mt-1 text-xs text-gray-500">User access level</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Account Status
            </label>

            <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <span
                className={`inline-flex items-center rounded-full text-sm font-medium ${
                  form.isActive ? "text-green-700" : "text-red-700"
                }`}
              >
                {form.isActive ? "Active" : "Inactive"}
              </span>

              <p className="mt-1 text-xs text-gray-500">
                Account is currently active
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" disabled={updatePending}>
            {updatePending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
