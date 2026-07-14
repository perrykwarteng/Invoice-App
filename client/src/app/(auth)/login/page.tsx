"use client";

import Button from "@/components/ui/btn";
import CustomInput from "@/components/ui/Input";
import Image from "next/image";
import Link from "next/link";
import AuthImage from "@/assets/images/authImage.jpg";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { LoginData, LoginSchema } from "@/utils/Zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { onLogin } from "@/services/auth";
import { toast } from "sonner";
import { useUserStore } from "@/store/useUserStore";
import { useAccessToken } from "@/store/useAccessTokenStore";
import { UserOrg } from "@/types/types";

export default function Login() {
  const route = useRouter();
  const { setUserInfo } = useUserStore();
  const { setAccessToken } = useAccessToken();

  const { mutate: LoginMutate, isPending } = useMutation({
    mutationKey: ["Login"],
    mutationFn: onLogin,
    onSuccess: (data) => {
      toast.success(data.message);
      let user: UserOrg = {
        user: data.data.user,
        org: data.data.organisation,
      };
      setUserInfo(user);
      setAccessToken(data.data.accessToken);
      route.push(user.user.role === "staff" ? "/invoices" : "/dashboard");
    },
    onError: (data) => {
      toast.error(data.message);
    },
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(LoginSchema),
    shouldUnregister: false,

    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (data: LoginData) => {
    if (!data) {
      return toast.error("Sorry email and password are required");
    }

    LoginMutate(data);
  };

  return (
    <div className="w-full h-screen bg-bg-light flex flex-col md:flex-row p-5">
      <div className="md:flex-2/4">
        <div className="text-primary">SwiftInvoice.</div>
        <div className="min-h-155 flex items-center justify-center">
          <div className="w-full md:w-[80%] lg:w-[60%]">
            <h3 className="text-3xl font-semibold text-secondary font-Saira">
              Welcom back to <br /> SwiftInvoice
            </h3>
            <form className="mt-5" onSubmit={handleSubmit(handleLogin)}>
              <div className="my-2">
                <CustomInput
                  type="text"
                  label="Email"
                  id="email"
                  placeholder="mark@gmail.com"
                  value={watch("email") || ""}
                  onChange={(e) => {
                    setValue("email", e.target.value, {
                      shouldDirty: true,
                      shouldTouch: true,
                    });
                  }}
                  error={errors.email?.message}
                />
              </div>
              <div className="my-3">
                <CustomInput
                  type="password"
                  label="Password"
                  id="password"
                  placeholder="**********"
                  value={watch("password") || ""}
                  onChange={(e) => {
                    setValue("password", e.target.value, {
                      shouldDirty: true,
                      shouldTouch: true,
                    });
                  }}
                  error={errors.password?.message}
                />
              </div>

              <Link
                href={"/forgotpassword"}
                className="text-sm text-accent hover:underline hover:text-primary transition-all duration-75 cursor-pointer"
              >
                Forgot your password?
              </Link>

              <div className="mt-8">
                <Button
                  variant="primary"
                  type="submit"
                  loading={isPending}
                  disabled={isSubmitting}
                >
                  Login
                </Button>
              </div>
            </form>

            <div className="flex items-center mt-8 gap-3">
              <div className="flex-1 h-px bg-gray-300"></div>
              <p className="text-center text-soft text-sm">
                Not Registered to SwiftInvoice?
              </p>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            <div className="mt-6">
              <Button variant="outline" onClick={() => route.push("/register")}>
                Open Account
              </Button>
            </div>
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
