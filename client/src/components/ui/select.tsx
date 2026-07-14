import { SquareChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type SelectType = {
  list?: string[];
  label?: string;
  text?: string;
  scrollHeight?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export default function Select({
  list,
  label,
  text = "Select an option",
  scrollHeight = "max-h-48",
  error,
  value,
  onChange,
}: SelectType) {
  const [active, setActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayText = value || text;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setActive(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(item: string) {
    onChange?.(item);
    setActive(false);
  }

  return (
    <div className="relative" ref={containerRef}>
      {label && <p className="text-accent font-medium mb-1">{label}</p>}

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={active}
        className={`w-full border-2 rounded-lg py-2.5 px-2 flex items-center gap-x-2 justify-between bg-transparent cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
          active ? "border-accent" : "border-gray-400"
        }`}
        onClick={() => setActive((prev) => !prev)}
      >
        <span className="text-accent w-full text-left">{displayText}</span>
        <SquareChevronDown
          className={`text-accent shrink-0 transition-transform duration-200 ${
            active ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      {active && (
        <ul
          role="listbox"
          className={`absolute right-0 z-10 w-full mt-2 bg-bg-muted rounded-lg p-3 overflow-y-auto scrollbar-none ${scrollHeight}`}
        >
          {list?.map((item) => (
            <li
              key={item}
              role="option"
              aria-selected={item === value}
              className="p-1.5 text-accent bg-bg-soft my-2 rounded-md cursor-pointer hover:bg-accent/10"
              onClick={() => handleSelect(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
