"use client";

import Button from "@/components/ui/btn";
import { verifyOtp, resendOtp } from "@/services/auth";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const RESEND_COOLDOWN = 60;

export default function Verify() {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputsRef = useRef<Array<HTMLInputElement>>([]);
  const [otpValue, setOtpValue] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const route = useRouter();
  const searchParams = useSearchParams();

  const type =
    searchParams.get("type") ||
    (typeof window !== "undefined" ? localStorage.getItem("otpType") : "") ||
    "register";

  const email =
    (typeof window !== "undefined" ? localStorage.getItem("email") : "") || "";

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const { mutate: VerifyOtp, isPending } = useMutation({
    mutationKey: ["Verify Otp"],
    mutationFn: verifyOtp,
    onSuccess: () => {
      toast.success("Verified OTP successfully");
      route.push(`${type === "register" ? "/login" : "/resetPassword"}`);
    },
    onError: (data) => {
      toast.error(data.message);
    },
  });

  const { mutate: ResendOtp, isPending: isResending } = useMutation({
    mutationKey: ["Resend Otp"],
    mutationFn: resendOtp,
    onSuccess: () => {
      toast.success("A new code has been sent");
      setCooldown(RESEND_COOLDOWN);
      setOtp(Array(6).fill(""));
      setOtpValue("");
      inputsRef.current[0]?.focus();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Could not resend code");
    },
  });

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    const joinOtp = newOtp.join("");
    setOtpValue(joinOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: any, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const submitOtp = () => {
    if (otpValue.length !== 6) {
      toast.error("6 digits required");
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast.error("Session expired. Please register or log in again.");
      route.push("/login");
      return;
    }

    VerifyOtp({ otp: otpValue, userId: Number(userId), type });
  };

  const handleResend = () => {
    if (cooldown > 0 || isResending) return;

    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast.error("Session expired. Please register or log in again.");
      route.push("/login");
      return;
    }

    ResendOtp({ userId: Number(userId), type });
  };

  return (
    <div className="w-full h-screen bg-bg-light flex flex-col items-center justify-center p-5">
      <div className="text-primary dark:text-primary text-center">
        SwiftInvoice.
      </div>
      <div className="w-full md:w-[45%] bg-white p-6 rounded-2xl mt-7">
        <div className="text-center">
          <h3 className="text-3xl font-medium text-accent">Enter your code</h3>
          <p className="text-accent mt-1">
            We have sent a 6 digit OTP to{" "}
            <span className="font-semibold">{email || "your email"}</span>
          </p>
        </div>

        <div className="mt-5 flex justify-center">
          <div className="flex items-center gap-x-2">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el: HTMLInputElement) => {
                  inputsRef.current[i] = el;
                }}
                value={digit}
                maxLength={1}
                inputMode="numeric"
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                className="w-10 h-10 md:w-12 md:h-12 text-center border-2 border-accent rounded-lg text-lg bg-transparent text-accent"
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-y-1.5 items-center justify-center mt-5">
          <div>
            <Button
              variant="primary"
              className="px-10"
              onClick={submitOtp}
              loading={isPending}
              disabled={isPending}
            >
              {isPending ? "Verifying OTP..." : "Verify OTP"}
            </Button>
          </div>

          {cooldown > 0 ? (
            <p className="text-sm text-accent/70">Resend code in {cooldown}s</p>
          ) : (
            <p
              onClick={handleResend}
              className="cursor-pointer hover:underline transition-all duration-200 text-accent"
            >
              {isResending ? "Resending..." : "Resend Code"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
