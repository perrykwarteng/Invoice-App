"use client";

import Button from "@/components/ui/btn";
import { BriefcaseBusiness } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import AuthImage from "@/assets/images/authImage.jpg";
import { useRouter } from "next/navigation";
import CustomInput from "@/components/ui/Input";
import Select from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { RegisterData, RegisterSchema } from "@/utils/Zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { onRegister } from "@/services/auth";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function Register() {
  const route = useRouter();
  const [isChecked, setIsChecked] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [email, setEmail] = useState<string>("");

  const { mutate: RegisterMutate, isPending } = useMutation({
    mutationKey: ["Organisation Registration"],
    mutationFn: onRegister,
    onSuccess: (data) => {
      const userId = data.data.userId;
      toast.success("Registered Successfully");
      localStorage.setItem("userId", userId);
      localStorage.setItem("email", email);
      route.push(`/verify?type=register`);
    },
    onError: (data) => {
      toast.error(data.message);
    },
  });

  const {
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: zodResolver(RegisterSchema),

    shouldUnregister: false,

    defaultValues: {
      orgName: "",
      orgType: "",
      orgEmail: "",
      adminName: "",
      adminEmail: "",
      adminPassword: "",
      adminConfirmPassword: "",
    },
  });

  const nextStep = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    let isValid = false;

    if (formStep === 1) {
      isValid = await trigger(["orgName", "orgType", "orgEmail"]);
    }

    if (formStep === 2) {
      isValid = await trigger(["adminName", "adminEmail"]);
    }

    if (formStep === 3) {
      isValid = await trigger(["adminPassword", "adminConfirmPassword"]);
    }

    if (isValid && formStep < 3) {
      setFormStep((prev) => prev + 1);
    }
  };

  const backStep = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (formStep > 1) {
      setFormStep((prev) => prev - 1);
    }
  };

  const onSubmit = async (data: RegisterData) => {
    if (!data) {
      return toast.error("All fields are required");
    }
    RegisterMutate(data);
  };

  return (
    <div className="w-full h-screen bg-bg-light flex flex-col md:flex-row md:items-center p-5">
      <div className="md:flex-2/4">
        <div className="text-primary">SwiftInvoice.</div>

        <div className="min-h-[85vh] flex items-center justify-center">
          <div className="w-full sm:w-[60%] md:w-[80%] lg:w-[60%]">
            <p className="text-secondary text-lg font-medium">
              {`${formStep}/3`}
            </p>

            <h2 className="text-3xl font-semibold text-secondary font-Saira">
              Get started with a <br />
              Invoice account
            </h2>

            <div
              className={`flex items-center justify-between p-3 border-2 rounded-xl cursor-pointer hover:border-primary transition mt-7 ${
                isChecked ? "border-primary bg-primary/5" : "border-gray-200"
              }`}
              onClick={() => setIsChecked(!isChecked)}
            >
              <div className="flex items-center gap-x-3">
                <div
                  className={`p-2 border-2 rounded-lg bg-gray-50 transition ${
                    isChecked ? "border-primary" : "border-gray-200"
                  }`}
                >
                  <BriefcaseBusiness
                    className={isChecked ? "text-primary" : "text-gray-500"}
                  />
                </div>

                <div>
                  <h3 className="text-accent font-semibold text-base">
                    Organizational Account
                  </h3>

                  <p className="text-sm text-gray-500">
                    Set up your organization in minutes
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={isChecked}
                className="w-5 h-5 accent-primary cursor-pointer"
                onChange={() => setIsChecked(!isChecked)}
              />
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              {isChecked && (
                <div className="mt-7">
                  {formStep === 1 && (
                    <div>
                      <h3 className="text-2xl font-semibold text-accent">
                        Organization Details
                      </h3>

                      <div className="mb-3 mt-4">
                        <CustomInput
                          type="text"
                          label="Organisation Name"
                          placeholder="eg; Ghana Red Cross"
                          id="orgName"
                          value={watch("orgName") || ""}
                          onChange={(e) => {
                            setValue("orgName", e.target.value, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                          }}
                          error={errors.orgName?.message}
                        />
                      </div>

                      <div className="mb-3">
                        <Select
                          list={[
                            "NGO",
                            "Business",
                            "School",
                            "Church",
                            "Healthcare",
                            "Government",
                          ]}
                          label="Select Organisation Type"
                          scrollHeight="max-h-40"
                          text="Select an option"
                          value={watch("orgType") || ""}
                          onChange={(value: string) =>
                            setValue("orgType", value, {
                              shouldValidate: true,
                              shouldDirty: true,
                            })
                          }
                          error={errors.orgType?.message}
                        />
                      </div>

                      <div className="mb-3">
                        <CustomInput
                          type="email"
                          label="Organisation Email"
                          placeholder="eg; example@gmail.com"
                          id="orgEmail"
                          value={watch("orgEmail") || ""}
                          onChange={(e) => {
                            setValue("orgEmail", e.target.value, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                          }}
                          error={errors.orgEmail?.message}
                        />
                      </div>
                    </div>
                  )}

                  {formStep === 2 && (
                    <div>
                      <h3 className="text-2xl font-semibold text-accent">
                        Admin Account
                      </h3>

                      <div className="my-3">
                        <CustomInput
                          type="text"
                          label="Admin Full Name"
                          placeholder="eg; Prince Owusu"
                          id="adminName"
                          value={watch("adminName") || ""}
                          onChange={(e) => {
                            setValue("adminName", e.target.value, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                          }}
                          error={errors.adminName?.message}
                        />
                      </div>

                      <div className="my-3">
                        <CustomInput
                          type="email"
                          label="Admin Email"
                          placeholder="eg; admin@gmail.com"
                          id="adminEmail"
                          value={watch("adminEmail") || ""}
                          onChange={(e) => {
                            setValue("adminEmail", e.target.value, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                            setEmail(e.target.value);
                          }}
                          error={errors.adminEmail?.message}
                        />
                      </div>
                    </div>
                  )}

                  {formStep === 3 && (
                    <div>
                      <h3 className="text-2xl font-semibold text-accent">
                        Admin Credentials
                      </h3>

                      <div className="my-3">
                        <CustomInput
                          type="password"
                          label="Admin Password"
                          placeholder="********"
                          id="adminPassword"
                          value={watch("adminPassword") || ""}
                          onChange={(e) => {
                            setValue("adminPassword", e.target.value, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                          }}
                          error={errors.adminPassword?.message}
                        />
                      </div>

                      <div className="my-3">
                        <CustomInput
                          type="password"
                          label="Confirm Password"
                          placeholder="********"
                          id="confirmPassword"
                          value={watch("adminConfirmPassword") || ""}
                          onChange={(e) => {
                            setValue("adminConfirmPassword", e.target.value, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                          }}
                          error={errors.adminConfirmPassword?.message}
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-between">
                    <div className="w-32">
                      {formStep > 1 && (
                        <Button variant="outline" onClick={backStep}>
                          Back
                        </Button>
                      )}
                    </div>

                    <div
                      className={`ml-auto ${formStep === 3 ? "w-40" : "w-32"}`}
                    >
                      <Button
                        variant="primary"
                        type={formStep === 3 ? "submit" : "button"}
                        onClick={formStep < 3 ? nextStep : undefined}
                        disabled={isSubmitting}
                        loading={isPending}
                      >
                        {formStep === 3
                          ? `${isPending ? "Loading..." : "Create Account"}`
                          : "Next"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {!isChecked && (
                <div>
                  <div className="flex items-center mt-8 gap-3">
                    <div className="flex-1 h-px bg-gray-300" />

                    <p className="text-center text-soft text-sm">
                      Already have an account?
                    </p>

                    <div className="flex-1 h-px bg-gray-300" />
                  </div>

                  <div className="mt-6">
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        route.push("/login");
                      }}
                    >
                      Login
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
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
