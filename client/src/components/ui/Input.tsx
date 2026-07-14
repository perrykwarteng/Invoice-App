import { useState, ChangeEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface CustomInputProps {
  label?: string;
  id?: string;
  type?: "text" | "email" | "password" | "number" | "date";
  name?: string;
  placeholder?: string;
  value?: string | number;
  disabled?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  success?: string;
  icon?: LucideIcon;
  styles?: string;
  textStyle?: string;
  max?: number;
}

export default function CustomInput({
  label,
  id,
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  error,
  success,
  disabled,
  icon: Icon,
  styles,
  textStyle,
  max,
}: CustomInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block mb-1 text-accent font-medium">
          {label}
        </label>
      )}

      <div
        className={`flex items-center border-2 rounded-lg px-3 py-2.5 transition ${styles} ${disabled ? "bg-bg-soft" : ""}
        ${
          error
            ? "border-red-500"
            : success
              ? "border-green-500"
              : "border-gray-400 focus-within:border-accent"
        }`}
      >
        {Icon && <Icon className="w-5 h-5 mr-2 text-gray-500" />}

        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          name={name}
          onChange={onChange}
          disabled={disabled}
          maxLength={max}
          className={`w-full outline-none text-accent bg-transparent ${textStyle}`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="ml-2 text-gray-500"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      {success && !error && (
        <p className="text-green-500 text-sm mt-1">{success}</p>
      )}
    </div>
  );
}
