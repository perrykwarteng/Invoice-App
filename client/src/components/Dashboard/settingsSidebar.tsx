"use client";

export type SettingsTabId =
  | "company-profile"
  | "payment-methods"
  | "user-profile"
  | "change-password"
  | "invoice-customization";

export type SettingsTab = {
  id: SettingsTabId;
  label: string;
  description: string;
};

type SettingsSidebarProps = {
  tabs: SettingsTab[];
  activeTab: SettingsTabId;
  onTabChange: (tab: SettingsTabId) => void;
};

export default function SettingsSidebar({
  tabs,
  activeTab,
  onTabChange,
}: SettingsSidebarProps) {
  return (
    <nav className="w-full sm:w-64 shrink-0">
      <div className="flex sm:hidden gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-accent text-white"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="hidden sm:block rounded-2xl border border-accent/30 bg-white p-2">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-start gap-3 rounded-xl px-3 py-3 text-left transition my-1 ${
                isActive ? "bg-bg-soft" : "hover:bg-bg-soft/50"
              }`}
            >
              <span className="flex flex-col">
                <span
                  className={`text-sm font-semibold ${
                    isActive ? "text-gray-900" : "text-gray-700"
                  }`}
                >
                  {tab.label}
                </span>
                <span className="text-xs text-gray-500">{tab.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
