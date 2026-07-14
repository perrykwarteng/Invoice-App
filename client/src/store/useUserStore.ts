import { User, UserOrg } from "@/types/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface userDetails {
  userInfo: UserOrg;
  user: User;
  setUserInfo: (user: UserOrg) => void;
  setUser: (user: User) => void;
}

export const useUserStore = create<userDetails>()(
  persist(
    (set) => ({
      userInfo: {
        user: {
          id: 0,
          name: "",
          email: "",
          isActive: false,
          profilePic: null,
          role: "staff",
        },
        org: {
          orgName: "",
          orgEmail: "",
        },
      },
      user: {
        id: 0,
        name: "",
        email: "",
        isActive: false,
        profilePic: null,
        role: "staff",
      },
      setUserInfo: (user: UserOrg) => {
        set(() => ({ userInfo: user, user: user.user }));
      },
      setUser: (user: User) => {
        set(() => ({ user: user }));
      },
    }),
    { name: "user-info" },
  ),
);
