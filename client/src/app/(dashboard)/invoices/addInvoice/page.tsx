"use client";

import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import Button from "@/components/ui/btn";
import CustomInput from "@/components/ui/Input";
import Select from "@/components/ui/select";
import ToggleSwitch from "@/components/ui/toggle";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { formatMoney } from "./formatMoney";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getClient } from "@/services/client";
import {
  ClientType,
  imageUrls,
  InvoiceCustomization,
  PaymentMethod,
} from "@/types/types";
import { toast } from "sonner";
import { createInvoice } from "@/services/invoice";
import { useRouter } from "next/navigation";
import { getSettings } from "@/services/settings";

export type SubItem = {
  id: string;
  subItemName: string;
  subItemPrice: number;
};

export type InvoiceItem = {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  subItems?: SubItem[];
};

export const CURRENCIES = ["GHS", "USD", "EUR", "GBP"];

export const makeEmptyItem = (): InvoiceItem => ({
  id: crypto.randomUUID(),
  itemName: "",
  quantity: 1,
  unitPrice: 0,
});

export const makeEmptySubItem = (): SubItem => ({
  id: crypto.randomUUID(),
  subItemName: "",
  subItemPrice: 0,
});

export const getSubItemsTotal = (subItems: SubItem[] = []): number =>
  subItems.reduce((sum, sub) => sum + sub.subItemPrice, 0);

const getLogoSrc = (logo: imageUrls | File | null): string | null => {
  if (!logo) return null;

  if (logo instanceof File) {
    return URL.createObjectURL(logo);
  }

  return logo.imageUrl;
};

const getAssetSrc = (asset: unknown): string | null => {
  if (!asset) return null;
  if (asset instanceof File) return URL.createObjectURL(asset);
  if (typeof asset === "string") return asset;
  if (typeof asset === "object" && asset !== null && "imageUrl" in asset) {
    return (asset as imageUrls).imageUrl;
  }
  return null;
};

const isSamePaymentMethod = (a: PaymentMethod, b: PaymentMethod): boolean => {
  if (a.paymentType !== b.paymentType) return false;
  if (a.paymentType === "Bank" && b.paymentType === "Bank") {
    return a.accountNumber === b.accountNumber;
  }
  if (a.paymentType === "Momo" && b.paymentType === "Momo") {
    return a.momoWallet === b.momoWallet;
  }
  return false;
};

type CompanySnapshot = {
  name: string;
  email: string;
  address: string;
  invoicePrefix: string;
  logo: File | imageUrls | null;
  paymentMethods: PaymentMethod[];
};

const SECTION_TOGGLES: {
  key: keyof InvoiceCustomization;
  label: string;
  description: string;
}[] = [
  {
    key: "showLogo",
    label: "Company Logo",
    description: "Show your logo in the header",
  },
  {
    key: "showLetterHead",
    label: "Letterhead",
    description: "Show the letterhead banner",
  },
  {
    key: "showSignature",
    label: "Signature",
    description: "Show a signature at the bottom",
  },
  {
    key: "showCompanySnapshot",
    label: "Company Snapshot",
    description: "Show your business details",
  },
  {
    key: "showPaymentMethods",
    label: "Payment Methods",
    description: "Show how you'd like to get paid",
  },
  { key: "showNotes", label: "Notes", description: "Show the notes section" },
  { key: "showTerms", label: "Terms", description: "Show payment terms" },
  {
    key: "showItemTable",
    label: "Item Table",
    description: "Show the line-item breakdown",
  },
];

