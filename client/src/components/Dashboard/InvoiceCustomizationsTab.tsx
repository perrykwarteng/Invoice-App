"use client";

import { imageUrls } from "@/types/types";
import Button from "../ui/btn";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import Image from "next/image";
import { updateInvoiceCustomization } from "@/services/settings";
import { useSettingsStore } from "@/store/useStoreOrgSeetings";

type InvoiceCustomization = {
  primaryColor: string | null;
  secondaryColor: string | null;
  letterHeadHeaderImg: imageUrls | string | File | null;
  letterHeadFooterImg: imageUrls | string | File | null;
  signatureImg: imageUrls | string | File | null;
};

export default function InvoiceCustomization() {
  const { orgSettings } = useSettingsStore();

  const {
    mutate: invoiceCustomizationMutate,
    isPending: invoiceCustomizationPending,
  } = useMutation({
    mutationKey: ["InvoiceCustomization"],
    mutationFn: updateInvoiceCustomization,
    onSuccess: (data) => {
      toast.success(
        data?.message || "Invoice customization updated successfully",
      );
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update invoice customization");
    },
  });

  const [invoiceCustomSettings, setInvoiceCustomSettings] =
    useState<InvoiceCustomization>({
      primaryColor: orgSettings?.invoiceCustomization?.primaryColor,
      secondaryColor: orgSettings?.invoiceCustomization?.secondaryColor,
      letterHeadHeaderImg:
        orgSettings?.invoiceCustomization?.letterHeadHeaderImg,
      letterHeadFooterImg:
        orgSettings?.invoiceCustomization?.letterHeadFooterImg,
      signatureImg: orgSettings?.invoiceCustomization?.signatureImg,
    });

  const getAssetSrc = (asset: unknown): string | null => {
    if (!asset) return null;
    if (asset instanceof File) return URL.createObjectURL(asset);
    if (typeof asset === "string") return asset;
    if (typeof asset === "object" && asset !== null && "imageUrl" in asset) {
      return (asset as imageUrls).imageUrl;
    }
    return null;
  };

  const letterHeadSrc = getAssetSrc(invoiceCustomSettings.letterHeadHeaderImg);
  const letterFootertSrc = getAssetSrc(
    invoiceCustomSettings.letterHeadFooterImg,
  );
  const signatureSrc = getAssetSrc(invoiceCustomSettings.signatureImg);

  const handleInvCustomization = (
    key: keyof InvoiceCustomization,
    value: any,
  ) => {
    setInvoiceCustomSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append(
      "invoiceCustomization",
      JSON.stringify(invoiceCustomSettings),
    );

    if (invoiceCustomSettings.letterHeadHeaderImg instanceof File) {
      formData.append(
        "letterHeadHeaderImg",
        invoiceCustomSettings.letterHeadHeaderImg,
      );
    }
    if (invoiceCustomSettings.letterHeadFooterImg instanceof File) {
      formData.append(
        "letterHeadFooterImg",
        invoiceCustomSettings.letterHeadFooterImg,
      );
    }
    if (invoiceCustomSettings.signatureImg instanceof File) {
      formData.append("signatureImg", invoiceCustomSettings.signatureImg);
    }

    invoiceCustomizationMutate(formData);
  };

  return (
    <div className="rounded-2xl border border-accent/30 bg-white p-5 sm:p-6">
      <div>
        <h4 className="text-base font-semibold text-accent">Brand Colors</h4>
        <p className="mt-1 text-sm text-gray-500 mb-3">
          Customize the colors used in your invoices
        </p>

        <form onSubmit={handleCreateInvoice}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-md border border-accent/20 p-3 flex items-center gap-3">
              <label
                htmlFor="primaryColor"
                className="relative shrink-0 w-11 h-11 rounded-full border-2 border-white shadow ring-1 ring-accent/20 overflow-hidden cursor-pointer"
                style={{
                  backgroundColor:
                    invoiceCustomSettings.primaryColor ?? "#1f2937",
                }}
              >
                <input
                  id="primaryColor"
                  type="color"
                  value={invoiceCustomSettings.primaryColor ?? "#1f2937"}
                  onChange={(e) =>
                    handleInvCustomization("primaryColor", e.target.value)
                  }
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-accent">Primary Color</p>
                <p className="text-xs text-gray-500 truncate">
                  Headings, totals & accents
                </p>
              </div>
              {invoiceCustomSettings.primaryColor && (
                <button
                  type="button"
                  onClick={() => handleInvCustomization("primaryColor", null)}
                  className="text-xs text-gray-400 hover:text-red-500 shrink-0"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="bg-white rounded-md border border-accent/20 p-3 flex items-center gap-3">
              <label
                htmlFor="secondaryColor"
                className="relative shrink-0 w-11 h-11 rounded-full border-2 border-white shadow ring-1 ring-accent/20 overflow-hidden cursor-pointer"
                style={{
                  backgroundColor:
                    invoiceCustomSettings.secondaryColor ?? "#ffffff",
                }}
              >
                <input
                  id="secondaryColor"
                  type="color"
                  value={invoiceCustomSettings.secondaryColor ?? "#ffffff"}
                  onChange={(e) =>
                    handleInvCustomization("secondaryColor", e.target.value)
                  }
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-accent">
                  Secondary Color
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Invoice background
                </p>
              </div>
              {invoiceCustomSettings.secondaryColor && (
                <button
                  type="button"
                  onClick={() => handleInvCustomization("secondaryColor", null)}
                  className="text-xs text-gray-400 hover:text-red-500 shrink-0"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="mt-8">
            <h4 className="text-sm font-semibold text-accent uppercase tracking-wide mb-3">
              Images
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-md border border-accent/20 p-3">
                <div className="flex flex-col mb-2">
                  <label className="text-sm font-medium text-accent">
                    Letterhead Header Image
                  </label>
                  <p className="text-xs text-gray-400">
                    Upload a snapshot of your letterhead Header
                  </p>
                </div>

                {letterHeadSrc ? (
                  <div className="relative w-full h-20 rounded border border-accent/15 overflow-hidden bg-gray-50 mb-2">
                    <Image
                      src={letterHeadSrc}
                      alt="Letterhead preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-20 rounded border border-dashed border-accent/25 flex items-center justify-center text-xs text-gray-400 mb-2">
                    No letterhead Header uploaded
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="block w-full text-xs text-gray-600
                      file:mr-2 file:py-1.5 file:px-3
                      file:rounded-md file:border-0
                      file:bg-accent file:text-white file:text-xs
                      file:cursor-pointer hover:file:opacity-90"
                    onChange={(e) =>
                      handleInvCustomization(
                        "letterHeadHeaderImg",
                        e.target.files?.[0] || null,
                      )
                    }
                  />
                  {invoiceCustomSettings.letterHeadHeaderImg && (
                    <button
                      type="button"
                      onClick={() =>
                        handleInvCustomization("letterHeadHeaderImg", null)
                      }
                      className="text-xs text-gray-400 hover:text-red-500 shrink-0"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-md border border-accent/20 p-3">
                <div className="flex flex-col mb-2">
                  <label className="text-sm font-medium text-accent">
                    Letterhead Footer Image
                  </label>
                  <p className="text-xs text-gray-400">
                    Upload a snapshot of your letterhead footer
                  </p>
                </div>

                {letterFootertSrc ? (
                  <div className="relative w-full h-20 rounded border border-accent/15 overflow-hidden bg-gray-50 mb-2">
                    <Image
                      src={letterFootertSrc}
                      alt="Letterhead preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-20 rounded border border-dashed border-accent/25 flex items-center justify-center text-xs text-gray-400 mb-2">
                    No letterhead Footer uploaded
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="block w-full text-xs text-gray-600
                      file:mr-2 file:py-1.5 file:px-3
                      file:rounded-md file:border-0
                      file:bg-accent file:text-white file:text-xs
                      file:cursor-pointer hover:file:opacity-90"
                    onChange={(e) =>
                      handleInvCustomization(
                        "letterHeadFooterImg",
                        e.target.files?.[0] || null,
                      )
                    }
                  />
                  {invoiceCustomSettings.letterHeadFooterImg && (
                    <button
                      type="button"
                      onClick={() =>
                        handleInvCustomization("letterHeadFooterImg", null)
                      }
                      className="text-xs text-gray-400 hover:text-red-500 shrink-0"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-md border border-accent/20 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium text-accent">
                    Signature Image
                  </label>
                </div>

                {signatureSrc ? (
                  <div className="relative w-full h-20 rounded border border-accent/15 overflow-hidden bg-gray-50 mb-2">
                    <Image
                      src={signatureSrc}
                      alt="Signature preview"
                      fill
                      unoptimized
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-full h-20 rounded border border-dashed border-accent/25 flex items-center justify-center text-xs text-gray-400 mb-2">
                    No signature uploaded
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="block w-full text-xs text-gray-600
                      file:mr-2 file:py-1.5 file:px-3
                      file:rounded-md file:border-0
                      file:bg-accent file:text-white file:text-xs
                      file:cursor-pointer hover:file:opacity-90"
                    onChange={(e) =>
                      handleInvCustomization(
                        "signatureImg",
                        e.target.files?.[0] || null,
                      )
                    }
                  />
                  {invoiceCustomSettings.signatureImg && (
                    <button
                      type="button"
                      onClick={() =>
                        handleInvCustomization("signatureImg", null)
                      }
                      className="text-xs text-gray-400 hover:text-red-500 shrink-0"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button
              type="submit"
              variant="primary"
              disabled={invoiceCustomizationPending}
            >
              {invoiceCustomizationPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
