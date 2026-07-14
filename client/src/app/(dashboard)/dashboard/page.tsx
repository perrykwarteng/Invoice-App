"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import StatCard from "@/components/Dashboard/StatCard";
import TimeRangeFilter from "@/components/Dashboard/RangeFilter";
import DashboardLayout from "@/components/layouts/DashboardLayout";

import { FileText, Users, UserRound } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/services/dashboard";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  YAxis,
  XAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

const COLORS = ["#DCE8E5", "#006A59", "#00463C"];

export default function Dashboard() {
  const [filter, setFilter] = useState("monthly");

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const [chartHeight, setChartHeight] = useState(340);

  useEffect(() => {
    const resize = () => {
      setChartHeight(window.innerWidth < 640 ? 250 : 340);
    };

    resize();

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "dashboard-stats",
      filter,
      startDate?.toISOString() ?? null,
      endDate?.toISOString() ?? null,
    ],

    queryFn: () => getDashboardStats(filter, startDate, endDate),
  });

  const stats = [
    {
      title: "Invoices",
      value: data?.invoices ?? 0,
      icon: FileText,
      link: "/invoices",
    },

    {
      title: "Users",
      value: data?.users ?? 0,
      icon: Users,
      link: "/users",
    },

    {
      title: "Clients",
      value: data?.clients ?? 0,
      icon: UserRound,
      link: "/clients",
    },
  ];

  const statusData = [
    {
      name: "Draft",
      value: data?.draftInvoices ?? 0,
      color: COLORS[0],
    },

    {
      name: "Saved",
      value: data?.savedInvoices ?? 0,
      color: COLORS[1],
    },

    {
      name: "Overdue",
      value: data?.overdueInvoices ?? 0,
      color: COLORS[2],
    },
  ].filter((item) => item.value > 0);

  return (
    <DashboardLayout>
      <div className="min-h-full space-y-4 sm:space-y-6">
        <DashboardHeader subtitle="Overview of your system activity and performance">
          <div className="w-full sm:w-auto mt-3 sm:mt-0">
            <TimeRangeFilter
              defaultValue="Monthly"
              onChange={(value: string) => setFilter(value.toLowerCase())}
            />
          </div>
        </DashboardHeader>

        {isError && (
          <p className="text-sm text-red-500">
            Failed to load dashboard stats.
          </p>
        )}

        <div
          className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-3
          gap-4
        "
        >
          {stats.map((item, index) => {
            const Icon = item.icon;

            return (
              <StatCard
                key={index}
                title={item.title}
                value={item.value}
                link={item.link}
                icon={<Icon className="w-6 h-6 text-accent/50" />}
              />
            );
          })}
        </div>
        <div
          className="
          grid
          grid-cols-1
          xl:grid-cols-2
          gap-6
        "
        >
          <div
            className="
           bg-white border-2 border-accent/30 rounded-xl
            p-4
            overflow-hidden
          "
          >
            <div
              className="
              flex
              flex-col
              sm:flex-row
              sm:items-center
              sm:justify-between
              gap-4
              mb-6
            "
            >
              <div>
                <h3
                  className="
                  text-lg
                  sm:text-xl
                  font-semibold
                  text-accent
                "
                >
                  {filter === "weekly" || filter === "daily"
                    ? "Weekly Invoice Report"
                    : "Monthly Invoice Report"}
                </h3>

                <p className="text-sm text-gray-500">
                  {filter === "weekly" || filter === "daily"
                    ? "Last 7 days performance"
                    : "Invoice trend over the year"}
                </p>
              </div>

              <select
                className="
                  w-full
                  sm:w-auto
                  border
                  border-bg-muted
                  rounded-xl
                  px-4
                  py-2
                  text-sm
                  outline-none
                "
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="monthly">Monthly</option>

                <option value="weekly">Weekly</option>

                <option value="yearly">Yearly</option>
              </select>
            </div>

            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart
                data={data?.trendData || []}
                barCategoryGap={
                  filter === "weekly" || filter === "daily" ? "35%" : "25%"
                }
              >
                <CartesianGrid vertical={false} stroke="var(--color-bg-soft)" />

                <XAxis
                  dataKey={
                    filter === "weekly" || filter === "daily" ? "date" : "month"
                  }
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: "#9ca3af",
                    fontSize: 12,
                  }}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: "#9ca3af",
                    fontSize: 12,
                  }}
                  tickFormatter={(v) => `${v / 1000}k`}
                />

                <Tooltip
                  cursor={{
                    fill: "rgba(0,106,89,.08)",
                  }}
                  wrapperStyle={{
                    zIndex: 9999,
                  }}
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #DCE8E5",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    maxWidth: "calc(100vw - 32px)",
                    boxShadow: "0 10px 25px rgba(0,0,0,.12)",
                  }}
                  formatter={(value: any) => [
                    `GH₵ ${Number(value).toLocaleString()}`,
                    "Invoice Total",
                  ]}
                />

                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {(data?.trendData || []).map((_: any, index: number) => (
                    <Cell
                      key={index}
                      fill={
                        index === (data?.trendData?.length || 0) - 1
                          ? "var(--color-primary)"
                          : "#e2e8f0"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-4 border-2 border-accent/30 rounded-xl">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-gray-800">
                Invoice Status Breakdown
              </h3>
              <p className="text-sm text-gray-500">Current distribution</p>
            </div>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center text-accent">
                Loading...
              </div>
            ) : statusData.length > 0 ? (
              <div className="flex items-center justify-between">
                <div className="relative w-64 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={82}
                        paddingAngle={4}
                        stroke="none"
                      >
                        {statusData.map((item, index) => (
                          <Cell key={index} fill={item.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-gray-800">
                      {data?.invoices}
                    </span>
                    <span className="text-sm text-gray-400">
                      Total Invoices
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  {statusData.map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <p className="text-sm text-gray-700">{item.name}</p>
                        <p className="text-xs text-gray-400">
                          {item.value} invoices
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                No invoice data available
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
