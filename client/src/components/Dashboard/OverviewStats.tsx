export type Stat = {
  totalInvoices: number;
  draftInvoices: number;
  overdueInvoices: number;
};

type OverviewStatCardProps = {
  stats: Stat;
};

export default function OverviewStatCard({ stats }: OverviewStatCardProps) {
  const statsItems = [
    { label: "Total Invoices", value: stats?.totalInvoices },
    { label: "Draft Invoices", value: stats?.draftInvoices },
    { label: "Overdue", value: stats?.overdueInvoices },
  ];
  return (
    <div className="w-full border-2 bg-white border-accent/30 p-4 rounded-xl flex items-center">
      {statsItems.map((stat, index) => (
        <div
          key={index}
          className={`flex-1 py-4 ${
            index !== statsItems.length - 1
              ? "border-r-2 border-accent/20 pr-4 pl-4"
              : "pl-4"
          }`}
        >
          <h3 className="text-3xl text-accent font-medium">{stat.value}</h3>
          <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
