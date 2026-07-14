"use client";

import { useGreeting } from "@/hooks/greetHook";
import { getMe } from "@/services/users";
import { useUserStore } from "@/store/useUserStore";
import { useQuery } from "@tanstack/react-query";
import { Menu, User } from "lucide-react";
import Image from "next/image";

interface HeaderProps {
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Header({ setMobileOpen }: HeaderProps) {
  const { data: userData } = useQuery({
    queryKey: ["UserData"],
    queryFn: getMe,
    staleTime: 0,
  });

  const { userInfo } = useUserStore();
  const greeting = useGreeting();

  const profileImage = userData?.profilePic?.imageUrl ?? "/default-avatar.png";

  return (
    <header className="bg-white px-4 md:px-6 border-b border-gray-200 h-20">
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6 text-accent" />
          </button>

          <div>
            <p className="text-sm text-gray-500 font-medium">{greeting}</p>
            <h2 className="text-xl md:text-2xl font-semibold text-accent">
              {userData?.name || userInfo.user.name}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-gray-50 px-3 py-1 rounded-xl border border-gray-100 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              {userData?.profilePic !== null ? (
                <Image
                  src={profileImage}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <User />
              )}
            </div>

            <div className="hidden md:block">
              <h4 className="text-accent text-sm uppercase font-semibold">
                {userInfo.org.orgName}
              </h4>
              <p className="text-sm text-gray-500">{userInfo.user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
