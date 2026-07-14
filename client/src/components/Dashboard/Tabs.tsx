"use client";

import { useState } from "react";
import { Stat } from "./OverviewStats";

type Tab = {
  label: string;
  count?: number;
  color?: "default" | "warning" | "danger";
};

type InvoiceTabsProps = {
  onChange?: (tab: string) => void;
  data: Stat;
};

export default function InvoiceTabs({ onChange, data }: InvoiceTabsProps) {
  const tabs: Tab[] = [
    {
      label: "All Invoices",
    },
    {
      label: "Drafts",
      count: data.draftInvoices,
      color: "warning",
    },
    {
      label: "Overdue",
      count: data.overdueInvoices,
      color: "danger",
    },
  ];

  const [activeTab, setActiveTab] = useState("All Invoices");

  const getBadgeStyle = (color?: string) => {
    switch (color) {
      case "warning":
        return "bg-amber-100 text-amber-600";
      case "danger":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onChange?.(tab);
  };

  return (
    <div className="border-b border-accent/20">
      <div className="flex items-center gap-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => handleTabChange(tab.label)}
            className={`relative flex items-center gap-2 pb-3 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.label
                ? "text-accent"
                : "text-gray-500 hover:text-accent"
            }`}
          >
            {tab.label}

            {tab.count !== undefined && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getBadgeStyle(
                  tab.color,
                )}`}
              >
                {tab.count}
              </span>
            )}

            {activeTab === tab.label && (
              <div className="absolute bottom-0 left-0 h-0.5 w-full bg-accent rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
