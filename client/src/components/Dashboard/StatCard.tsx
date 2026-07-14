import { SquareArrowOutUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  link?: string;
  onClick?: () => void;
};

export default function StatCard({
  title,
  value,
  subtitle = "last month",
  icon,
  link,
}: StatCardProps) {

  const route = useRouter()

  return (
    <div className="border-2 bg-white border-accent/30 p-3 rounded-xl">
      <div className="flex items-center justify-between">
        <p className="text-accent text-lg font-medium">{title}</p>

        {link && (
          <div
            className="p-1.5 border-2 border-accent/30 rounded-md hover:bg-bg-muted transition-all duration-150"
            onClick={()=> route.push(`${link}`)}
          >
            <SquareArrowOutUpRight className="w-3.5 h-3.5 text-accent" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-x-2 mt-4">
        <button>{icon}</button>
        <div className="flex items-end gap-x-1">
          <h3 className="text-3xl text-accent">{value}</h3>
          <p className="text-gray-400 text-sm mb-1">from {subtitle}</p>
        </div>
      </div>
    </div>
  );
}
