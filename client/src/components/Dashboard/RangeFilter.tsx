import { useState } from "react";

type Option = "Daily" | "Weekly" | "Monthly" | "Yearly";

type TimeRangeFilterProps = {
  defaultValue?: Option;
  onChange?: (value: Option) => void;
};

export default function TimeRangeFilter({
  defaultValue = "Monthly",
  onChange,
}: TimeRangeFilterProps) {
  const [active, setActive] = useState<Option>(defaultValue);

  const options: Option[] = ["Daily", "Weekly", "Monthly", "Yearly"];

  const handleClick = (value: Option) => {
    setActive(value);
    onChange?.(value);
  };

  return (
    <div className="bg-white rounded-lg p-1.5 flex items-center gap-x-1.5">
      {options.map((item) => (
        <button
          key={item}
          onClick={() => handleClick(item)}
          className={`list-none p-1 px-3 rounded-md text-sm transition-all duration-150 ${
            active === item
              ? "bg-accent text-white"
              : "hover:bg-bg-light text-accent"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
