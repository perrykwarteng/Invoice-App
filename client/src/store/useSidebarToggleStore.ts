import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SidebarToggle {
  toggle: boolean;
  setToggle: () => void;
}

export const useSidebarStore = create<SidebarToggle>()(
  persist(
    (set) => ({
      toggle: false,

      setToggle: () => {
        set((state) => ({
          toggle: !state.toggle,
        }));
      },
    }),
    { name: "toggle" },
  ),
);
