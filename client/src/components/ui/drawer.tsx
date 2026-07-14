import { ReactNode } from "react";
import { X } from "lucide-react";
import clsx from "clsx";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: "left" | "right";
  width?: "sm" | "md" | "lg" | "xl" | "xl2" | "full";
  closeOnBackdrop?: boolean;
};

const widths = {
  sm: "w-full sm:w-80",
  md: "w-full sm:w-96",
  lg: "w-full sm:w-[32rem]",
  xl: "w-full sm:w-[40rem]",
  xl2: "w-full sm:w-[50rem]",
  full: "w-full",
};

export const Drawer = ({
  open,
  onClose,
  title,
  children,
  footer,
  side = "right",
  width = "md",
  closeOnBackdrop = true,
}: DrawerProps) => {
  return (
    <div
      className={clsx(
        "fixed inset-0 z-50 transition-all duration-300",
        open ? "visible bg-black/40" : "invisible bg-transparent",
      )}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          "absolute top-0 h-full bg-white shadow-xl flex flex-col",
          "transition-transform duration-300 ease-in-out",
          widths[width],
          side === "right" ? "right-0" : "left-0",
          open
            ? "translate-x-0"
            : side === "right"
              ? "translate-x-full"
              : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b bg-accent px-4 py-3 sm:px-5 sm:py-4">
          <h2 className="truncate text-base font-semibold text-bg-soft sm:text-lg">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="rounded p-1 transition hover:bg-white/10"
          >
            <X className="text-bg-soft" size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5">{children}</div>

        {footer && (
          <div className="border-t border-accent/30 p-4 sm:p-5">{footer}</div>
        )}
      </div>
    </div>
  );
};
