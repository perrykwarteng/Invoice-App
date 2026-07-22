"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  PanelLeftClose,
  User,
  X,
} from "lucide-react";
import { SquareArrowRightExit } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, Dispatch, SetStateAction, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { onLogout } from "@/services/auth";
import { toast } from "sonner";
import { useUserStore } from "@/store/useUserStore";
import { ConfirmationModal } from "../ui/confirmationModal";
import { useSidebarStore } from "@/store/useSidebarToggleStore";

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: Dispatch<SetStateAction<boolean>>;
}

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    role: ["super_admin", "org_admin"],
  },
  {
    title: "Invoices",
    href: "/invoices",
    icon: FileText,
    role: ["super_admin", "org_admin", "staff"],
  },
  {
    title: "Users",
    href: "/users",
    icon: User,
    role: ["super_admin", "org_admin"],
  },
  {
    title: "Clients",
    href: "/clients",
    icon: Users,
    role: ["super_admin", "org_admin", "staff"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    role: ["super_admin", "org_admin", "staff"],
  },
];

export default function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const { userInfo } = useUserStore();
  const userRole = userInfo.user.role ?? "";
  const { toggle, setToggle } = useSidebarStore();

  const path = usePathname();
  const route = useRouter();

  const [openLogout, setOpenLogout] = useState(false);

  const { mutate: LogoutMutate, isPending } = useMutation({
    mutationKey: ["Logout"],
    mutationFn: onLogout,

    onSuccess: () => {
      toast.success("Logout Successfully");
      localStorage.clear();
      route.push("/login");
    },

    onError: (data) => {
      toast.error(toast.error(data.message));
    },
  });

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static
          z-50
          top-0 left-0
          h-screen
          bg-white
          border-r border-accent/10
          flex flex-col
          transition-all duration-300

          w-72

          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}

          ${toggle ? "lg:w-20" : "lg:w-72"}
        `}
      >
        <div
          className="
          flex items-center gap-x-1 justify-between
          border-b border-accent/10
          px-6 py-5
          h-20
        "
        >
          <h1 className="text-xl font-bold text-accent">
            {toggle ? "SI" : "SwiftInvoice"}
          </h1>

          <div className="flex items-center gap-2">
            <button
              className="
                hidden lg:block
                rounded-md p-1
                hover:bg-accent/10
              "
              onClick={() => setToggle()}
            >
              <PanelLeftClose
                className={`h-5 w-5 text-accent ${toggle ? "rotate-180" : ""}`}
              />
            </button>

            <button
              className="
                lg:hidden
                rounded-md p-2
                hover:bg-accent/10
              "
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5 text-accent" />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5">
          <ul className="space-y-2">
            {menuItems
              .filter((item) => item.role.includes(userRole))
              .map((item) => {
                const Icon = item.icon;
                const normalizedPath = path.replace(/\/$/, "");

                const activeNav =
                  normalizedPath === item.href ||
                  normalizedPath.startsWith(`${item.href}/`);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`
                        group
                        flex items-center gap-3
                        rounded-lg
                        px-4 py-3
                        text-sm font-medium
                        transition-all

                        ${
                          activeNav
                            ? "bg-accent text-white"
                            : "text-gray-600 hover:bg-bg-soft hover:text-accent"
                        }
                      `}
                    >
                      <Icon
                        size={18}
                        className="
                          transition-transform
                          group-hover:scale-110
                        "
                      />

                      {!toggle && <span>{item.title}</span>}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </nav>

        <div
          className="
          border-t border-accent/10
          p-5
        "
        >
          <button
            disabled={isPending}
            onClick={() => setOpenLogout(true)}
            className="
              w-full
              rounded-xl
              text-accent
              hover:text-red-500
              hover:bg-red-100
              bg-primary/5
              px-3 py-2
              flex items-center justify-between
              transition-all
            "
          >
            {!toggle && <p>Logout</p>}

            <SquareArrowRightExit className="w-4 h-4" />
          </button>
        </div>
      </aside>

      <ConfirmationModal
        open={openLogout}
        title="Log Out"
        message="Are you sure you want to log out?"
        onConfirm={() => LogoutMutate()}
        onCancel={() => setOpenLogout(false)}
      />
    </>
  );
}
