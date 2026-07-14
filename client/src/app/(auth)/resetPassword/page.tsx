"use client";

import Button from "@/components/ui/btn";
import CustomInput from "@/components/ui/Input";
import Image from "next/image";
import Link from "next/link";
import AuthImage from "@/assets/images/authImage.jpg";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "@/services/auth";
import { toast } from "sonner";

export default function ResetPassword() {
  const router = useRouter();

  const email =
    (typeof window !== "undefined" ? localStorage.getItem("email") : "") || "";

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const { mutate: resetPasswordMutate, isPending: resetPasswordPending } =
    useMutation({
      mutationKey: ["ResetPassword"],
      mutationFn: resetPassword,
      onSuccess: (data) => {
        toast.success(data?.message);
        localStorage.clear();
        router.push("/login");
      },

      onError: (data) => {
        toast.error(data.message);
      },
    });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.password || !form.confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!email) {
      toast.error("Email noe available");
    }
    setError("");

    resetPasswordMutate({ email, newPassword: form.password });
  };

  return (
    <div className="w-full max-h-screen bg-bg-light flex flex-col md:flex-row p-5">
      <div className="md:flex-2/4">
        <div className="text-primary">SwiftInvoice.</div>

        <div className="min-h-155 flex items-center justify-center">
          <div className="w-full md:w-[80%] lg:w-[60%]">
            <h3 className="text-3xl font-semibold text-secondary font-Saira">
              Reset Password
            </h3>

            <p className="text-gray-500 text-sm mt-2">
              Create a new password for your account.
            </p>

            <form className="mt-5" onSubmit={handleSubmit}>
              <div className="my-3">
                <CustomInput
                  type="password"
                  label="New Password"
                  id="password"
                  placeholder="********"
                  value={form.password}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      password: e.target.value,
                    });

                    if (error) setError("");
                  }}
                  error={error}
                />
              </div>

              <div className="my-3">
                <CustomInput
                  type="password"
                  label="Confirm Password"
                  id="confirmPassword"
                  placeholder="********"
                  value={form.confirmPassword}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      confirmPassword: e.target.value,
                    });

                    if (error) setError("");
                  }}
                  error={error}
                />
              </div>

              <Link
                href="/login"
                className="text-sm text-accent hover:text-primary hover:underline"
              >
                Back to Login
              </Link>

              <div className="mt-8">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={resetPasswordPending}
                >
                  {resetPasswordPending ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="hidden md:block md:flex-2/4">
        <div className="bg-bg-muted w-full min-h-[60vh] sm:min-h-[70vh] md:min-h-[80vh] lg:h-[95vh] rounded-2xl sm:rounded-3xl relative overflow-hidden">
          <Image
            src={AuthImage}
            alt="Authentication Image"
            fill
            priority
            className="object-cover"
          />

          <div className="absolute inset-0 bg-linear-to-t from-accent/70 via-accent/30 to-transparent z-10" />
        </div>
      </div>
    </div>
  );
}
