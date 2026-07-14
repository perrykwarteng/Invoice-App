import { ReactNode } from "react";
import { X } from "lucide-react";
import clsx from "clsx";

type ModalProps = {
  open: boolean;
  title?: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "full";
};

const sizes = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
  full: "sm:max-w-6xl",
};

export const Modal = ({
  open,
  title,
  children,
  onClose,
  footer,
  showCloseButton = true,
  closeOnBackdrop = true,
  size = "md",
}: ModalProps) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          "flex max-h-[90vh] w-full flex-col overflow-hidden rounded-xl bg-white shadow-xl",
          sizes[size],
        )}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between border-b bg-accent px-4 py-3 sm:px-6">
            <h2 className="truncate text-base font-semibold text-bg-soft sm:text-lg">
              {title}
            </h2>

            {showCloseButton && (
              <button
                onClick={onClose}
                className="rounded p-1 transition hover:bg-white/10"
              >
                <X className="text-bg-soft" size={20} />
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-none">
          {children}
        </div>

        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-accent/30 p-4 sm:flex-row sm:justify-end sm:p-5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
