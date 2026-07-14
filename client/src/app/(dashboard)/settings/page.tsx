"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import DashboardLayout from "@/components/layouts/DashboardLayout";

import CompanyProfileTab from "@/components/Dashboard/CompanyProfileTab";
import PaymentMethodsTab from "@/components/Dashboard/PaymentMethodsTab";
import UserProfileTab from "@/components/Dashboard/UserProfileTab";
import ChangePasswordTab from "@/components/Dashboard/ChangePasswordTab";
import InvoiceCustomization from "@/components/Dashboard/InvoiceCustomizationsTab";
import SettingsSidebar, {
  SettingsTab,
  SettingsTabId,
} from "@/components/Dashboard/settingsSidebar";
import { useUserStore } from "@/store/useUserStore";
import { useQuery } from "@tanstack/react-query";
import { getSettings } from "@/services/settings";
import { useSettingsStore } from "@/store/useStoreOrgSeetings";
import { getMe } from "@/services/users";

const tabs: SettingsTab[] = [
  {
    id: "company-profile",
    label: "Company profile",
    description: "Name, logo, invoice prefix",
  },
  {
    id: "payment-methods",
    label: "Payment methods",
    description: "Bank and Momo details",
  },
  {
    id: "invoice-customization",
    label: "Invoice Customization",
    description: "Customize the look of your invoices",
  },
  {
    id: "user-profile",
    label: "User profile",
    description: "Your name and email",
  },
  {
    id: "change-password",
    label: "Change password",
    description: "Update your login credentials",
  },
];

const staffTab: SettingsTab[] = [
  {
    id: "user-profile",
    label: "User profile",
    description: "Your name and email",
  },
  {
    id: "change-password",
    label: "Change password",
    description: "Update your login credentials",
  },
];

export default function Settings() {
  const { userInfo, setUser } = useUserStore();
  const { setOrSettings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<SettingsTabId>(
    userInfo.user.role === "org_admin" ? "company-profile" : "user-profile",
  );

  const { data: settingsData } = useQuery({
    queryKey: ["OrgSettings"],
    queryFn: getSettings,
  });

  const { data: userData } = useQuery({
    queryKey: ["User Data"],
    queryFn: getMe,
  });

  useEffect(() => {
    setUser(
      userData ?? {
        name: "",
        email: "",
        id: 0,
        isActive: false,
        role: "staff",
        profilePic: null,
      },
    );
    setOrSettings(settingsData!);
  }, [settingsData, userData]);

  return (
    <DashboardLayout>
      <div className="min-h-full">
        <div className="">
          <DashboardHeader title="Settings" />
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-6">
          <SettingsSidebar
            tabs={userInfo.user.role === "org_admin" ? tabs : staffTab}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="flex-1 min-w-0">
            {activeTab === "company-profile" && <CompanyProfileTab />}
            {activeTab === "payment-methods" && <PaymentMethodsTab />}
            {activeTab === "user-profile" && <UserProfileTab />}
            {activeTab === "change-password" && <ChangePasswordTab />}
            {activeTab === "invoice-customization" && <InvoiceCustomization />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
