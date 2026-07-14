import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
}

const Button = ({
  children,
  variant = "primary",
  type = "button",
  disabled = false,
  loading = false,
  className = "",
  leftIcon,
  rightIcon,
  ...props
}: ButtonProps) => {
  const baseStyles =
    "w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 cursor-pointer";

  const variants: Record<ButtonVariant, string> = {
    primary: "bg-accent text-white hover:bg-secondary duration-500",

    outline:
      "border-2 border-accent text-accent hover:bg-accent/10 duration-500",
  };

  const disabledStyles = "opacity-50 cursor-not-allowed pointer-events-none";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${disabled || loading ? disabledStyles : ""}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        "Loading..."
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
};

export default Button;
