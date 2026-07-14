import { and, eq, gte, lte, count, sql } from "drizzle-orm";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek.js";
import { clients, invoices, users } from "../config/db/schema.js";
import { db } from "../config/db/index.js";

dayjs.extend(isoWeek);

type FilterType = "all" | "daily" | "weekly" | "monthly" | "yearly" | "range";

type Params = {
  organisationId: number;
  filter?: FilterType;
  startDate?: string;
  endDate?: string;
};

export async function getDashboardStatsService({
  organisationId,
  filter = "all",
  startDate,
  endDate,
}: Params) {
  let start: Date | undefined;
  let end: Date | undefined;
  const now = dayjs();

  switch (filter) {
    case "daily":
      start = now.startOf("day").toDate();
      end = now.endOf("day").toDate();
      break;
    case "weekly":
      start = now.startOf("isoWeek").toDate();
      end = now.endOf("isoWeek").toDate();
      break;
    case "monthly":
      start = now.startOf("month").toDate();
      end = now.endOf("month").toDate();
      break;
    case "yearly":
      start = now.startOf("year").toDate();
      end = now.endOf("year").toDate();
      break;
    case "range":
      if (startDate && endDate) {
        start = dayjs(startDate).startOf("day").toDate();
        end = dayjs(endDate).endOf("day").toDate();
      }
      break;
    case "all":
    default:
      start = undefined;
      end = undefined;
      break;
  }

  const baseWhere = (table: any) =>
    start && end
      ? and(
          eq(table.organisationId, organisationId),
          gte(table.createdAt, start),
          lte(table.createdAt, end),
        )
      : eq(table.organisationId, organisationId);

  const [usersCount] = await db
    .select({ count: count() })
    .from(users)
    .where(baseWhere(users));
  const [clientsCount] = await db
    .select({ count: count() })
    .from(clients)
    .where(baseWhere(clients));
  const [invoicesCount] = await db
    .select({ count: count() })
    .from(invoices)
    .where(baseWhere(invoices));

  const [statusBreakdown] = await db
    .select({
      draft: count(sql`CASE WHEN ${invoices.status} = 'draft' THEN 1 END`),
      saved: count(sql`CASE WHEN ${invoices.status} = 'saved' THEN 1 END`),
      overdue: count(
        sql`CASE WHEN ${invoices.dueDate} < NOW() AND ${invoices.status} != 'paid' THEN 1 END`,
      ),
    })
    .from(invoices)
    .where(baseWhere(invoices));

  let trendData: any[] = [];

  if (filter === "weekly" || filter === "daily") {
    trendData = await db
      .select({
        date: sql<string>`DATE_FORMAT(${invoices.createdAt}, '%d %b')`,
        total: count(),
        amount: sql<number>`COALESCE(SUM(${invoices.totalAmount}), 0)`,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.organisationId, organisationId),
          gte(
            invoices.createdAt,
            dayjs().subtract(6, "day").startOf("day").toDate(),
          ),
        ),
      )
      .groupBy(
        sql`DATE_FORMAT(${invoices.createdAt}, '%d %b')`,
        sql`DATE(${invoices.createdAt})`,
      )
      .orderBy(sql`DATE(${invoices.createdAt})`);
  } else if (filter === "yearly") {
    trendData = await db
      .select({
        month: sql<string>`DATE_FORMAT(${invoices.createdAt}, '%b')`,
        total: count(),
        amount: sql<number>`COALESCE(SUM(${invoices.totalAmount}), 0)`,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.organisationId, organisationId),
          gte(invoices.createdAt, now.startOf("year").toDate()),
        ),
      )
      .groupBy(
        sql`DATE_FORMAT(${invoices.createdAt}, '%b')`,
        sql`MONTH(${invoices.createdAt})`,
      )
      .orderBy(sql`MONTH(${invoices.createdAt})`);
  } else {
    trendData = await db
      .select({
        month: sql<string>`DATE_FORMAT(${invoices.createdAt}, '%b')`,
        total: count(),
        amount: sql<number>`COALESCE(SUM(${invoices.totalAmount}), 0)`,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.organisationId, organisationId),
          gte(
            invoices.createdAt,
            dayjs().subtract(11, "month").startOf("month").toDate(),
          ),
        ),
      )
      .groupBy(
        sql`DATE_FORMAT(${invoices.createdAt}, '%b')`,
        sql`MONTH(${invoices.createdAt})`,
      )
      .orderBy(sql`MONTH(${invoices.createdAt})`);
  }

  return {
    users: Number(usersCount?.count ?? 0),
    clients: Number(clientsCount?.count ?? 0),
    invoices: Number(invoicesCount?.count ?? 0),

    draftInvoices: Number(statusBreakdown?.draft ?? 0),
    savedInvoices: Number(statusBreakdown?.saved ?? 0),
    overdueInvoices: Number(statusBreakdown?.overdue ?? 0),

    trendData,

    filter,
    range: { start, end },
  };
}