export default function AddInvoice() {
  const routes = useRouter();
  const { data: clientData } = useQuery({
    queryKey: ["Clients"],
    queryFn: getClient,
    staleTime: 0,
  });

  const { data: settingsData } = useQuery({
    queryKey: ["OrgSettings"],
    queryFn: getSettings,
  });

  const [manualIvoNumber, setManualIvoNumber] = useState(true);
  const [customizeInvoice, setCustomizeInvoice] = useState(false);

  const invoicePrefix = settingsData?.invoicePrefix;
  const invoiceNextInvNumber = settingsData?.nextInvoiceNumber;

  const invoiceNumber = `${invoicePrefix ?? ""}${String(
    invoiceNextInvNumber ?? 0,
  ).padStart(4, "0")}`;

  const [isPreview, setIsPreview] = useState(false);

  const [invoiceCustomSettings, setInvoiceCustomSettings] =
    useState<InvoiceCustomization>({
      primaryColor: "",
      secondaryColor: "",
      letterHeadHeaderImg: null,
      letterHeadFooterImg: null,
      signatureImg: null,

      showLogo: true,
      showLetterHead: true,
      showSignature: true,
      showCompanySnapshot: true,
      showPaymentMethods: true,
      showNotes: true,
      showTerms: true,
      showItemTable: true,
    });

  const handleInvCustomization = (
    key: keyof InvoiceCustomization,
    value: any,
  ) => {
    setInvoiceCustomSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleInvCustomization = (key: keyof InvoiceCustomization) => {
    setInvoiceCustomSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const [form, setForm] = useState({
    invoiceNumber: invoiceNumber || "",
    clientId: 0,
    issueDate: "",
    dueDate: "",
    currency: "GHS",
  });

  useEffect(() => {
    if (manualIvoNumber) {
      setForm((prev) => ({ ...prev, invoiceNumber }));
    }
  }, [invoicePrefix, invoiceNextInvNumber, manualIvoNumber]);

  const [companySnapshot, setCompanySnapshot] = useState<CompanySnapshot>({
    name: "",
    email: "",
    address: "",
    invoicePrefix: "",
    logo: null,
    paymentMethods: [],
  });

  useEffect(() => {
    if (!settingsData) return;

    setCompanySnapshot((prev) => ({
      ...prev,
      name: settingsData.companyName ?? "",
      email: settingsData.companyEmail ?? "",
      address: settingsData.companyAddress ?? "",
      logo: settingsData.companyLogo ?? null,
    }));

    setInvoiceCustomSettings({
      primaryColor: settingsData?.invoiceCustomization?.primaryColor ?? "",
      secondaryColor: settingsData?.invoiceCustomization?.secondaryColor ?? "",
      letterHeadHeaderImg:
        settingsData?.invoiceCustomization?.letterHeadHeaderImg ?? null,
      letterHeadFooterImg:
        settingsData?.invoiceCustomization?.letterHeadFooterImg ?? null,
      signatureImg: settingsData.invoiceCustomization?.signatureImg ?? null,

      showLogo: true,
      showLetterHead: true,
      showSignature: true,
      showCompanySnapshot: true,
      showPaymentMethods: true,
      showNotes: true,
      showTerms: true,
      showItemTable: true,
    });
  }, [settingsData]);

  const togglePaymentMethod = (method: PaymentMethod) => {
    setCompanySnapshot((prev) => {
      const exists = prev.paymentMethods.some((m) =>
        isSamePaymentMethod(m, method),
      );
      return {
        ...prev,
        paymentMethods: exists
          ? prev.paymentMethods.filter((m) => !isSamePaymentMethod(m, method))
          : [...prev.paymentMethods, method],
      };
    });
  };

  const [client, setClient] = useState("");
  const [clientDetails, setClientDetails] = useState<ClientType>();

  const [items, setItems] = useState<InvoiceItem[]>([makeEmptyItem()]);

  const [summary, setSummary] = useState({
    discountValue: 0,
    vatPercentage: 0,
    nhilPercentage: 0,
    getfundPercentage: 0,
    notes: "",
    terms:
      "Payment of Service should be made in Cash / Cheque / Bank Deposit Transfer:",
  });

  const clientList = useMemo(
    () => clientData?.map(({ name }) => name) ?? [],
    [clientData],
  );

  useEffect(() => {
    const selectedClient = clientData?.find(
      (clientItem) => clientItem.name === client,
    );

    if (!selectedClient) return;

    setForm((prev) => ({ ...prev, clientId: selectedClient.id }));

    setClientDetails({
      name: selectedClient.name,
      email: selectedClient.email,
      address: selectedClient.address,
    });
  }, [client, clientData]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSummaryChange = (key: string, value: string) => {
    setSummary((prev) => ({
      ...prev,
      [key]: key === "notes" || key === "terms" ? value : Number(value),
    }));
  };

  const handleItemChange = (
    id: string,
    field: keyof Omit<InvoiceItem, "id">,
    value: string,
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (field === "unitPrice" && item.subItems) return item;

        return {
          ...item,
          [field]: field === "itemName" ? value : Math.max(0, Number(value)),
        };
      }),
    );
  };

  const addItem = () => {
    setItems((prev) => [...prev, makeEmptyItem()]);
  };

  const removeItem = (id: string) => {
    setItems((prev) =>
      prev.length === 1 ? prev : prev.filter((item) => item.id !== id),
    );
  };

  const toggleItemSubItems = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;

        if (item.subItems) {
          const { subItems, ...rest } = item;
          return rest;
        }

        const nextSubItems = [makeEmptySubItem()];
        return {
          ...item,
          subItems: nextSubItems,
          unitPrice: getSubItemsTotal(nextSubItems),
        };
      }),
    );
  };

  const addSubItem = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const nextSubItems = [...(item.subItems ?? []), makeEmptySubItem()];
        return {
          ...item,
          subItems: nextSubItems,
          unitPrice: getSubItemsTotal(nextSubItems),
        };
      }),
    );
  };

  const removeSubItem = (itemId: string, subItemId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId || !item.subItems) return item;
        if (item.subItems.length === 1) return item;
        const nextSubItems = item.subItems.filter((s) => s.id !== subItemId);
        return {
          ...item,
          subItems: nextSubItems,
          unitPrice: getSubItemsTotal(nextSubItems),
        };
      }),
    );
  };

  const handleSubItemChange = (
    itemId: string,
    subItemId: string,
    field: keyof Omit<SubItem, "id">,
    value: string,
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId || !item.subItems) return item;

        const nextSubItems = item.subItems.map((sub) =>
          sub.id === subItemId
            ? {
                ...sub,
                [field]:
                  field === "subItemName" ? value : Math.max(0, Number(value)),
              }
            : sub,
        );

        return {
          ...item,
          subItems: nextSubItems,
          unitPrice: getSubItemsTotal(nextSubItems),
        };
      }),
    );
  };

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    const discountValue = Math.min(summary.discountValue, subtotal);
    const taxableAmount = subtotal - discountValue;

    const vatAmount = (taxableAmount * summary.vatPercentage) / 100;
    const nhilAmount = (taxableAmount * summary.nhilPercentage) / 100;
    const getfundAmount = (taxableAmount * summary.getfundPercentage) / 100;
    const taxAmount = vatAmount + nhilAmount + getfundAmount;

    const totalAmount = taxableAmount + taxAmount;

    return {
      subtotal,
      discountValue,
      vatAmount,
      nhilAmount,
      getfundAmount,
      taxAmount,
      totalAmount,
    };
  }, [items, summary]);

  const resetForm = () => {
    setForm({
      invoiceNumber: "",
      clientId: 0,
      issueDate: "",
      dueDate: "",
      currency: "GHS",
    });
    setCompanySnapshot({
      name: "",
      email: "",
      address: "",
      invoicePrefix: "",
      logo: null,
      paymentMethods: [],
    });
    setClientDetails({
      name: "",
      email: "",
      address: "",
    });
    setSummary({
      discountValue: 0,
      vatPercentage: 0,
      nhilPercentage: 0,
      getfundPercentage: 0,
      notes: "",
      terms: "",
    });
    setItems([makeEmptyItem()]);
  };

  const { mutate: createInvoicesMutate, isPending: invoicePending } =
    useMutation({
      mutationKey: ["InvoiceCreate"],
      mutationFn: createInvoice,
      onSuccess: (data) => {
        toast.success(data.message);
        routes.push("/invoices");
        resetForm();
      },
      onError: (data: any) => {
        toast.error(data.message);
      },
    });

  const invoiceFormBuilder = (status: string) => {
    const formData = new FormData();

    formData.append("status", status);
    formData.append("invoiceNumber", String(form.invoiceNumber));

    if (form.clientId) {
      formData.append("clientId", String(form.clientId));
    }

    if (companySnapshot.logo instanceof File) {
      formData.append("companyLogo", companySnapshot.logo);
    }

    formData.append("currency", String(form.currency));
    formData.append("issueDate", String(form.issueDate));
    formData.append("dueDate", String(form.dueDate));

    formData.append("subtotal", String(totals.subtotal));
    formData.append("discountValue", String(totals.discountValue));
    formData.append("vatPercentage", String(summary.vatPercentage));
    formData.append("nhilPercentage", String(summary.nhilPercentage));
    formData.append("getfundPercentage", String(summary.getfundPercentage));
    formData.append("taxAmount", String(totals.taxAmount));
    formData.append("totalAmount", String(totals.totalAmount));
    formData.append("notes", String(summary.notes));
    formData.append("terms", String(summary.terms));
    formData.append("companySnapshot", JSON.stringify(companySnapshot));
    formData.append("invoiceItem", JSON.stringify(items));

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
    formData.append(
      "invoiceCustomization",
      JSON.stringify(invoiceCustomSettings),
    );

    return formData;
  };

  const handelCreateInvoice = (status: "saved" | "draft") => {
    if (!form.clientId) {
      toast.error("Please select a client");
      return;
    }

    invoiceFormBuilder(status);

    createInvoicesMutate(invoiceFormBuilder(status));
  };

  const logoSrc = getLogoSrc(companySnapshot.logo);
  const letterHeadHeaderSrc = getAssetSrc(
    invoiceCustomSettings.letterHeadHeaderImg,
  );
  const letterHeadFooterSrc = getAssetSrc(
    invoiceCustomSettings.letterHeadFooterImg,
  );
  const signatureSrc = getAssetSrc(invoiceCustomSettings.signatureImg);

  const previewPrimary = invoiceCustomSettings.primaryColor || undefined;
  const previewSecondary = invoiceCustomSettings.secondaryColor || undefined;

  const accentTextStyle = previewPrimary
    ? { color: previewPrimary }
    : undefined;
  const accentBorderStyle = previewPrimary
    ? { borderColor: previewPrimary }
    : undefined;
  const accentBgStyle = previewPrimary
    ? { backgroundColor: previewPrimary }
    : undefined;
  const cardBgStyle = previewSecondary
    ? { backgroundColor: previewSecondary }
    : undefined;

  return (
    <DashboardLayout>
      <div className="min-h-full">
        <Link
          href="/invoices"
          className="text-accent hover:underline transition-all duration-150 text-sm sm:text-base"
        >
          Back to Invoices
        </Link>

        <div className="mt-5">
          <DashboardHeader title="New Invoice">
            <div className="flex sm:flex-row items-stretch sm:items-center gap-3 sm:gap-x-4 w-full sm:w-auto  mt-2 md:mt-0">
              <div className="flex-1 flex items-center justify-between sm:justify-start gap-x-2">
                <p className="text-sm sm:text-md text-accent font-medium">
                  Show Preview
                </p>
                <ToggleSwitch
                  checked={isPreview}
                  disabled={false}
                  onChange={setIsPreview}
                />
              </div>
              <div className="w-full sm:w-auto flex-1">
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => handelCreateInvoice("draft")}
                >
                  Save as Draft
                </Button>
              </div>
            </div>
          </DashboardHeader>
        </div>

        <div className="flex flex-col md:flex-row md:items-start gap-4 sm:gap-5 mt-5">
          <div className="bg-white rounded-lg border-2 border-accent/30 p-3 sm:p-5 flex-1 w-full min-w-0 space-y-5 sm:space-y-6">
            <div>
              <h3 className="text-accent text-xl sm:text-2xl font-medium mb-4 sm:mb-5">
                Invoice Details
              </h3>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="w-full">
                  <CustomInput
                    label="Invoice Number"
                    type="text"
                    value={form.invoiceNumber}
                    disabled={manualIvoNumber}
                    placeholder="INV00123"
                    id="invoiceNumber"
                    onChange={(e: any) =>
                      handleChange("invoiceNumber", e.target.value)
                    }
                  />
                </div>

                <div className="w-full">
                  <Select
                    label="Client"
                    list={clientList}
                    text="Select a Client"
                    value={client}
                    onChange={(value: string) => setClient(value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-x-3 mt-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-primary cursor-pointer shrink-0"
                  id="manualInvNumber"
                  onChange={() => setManualIvoNumber(!manualIvoNumber)}
                />
                <label
                  htmlFor="manualInvNumber"
                  className="text-sm sm:text-base text-accent"
                >
                  Set Custom Invoice Number
                </label>
              </div>

              <div className="mt-4 sm:mt-3">
                <h3 className="text-accent text-xl sm:text-2xl font-medium mb-4 sm:mb-5">
                  Company Snapshot
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-accent">
                      Company Logo
                    </label>

                    <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3 sm:gap-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-accent/30 overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                        {logoSrc ? (
                          <Image
                            src={logoSrc}
                            alt="Company Logo"
                            width={80}
                            height={80}
                            unoptimized={
                              typeof companySnapshot.logo !== "string"
                            }
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-gray-400 text-center px-1">
                            No Logo
                          </span>
                        )}
                      </div>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          const MAX_SIZE = 2 * 1024 * 1024;

                          if (file.size > MAX_SIZE) {
                            toast.error("Image must be 2MB or less");
                            return;
                          }

                          setCompanySnapshot((prev) => ({
                            ...prev,
                            logo: file,
                          }));
                        }}
                        className="block w-full text-xs sm:text-sm text-gray-600
            file:mr-3 sm:file:mr-4 file:py-2 file:px-3 sm:file:px-4
            file:rounded-md file:border-0
            file:bg-accent file:text-white file:text-xs sm:file:text-sm
            file:cursor-pointer hover:file:opacity-90"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-x-3">
                    <CustomInput
                      label="Company Name"
                      type="text"
                      id="companyName"
                      placeholder="Company Name"
                      value={companySnapshot.name}
                      onChange={(e: any) =>
                        setCompanySnapshot((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />

                    <CustomInput
                      label="Company Email"
                      type="email"
                      id="companyEmail"
                      value={companySnapshot.email}
                      placeholder="Company Email"
                      onChange={(e: any) =>
                        setCompanySnapshot((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />

                    <CustomInput
                      label="Company Address"
                      type="text"
                      id="companyAddress"
                      placeholder="Company Address"
                      value={companySnapshot.address}
                      onChange={(e: any) =>
                        setCompanySnapshot((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="w-full">
                  <CustomInput
                    label="Issue Date"
                    type="date"
                    value={form.issueDate}
                    id="issueDate"
                    onChange={(e: any) =>
                      handleChange("issueDate", e.target.value)
                    }
                  />
                </div>

                <div className="w-full">
                  <CustomInput
                    label="Due Date"
                    type="date"
                    value={form.dueDate}
                    id="dueDate"
                    onChange={(e: any) =>
                      handleChange("dueDate", e.target.value)
                    }
                  />
                </div>

                <div className="w-full">
                  <Select
                    label="Currency"
                    list={CURRENCIES}
                    text="Select Currency"
                    value={form.currency}
                    onChange={(value: string) =>
                      handleChange("currency", value)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="w-full h-0.5 bg-accent/30"></div>

            <div>
              <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 mb-4">
                <h3 className="text-accent text-xl sm:text-2xl font-medium">
                  Invoice Items
                </h3>
                <div className="w-full flex justify-end">
                  <div className="w-full md:w-35">
                    <Button
                      variant="outline"
                      className="group w-full xs:w-auto"
                      leftIcon={
                        <Plus className="w-4 h-4 transition-transform duration-150 group-hover:rotate-90" />
                      }
                      onClick={addItem}
                    >
                      Add Item
                    </Button>
                  </div>
                </div>
              </div>

              <div className="hidden md:grid grid-cols-[1fr_100px_140px_140px_40px] gap-x-3 px-1 pb-2 text-sm font-medium text-gray-500">
                <span>Item Name</span>
                <span>Qty</span>
                <span>Unit Price</span>
                <span>Total</span>
                <span></span>
              </div>

              <div className="space-y-3">
                {items.map((item) => {
                  const lineTotal = item.quantity * item.unitPrice;
                  const hasSubItems = Boolean(item.subItems);
                  return (
                    <div key={item.id} className="space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_100px_140px_140px_40px] gap-3 items-start md:items-center border border-accent/15 rounded-md p-3 md:border-0 md:p-0">
                        <div>
                          <label className="block md:hidden text-xs font-medium text-gray-500 mb-1">
                            Item Name
                          </label>
                          <CustomInput
                            type="text"
                            id={`itemName`}
                            placeholder="Item or service name"
                            value={item.itemName}
                            onChange={(e: any) =>
                              handleItemChange(
                                item.id,
                                "itemName",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <div className="grid grid-cols-2 md:contents gap-3">
                          <div>
                            <label className="block md:hidden text-xs font-medium text-gray-500 mb-1">
                              Qty
                            </label>
                            <CustomInput
                              type="number"
                              id={`quantity`}
                              placeholder="1"
                              value={item.quantity}
                              onChange={(e: any) =>
                                handleItemChange(
                                  item.id,
                                  "quantity",
                                  e.target.value,
                                )
                              }
                            />
                          </div>

                          <div>
                            <label className="block md:hidden text-xs font-medium text-gray-500 mb-1">
                              Unit Price
                            </label>
                            <CustomInput
                              type="number"
                              id={`unitPrice`}
                              placeholder="0.00"
                              value={item.unitPrice}
                              disabled={hasSubItems}
                              onChange={(e: any) =>
                                handleItemChange(
                                  item.id,
                                  "unitPrice",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:block">
                          <div>
                            <span className="md:hidden text-xs font-medium text-gray-500 mr-2">
                              Total:
                            </span>
                            <span className="text-accent font-medium px-0 md:px-1">
                              {formatMoney(lineTotal, form.currency)}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            disabled={items.length === 1}
                            className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded-md text-red-500 hover:bg-red-50 transition disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                          className="hidden md:inline-flex items-center justify-center w-8 h-8 rounded-md text-red-500 hover:bg-red-50 transition disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="pl-1">
                        <button
                          type="button"
                          onClick={() => toggleItemSubItems(item.id)}
                          className="text-xs text-accent hover:underline"
                        >
                          {hasSubItems ? "− Remove Subitems" : "+ Add Subitems"}
                        </button>
                      </div>

                      {hasSubItems && (
                        <div className="border border-accent/15 rounded-md p-3 ml-0 md:ml-6 bg-accent/3 space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-medium text-gray-500">
                              Subitems
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              className="text-xs py-2! px-2!"
                              leftIcon={<Plus className="w-3 h-3" />}
                              onClick={() => addSubItem(item.id)}
                            >
                              Add Subitem
                            </Button>
                          </div>

                          <div className="space-y-2">
                            {item.subItems!.map((sub) => (
                              <div
                                key={sub.id}
                                className="grid grid-cols-1 md:grid-cols-[1fr_140px_40px] gap-2 items-center"
                              >
                                <CustomInput
                                  type="text"
                                  id="subItemName"
                                  placeholder="Subitem name"
                                  value={sub.subItemName}
                                  onChange={(e: any) =>
                                    handleSubItemChange(
                                      item.id,
                                      sub.id,
                                      "subItemName",
                                      e.target.value,
                                    )
                                  }
                                />
                                <CustomInput
                                  type="number"
                                  id="subItemPrice"
                                  placeholder="0.00"
                                  value={sub.subItemPrice}
                                  onChange={(e: any) =>
                                    handleSubItemChange(
                                      item.id,
                                      sub.id,
                                      "subItemPrice",
                                      e.target.value,
                                    )
                                  }
                                />
                                <button
                                  type="button"
                                  onClick={() => removeSubItem(item.id, sub.id)}
                                  disabled={item.subItems!.length === 1}
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-md text-red-500 hover:bg-red-50 transition disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                                  aria-label="Remove subitem"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-accent/10">
                            <span>Subitems Total</span>
                            <span className="font-medium text-accent">
                              {formatMoney(
                                getSubItemsTotal(item.subItems),
                                form.currency,
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="w-full h-0.5 bg-accent/30"></div>

            <div className="flex flex-col md:flex-row gap-5 sm:gap-6">
              <div className="flex-1 space-y-3">
                <h3 className="text-accent text-xl sm:text-2xl font-medium mb-2">
                  Adjustments
                </h3>

                <CustomInput
                  label="Discount"
                  type="number"
                  id="discountValue"
                  value={summary.discountValue}
                  onChange={(e: any) =>
                    handleSummaryChange("discountValue", e.target.value)
                  }
                />

                <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-x-3">
                  <CustomInput
                    label="VAT %"
                    type="number"
                    id="vatPercentage"
                    value={summary.vatPercentage}
                    onChange={(e: any) =>
                      handleSummaryChange("vatPercentage", e.target.value)
                    }
                  />
                  <CustomInput
                    label="NHIL %"
                    type="number"
                    id="nhilPercentage"
                    value={summary.nhilPercentage}
                    onChange={(e: any) =>
                      handleSummaryChange("nhilPercentage", e.target.value)
                    }
                  />
                  <CustomInput
                    label="GETFund %"
                    type="number"
                    id="getfundPercentage"
                    value={summary.getfundPercentage}
                    onChange={(e: any) =>
                      handleSummaryChange("getfundPercentage", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="flex-1 bg-accent/5 rounded-lg p-4 space-y-2 h-fit">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-accent">
                    {formatMoney(totals.subtotal, form.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-red-500">
                    -{formatMoney(totals.discountValue, form.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    VAT ({summary.vatPercentage || 0}%)
                  </span>
                  <span className="font-medium text-accent">
                    {formatMoney(totals.vatAmount, form.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    NHIL ({summary.nhilPercentage || 0}%)
                  </span>
                  <span className="font-medium text-accent">
                    {formatMoney(totals.nhilAmount, form.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    GETFund ({summary.getfundPercentage || 0}%)
                  </span>
                  <span className="font-medium text-accent">
                    {formatMoney(totals.getfundAmount, form.currency)}
                  </span>
                </div>
                <div className="w-full h-px bg-accent/20 my-1"></div>
                <div className="flex items-center justify-between text-base sm:text-lg">
                  <span className="text-accent font-semibold">Total</span>
                  <span className="text-accent font-bold">
                    {formatMoney(totals.totalAmount, form.currency)}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full h-0.5 bg-accent/30"></div>

            {settingsData?.paymentMethod &&
              settingsData.paymentMethod.length > 0 && (
                <div className="mt-5">
                  <h3 className="text-accent text-xl sm:text-2xl font-medium mb-3">
                    Payment Method
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(settingsData.paymentMethod as PaymentMethod[]).map(
                      (method, index) => {
                        const isSelected = companySnapshot.paymentMethods.some(
                          (m) => isSamePaymentMethod(m, method),
                        );

                        return (
                          <div
                            key={index}
                            role="checkbox"
                            aria-checked={isSelected}
                            tabIndex={0}
                            onClick={() => togglePaymentMethod(method)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                togglePaymentMethod(method);
                              }
                            }}
                            className={`cursor-pointer rounded-md border p-3 transition-all duration-150 ${
                              isSelected
                                ? "border-accent bg-accent/5"
                                : "border-accent/20 hover:border-accent/40"
                            }`}
                          >
                            <div className="flex items-center gap-x-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => togglePaymentMethod(method)}
                                className="w-4 h-4 accent-primary cursor-pointer shrink-0"
                              />
                              <p className="font-medium text-accent text-sm sm:text-base">
                                {method.paymentType === "Bank"
                                  ? "Bank Transfer"
                                  : "Mobile Money"}
                              </p>
                            </div>

                            {method.paymentType === "Bank" ? (
                              <div className="mt-2 text-xs sm:text-sm text-gray-600 space-y-0.5 wrap-break-word">
                                <p>Bank: {method.bankName}</p>
                                <p>Branch: {method.bankBranch}</p>
                                <p>Account Name: {method.accountName}</p>
                                <p>Account Number: {method.accountNumber}</p>
                              </div>
                            ) : (
                              <div className="mt-2 text-xs sm:text-sm text-gray-600 space-y-0.5 wrap-break-word">
                                <p>Network: {method.momoVendor}</p>
                                <p>Name: {method.momoName}</p>
                                <p>Wallet: {method.momoWallet}</p>
                              </div>
                            )}
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              )}

            <div className="w-full h-0.5 bg-accent/30"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-accent">
                  Notes
                </label>
                <textarea
                  className="w-full rounded-md border border-accent/30 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 min-h-25 text-accent"
                  placeholder="Thank you for your business..."
                  value={summary.notes}
                  maxLength={1000}
                  onChange={(e) => handleSummaryChange("notes", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-accent">
                  Terms
                </label>
                <textarea
                  className="w-full rounded-md border border-accent/30 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 min-h-25 text-accent"
                  placeholder="Payment due within 14 days..."
                  value={summary.terms}
                  maxLength={1000}
                  onChange={(e) => handleSummaryChange("terms", e.target.value)}
                />
              </div>
            </div>

            <div className="w-full h-0.5 bg-accent/30"></div>

            <div className="flex items-center justify-between gap-3 mt-3">
              <div>
                <p className="text-sm sm:text-base font-medium text-accent">
                  Customize Your Invoice
                </p>
                <p className="text-xs text-gray-500">
                  Brand colors, letterhead, signature, and which sections show
                  up.
                </p>
              </div>
              <ToggleSwitch
                checked={customizeInvoice}
                disabled={false}
                onChange={setCustomizeInvoice}
              />
            </div>

            {customizeInvoice && (
              <div className="rounded-lg border border-accent/20 bg-accent/3 p-3 sm:p-5 space-y-6">
                <div>
                  <h3 className="text-accent text-lg sm:text-xl font-medium">
                    Customize Invoice
                  </h3>
                  <p className="text-sm text-gray-500">
                    Changes here update the live preview on the right.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-accent uppercase tracking-wide mb-3">
                    Brand Colors
                  </h4>
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
                          value={
                            invoiceCustomSettings.primaryColor ?? "#1f2937"
                          }
                          onChange={(e) =>
                            handleInvCustomization(
                              "primaryColor",
                              e.target.value,
                            )
                          }
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </label>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-accent">
                          Primary Color
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          Headings, totals &amp; accents
                        </p>
                      </div>
                      {invoiceCustomSettings.primaryColor && (
                        <button
                          type="button"
                          onClick={() =>
                            handleInvCustomization("primaryColor", null)
                          }
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
                          value={
                            invoiceCustomSettings.secondaryColor ?? "#ffffff"
                          }
                          onChange={(e) =>
                            handleInvCustomization(
                              "secondaryColor",
                              e.target.value,
                            )
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
                          onClick={() =>
                            handleInvCustomization("secondaryColor", null)
                          }
                          className="text-xs text-gray-400 hover:text-red-500 shrink-0"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-accent uppercase tracking-wide mb-3">
                    Images
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white rounded-md border border-accent/20 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <label className="text-sm font-medium text-accent">
                          Letterhead Header Image
                        </label>
                      </div>

                      {letterHeadHeaderSrc ? (
                        <div className="relative w-full h-20 rounded border border-accent/15 overflow-hidden bg-gray-50 mb-2">
                          <Image
                            src={letterHeadHeaderSrc}
                            alt="Letterhead preview"
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-20 rounded border border-dashed border-accent/25 flex items-center justify-center text-xs text-gray-400 mb-2">
                          No letterhead uploaded
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
                              handleInvCustomization(
                                "letterHeadHeaderImg",
                                null,
                              )
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
                          Letterhead Footer Image
                        </label>
                      </div>

                      {letterHeadFooterSrc ? (
                        <div className="relative w-full h-20 rounded border border-accent/15 overflow-hidden bg-gray-50 mb-2">
                          <Image
                            src={letterHeadFooterSrc}
                            alt="Letterhead preview"
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-20 rounded border border-dashed border-accent/25 flex items-center justify-center text-xs text-gray-400 mb-2">
                          No letterhead uploaded
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
                              handleInvCustomization(
                                "letterHeadFooterImg",
                                null,
                              )
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

                <div>
                  <h4 className="text-sm font-semibold text-accent uppercase tracking-wide mb-3">
                    Invoice Sections
                  </h4>
                  <div className="bg-white rounded-md border border-accent/20 divide-y divide-accent/10">
                    {SECTION_TOGGLES.map(({ key, label, description }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between gap-3 px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-accent">
                            {label}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {description}
                          </p>
                        </div>
                        <ToggleSwitch
                          checked={Boolean(invoiceCustomSettings[key])}
                          disabled={false}
                          onChange={() => toggleInvCustomization(key)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end">
              <div className="w-full sm:w-40">
                <Button
                  type="submit"
                  loading={invoicePending}
                  disabled={invoicePending}
                  className="w-full"
                  onClick={() => handelCreateInvoice("saved")}
                >
                  Create Invoice
                </Button>
              </div>
            </div>
          </div>

          {isPreview && (
            <div
              className="bg-bg-muted rounded-lg border-2 border-accent/30 p-3 sm:p-5 flex-1 w-full min-w-0 md:sticky md:top-5"
              style={{
                backgroundImage:
                  "radial-gradient(#77777760 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            >
              <h3 className="text-accent text-xl sm:text-2xl font-medium my-4 sm:my-5">
                Preview
              </h3>

              <div
                className="rounded-lg border-2 border-accent/30"
                style={{ backgroundColor: previewSecondary ?? "#ffffff" }}
              >
                {invoiceCustomSettings.showLetterHead &&
                  letterHeadHeaderSrc && (
                    <div className="relative w-full h-16 sm:h-36 overflow-hidden">
                      <Image
                        src={letterHeadHeaderSrc}
                        alt="Letterhead"
                        fill
                        unoptimized
                        className="object-fill"
                      />
                    </div>
                  )}

                <div className="p-3 sm:p-3.5 space-y-4 sm:space-y-5 overflow-x-auto">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3
                        className="text-accent text-2xl sm:text-4xl font-medium"
                        style={accentTextStyle}
                      >
                        Invoice
                      </h3>
                      <p
                        className="text-sm sm:text-lg text-accent font-medium mt-1 wrap-break-word"
                        style={accentTextStyle}
                      >
                        Invoice Number:{" "}
                        <span className="uppercase text-gray-600 text-xs sm:text-md">
                          {form.invoiceNumber}
                        </span>
                      </p>
                    </div>
                    {invoiceCustomSettings.showLogo && (
                      <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full shrink-0 bg-gray-100 flex items-center justify-center overflow-hidden">
                        {logoSrc ? (
                          <Image
                            src={logoSrc}
                            alt="Company Logo"
                            width={80}
                            height={80}
                            unoptimized={
                              typeof companySnapshot.logo !== "string"
                            }
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-gray-400 text-center px-1">
                            No Logo
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-8 sm:gap-x-20 gap-y-3">
                    <div className="flex flex-col">
                      <p
                        className="text-sm sm:text-md text-accent font-medium"
                        style={accentTextStyle}
                      >
                        Issue Date:
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 ">
                        {form.issueDate || "No Date"}
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <p
                        className="text-sm sm:text-md text-accent font-medium"
                        style={accentTextStyle}
                      >
                        Due Date:
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {form.dueDate || "No Date"}
                      </p>
                    </div>
                  </div>
                  <div className="w-full h-px bg-accent/20"></div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {invoiceCustomSettings.showCompanySnapshot && (
                      <div className="flex flex-col min-w-0">
                        <p
                          className="text-sm sm:text-md text-accent font-medium"
                          style={accentTextStyle}
                        >
                          Billed By:
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 wrap-break-word">
                          Name: {companySnapshot.name || "Name Not Provided"}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 wrap-break-word">
                          Email: {companySnapshot.email || "Email Not Provided"}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 wrap-break-word">
                          Address:{" "}
                          {companySnapshot.address || "Address Not Provided"}
                        </p>
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <p
                        className="text-sm sm:text-md text-accent font-medium"
                        style={accentTextStyle}
                      >
                        Billed To:
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 wrap-break-word">
                        Name: {clientDetails?.name || "Name Not Provided"}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 wrap-break-word">
                        Email: {clientDetails?.email || "Email Not Provided"}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 wrap-break-word">
                        Address:{" "}
                        {clientDetails?.address || "Address Not Provided"}
                      </p>
                    </div>
                  </div>
                  {invoiceCustomSettings.showItemTable && (
                    <>
                      <div className="w-full h-px bg-accent/20"></div>
                      <div className="min-w-120 sm:min-w-0">
                        <div
                          className="grid grid-cols-[1fr_50px_90px_90px] gap-x-4 sm:gap-x-10 text-xs font-medium text-bg-light bg-accent py-2 px-3 sm:px-7"
                          style={accentBgStyle}
                        >
                          <span>Item</span>
                          <span className="text-right">Qty</span>
                          <span className="text-right">Price</span>
                          <span className="text-right">Total</span>
                        </div>
                        <div className="space-y-1.5">
                          {items
                            .filter((item) => item.itemName.trim() !== "")
                            .map((item) => (
                              <div key={item.id} className="px-3 sm:px-7 mt-1">
                                <div className="grid grid-cols-[1fr_50px_90px_90px] gap-x-4 sm:gap-x-10 text-sm">
                                  <span className="truncate text-accent">
                                    {item.itemName}
                                  </span>
                                  <span className="text-right text-accent">
                                    {item.quantity}
                                  </span>
                                  <span className="text-right text-accent">
                                    {formatMoney(item.unitPrice, form.currency)}
                                  </span>
                                  <span className="text-right font-medium text-accent">
                                    {formatMoney(
                                      item.quantity * item.unitPrice,
                                      form.currency,
                                    )}
                                  </span>
                                </div>
                                {item.subItems &&
                                  item.subItems.filter(
                                    (s) => s.subItemName.trim() !== "",
                                  ).length > 0 && (
                                    <div className="mt-0.5 space-y-0.5">
                                      {item.subItems
                                        .filter(
                                          (s) => s.subItemName.trim() !== "",
                                        )
                                        .map((s) => (
                                          <div
                                            key={s.id}
                                            className="flex items-center justify-between text-xs text-gray-500 pl-3"
                                          >
                                            <span className="truncate">
                                              — {s.subItemName}
                                            </span>
                                            <span>
                                              {formatMoney(
                                                s.subItemPrice,
                                                form.currency,
                                              )}
                                            </span>
                                          </div>
                                        ))}
                                    </div>
                                  )}
                              </div>
                            ))}
                          {items.every(
                            (item) => item.itemName.trim() === "",
                          ) && (
                            <p className="text-sm text-gray-400 italic mt-1 px-3 sm:px-0">
                              No items added yet
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                  <div className="w-full h-px bg-accent/20"></div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">Subtotal</span>
                      <span className="text-gray-800" style={accentTextStyle}>
                        {formatMoney(totals.subtotal, form.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">Discount</span>
                      <span className="text-red-500">
                        -{formatMoney(totals.discountValue, form.currency)}
                      </span>
                    </div>
                    <div className="flex items-start sm:items-center justify-between text-sm gap-3">
                      <span className="text-gray-700">
                        Tax(VAT, GETFund, NHIL):
                        {summary?.vatPercentage +
                          summary?.getfundPercentage +
                          summary?.nhilPercentage}
                        %
                      </span>
                      <span
                        className="shrink-0 text-gray-800"
                        style={accentTextStyle}
                      >
                        {formatMoney(totals.taxAmount, form.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-base sm:text-lg mt-2">
                      <span
                        className="text-accent font-semibold"
                        style={accentTextStyle}
                      >
                        Total
                      </span>
                      <span
                        className="text-gray-800 font-bold"
                        style={accentTextStyle}
                      >
                        {formatMoney(totals.totalAmount, form.currency)}
                      </span>
                    </div>
                  </div>
                  {((invoiceCustomSettings.showNotes && summary.notes) ||
                    (invoiceCustomSettings.showTerms && summary.terms)) && (
                    <>
                      <div className="w-full h-px bg-accent/20"></div>
                      {invoiceCustomSettings.showNotes && summary.notes && (
                        <div>
                          <p className="text-xs font-medium text-gray-500">
                            Notes
                          </p>
                          <p className="text-sm text-gray-800 whitespace-pre-wrap wrap-break-word">
                            {summary.notes}
                          </p>
                        </div>
                      )}
                      {invoiceCustomSettings.showTerms && summary.terms && (
                        <div>
                          <p className="text-xs font-medium text-gray-500">
                            Terms
                          </p>
                          <p className="text-sm text-gray-800 whitespace-pre-wrap wrap-break-word">
                            {summary.terms}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                  {invoiceCustomSettings.showPaymentMethods &&
                    companySnapshot.paymentMethods.length > 0 && (
                      <>
                        <div className="w-full h-px bg-accent/20"></div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-2">
                            Payment Method
                            {companySnapshot.paymentMethods.length > 1
                              ? "s"
                              : ""}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
                            {companySnapshot.paymentMethods.map(
                              (method, index) => (
                                <div
                                  key={index}
                                  className="text-sm text-gray-700 space-y-0.5 flex-1 min-w-0 sm:min-w-45 wrap-break-word"
                                >
                                  <p
                                    className="font-medium text-accent"
                                    style={accentTextStyle}
                                  >
                                    {method.paymentType === "Bank"
                                      ? "Bank Transfer"
                                      : "Mobile Money"}
                                  </p>
                                  {method.paymentType === "Bank" ? (
                                    <>
                                      <p>Bank: {method.bankName}</p>
                                      <p>Branch: {method.bankBranch}</p>
                                      <p>Account Name: {method.accountName}</p>
                                      <p>
                                        Account Number: {method.accountNumber}
                                      </p>
                                    </>
                                  ) : (
                                    <>
                                      <p>Network: {method.momoVendor}</p>
                                      <p>Name: {method.momoName}</p>
                                      <p>Wallet: {method.momoWallet}</p>
                                    </>
                                  )}
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  {invoiceCustomSettings.showSignature && signatureSrc && (
                    <>
                      <div className="w-full h-px bg-accent/20"></div>
                      <div className="flex flex-col items-end">
                        <div className="relative w-32 h-14 sm:w-40 sm:h-16">
                          <Image
                            src={signatureSrc}
                            alt="Signature"
                            fill
                            unoptimized
                            className="object-contain object-right"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Authorized Signature
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {invoiceCustomSettings.showLetterHead &&
                  letterHeadFooterSrc && (
                    <div className="relative w-full h-16 sm:h-36 overflow-hidden">
                      <Image
                        src={letterHeadFooterSrc}
                        alt="Letterhead"
                        fill
                        unoptimized
                        className="object-fill"
                      />
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
