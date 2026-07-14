"use client";

import { useEffect, useRef, useState } from "react";
import Button from "../ui/btn";
import CustomInput from "../ui/Input";
import { useSettingsStore } from "@/store/useStoreOrgSeetings";
import { useMutation } from "@tanstack/react-query";
import { updateCompanyProfile } from "@/services/settings";
import { toast } from "sonner";

export default function CompanyProfileTab() {
  const { orgSettings } = useSettingsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    invoicePrefix: "",
    name: "",
    email: "",
    address: "",
    website: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const { mutate: updateMutate, isPending: updatePending } = useMutation({
    mutationKey: ["UpdateCompanyProfile"],
    mutationFn: updateCompanyProfile,
    onSuccess: (data) => {
      toast.success(data?.message);
    },
    onError: (data) => {
      toast.error(data?.message);
    },
  });

  useEffect(() => {
    if (!orgSettings) return;

    setForm({
      invoicePrefix: orgSettings.invoicePrefix ?? "",
      name: orgSettings.companyName ?? "",
      email: orgSettings.companyEmail ?? "",
      address: orgSettings.companyAddress ?? "",
      website: orgSettings.companyWebsite ?? "",
    });

    setLogoPreview(orgSettings.companyLogo?.imageUrl ?? null);
  }, [orgSettings]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("address", form.address);
      formData.append("website", form.website);
      formData.append("invoicePrefix", form.invoicePrefix);

      if (logoFile) {
        formData.append("companyLogo", logoFile);
      }

      updateMutate(formData);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="rounded-2xl border border-accent/30 bg-white p-5 sm:p-6">
      <h2 className="text-base font-semibold text-gray-900">Company Profile</h2>

      <p className="mt-1 text-sm text-gray-500">
        This information appears on every invoice you send.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Company logo"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs text-gray-400">No logo</span>
            )}
          </div>

          <div className="w-40">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Logo
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoChange}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <CustomInput
            label="Company Name"
            id="companyName"
            type="text"
            value={form.name}
            placeholder="Azoma Ltd."
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("name", e.target.value)
            }
          />

          <CustomInput
            label="Invoice Prefix"
            id="invoicePrefix"
            type="text"
            value={form.invoicePrefix}
            placeholder="INV-"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("invoicePrefix", e.target.value)
            }
          />

          <CustomInput
            label="Company Email"
            id="companyEmail"
            type="email"
            value={form.email}
            placeholder="company@example.com"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("email", e.target.value)
            }
          />

          <CustomInput
            label="Company Website"
            id="companyWebsite"
            type="text"
            value={form.website}
            placeholder="https://company.com"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("website", e.target.value)
            }
          />

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-gray-600">
              Address
            </label>

            <textarea
              rows={3}
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 text-accent"
              placeholder="123 Ring Road East, Accra"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            disabled={updatePending}
            loading={updatePending}
          >
            {updatePending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
