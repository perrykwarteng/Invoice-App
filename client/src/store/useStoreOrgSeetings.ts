import { OrgSettingsType, PaymentMethod } from "@/types/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type SettingsType = OrgSettingsType;

export interface Settings {
  orgSettings: SettingsType;
  setOrSettings: (setting: SettingsType) => void;
}

export const useSettingsStore = create<Settings>()(
  persist(
    (set) => ({
      orgSettings: {
        defaultCurrency: "",
        invoicePrefix: "",
        nextInvoiceNumber: 0,
        paymentTermsDays: 0,
        paymentMethod: [],
        vatRate: "",
        nhilRate: "",
        getfundRate: "",
        companyName: null,
        companyAddress: null,
        companyPhone: null,
        companyEmail: null,
        companyWebsite: null,
        companyLogo: {
          imageUrl: "",
          public_id: "",
        },
        invoiceCustomization: {
          primaryColor: "",
          secondaryColor: "",
          letterHeadHeaderImg: null,
          letterHeadFooterImg: null,
          signatureImg: null,
        },
        invoiceFooter: null,
        extras: null,
      },

      setOrSettings: (sett: SettingsType) => {
        set(() => ({ orgSettings: sett }));
      },
    }),
    { name: "org-settings" },
  ),
);
