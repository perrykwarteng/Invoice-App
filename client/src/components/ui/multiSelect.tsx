import { SquareChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type MultiSelectType = {
  list?: string[];
  label?: string;
  text?: string;
  scrollHeight?: string;
  error?: string;
  value?: string[];
  onChange?: (value: string[]) => void;
};

export default function MultiSelect({
  list = [],
  label,
  text = "Select options",
  scrollHeight = "max-h-48",
  error,
  value = [],
  onChange,
}: MultiSelectType) {
  const [active, setActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
    const exists = value.includes(item);

    const updated = exists ? value.filter((v) => v !== item) : [...value, item];

    onChange?.(updated);
  }

  function removeItem(item: string) {
    onChange?.(value.filter((v) => v !== item));
  }

  return (
    <div className="relative" ref={containerRef}>
      {label && <p className="text-accent font-medium mb-1">{label}</p>}

      <button
        type="button"
        className={`w-full border-2 rounded-lg py-2.5 px-2 flex items-center justify-between gap-2 bg-transparent cursor-pointer focus:outline-none ${
          active ? "border-accent" : "border-gray-400"
        }`}
        onClick={() => setActive((prev) => !prev)}
      >
        <div className="flex flex-wrap gap-1 w-full text-left">
          {value.length > 0 ? (
            value.map((item) => (
              <span
                key={item}
                className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-md text-accent"
              >
                {item}

                <X
                  size={14}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item);
                  }}
                />
              </span>
            ))
          ) : (
            <span className="text-accent">{text}</span>
          )}
        </div>

        <SquareChevronDown
          className={`text-accent transition-transform ${
            active ? "rotate-180" : ""
          }`}
        />
      </button>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      {active && (
        <ul
          className={`absolute z-10 w-full mt-2 bg-bg-muted rounded-lg p-3 overflow-y-auto scrollbar-none ${scrollHeight}`}
        >
          {list.map((item) => {
            const selected = value.includes(item);

            return (
              <li
                key={item}
                className={`p-2 my-1 rounded-md cursor-pointer ${
                  selected ? "bg-accent/10" : "bg-bg-soft"
                } hover:bg-accent/10`}
                onClick={() => handleSelect(item)}
              >
                {item}

                {selected && <span className="float-right">✓</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
