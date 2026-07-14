"use client";

type ToggleSwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

export default function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
}: ToggleSwitchProps) {
  return (
    <label className="relative inline-block w-11 h-6 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />

      <span className="absolute inset-0 rounded-full bg-gray-200 transition-all duration-200 peer-checked:bg-primary peer-disabled:opacity-50 peer-disabled:pointer-events-none" />

      <span className="absolute top-1/2 left-0.5 -translate-y-1/2 size-5 rounded-full bg-white shadow-sm transition-transform duration-200 peer-checked:translate-x-5" />
    </label>
  );
}