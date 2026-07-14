type DashboardHeaderProps = {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
};

export default function DashboardHeader({
  title = "Dashboard",
  subtitle,
  children,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-y-2 md:gap-y-0 md:flex-row md:items-start md:justify-between mb-6">
      <div>
        <h2 className="text-3xl text-accent font-medium">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>

      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
