import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function Clitens() {
  return (
    <DashboardLayout>
      <div className="min-h-full">
        <div className="">
          <DashboardHeader title="Organisations" />
        </div>
      </div>
    </DashboardLayout>
  );
}
