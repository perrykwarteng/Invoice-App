import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface token {
  accessToken: string;
  setAccessToken: (token: string) => void;
}

export const useAccessToken = create<token>()(
  persist(
    (set) => ({
      accessToken: "",
      setAccessToken: (token: string) => {
        set(() => ({ accessToken: token }));
      },
    }),
    { name: "access-token", storage: createJSONStorage(() => localStorage) },
  ),
);
