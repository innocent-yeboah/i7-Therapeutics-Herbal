import type { SupabaseClient } from "@supabase/supabase-js";
import { format, subDays, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";

const TZ = "Africa/Accra";

const PAID_LIKE = ["paid", "processing", "shipped", "delivered"] as const;

function dayKeyInTz(iso: string) {
  return format(toZonedTime(new Date(iso), TZ), "yyyy-MM-dd");
}

export type AdminDashboardData = Awaited<ReturnType<typeof getAdminDashboardData>>;

export async function getAdminDashboardData(supabase: SupabaseClient) {
  const since7 = subDays(new Date(), 6);
  since7.setHours(0, 0, 0, 0);
  const since7Iso = since7.toISOString();

  const [
    { count: apptTotal },
    { count: apptPending },
    { count: orderTotal },
    { count: customerTotal },
    { data: allOrders },
    { data: orders7d },
    { data: lowProducts },
    { count: contactAttention },
    { count: webhookOpen },
    { data: apptsUpcoming },
    { data: recentOrders },
    { data: apptsAll },
    { data: allOrdersForStatus },
  ] = await Promise.all([
    supabase.from("appointments").select("*", { count: "exact", head: true }),
    supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("total_amount, status").in("status", [...PAID_LIKE]),
    supabase
      .from("orders")
      .select("created_at, total_amount, status")
      .gte("created_at", since7Iso)
      .order("created_at", { ascending: true }),
    supabase
      .from("products")
      .select("id, name, stock_quantity")
      .lte("stock_quantity", LOW_STOCK_THRESHOLD)
      .order("stock_quantity", { ascending: true })
      .limit(12),
    supabase
      .from("contacts")
      .select("*", { count: "exact", head: true })
      .in("status", ["pending", "email_failed"]),
    supabase.from("webhook_failures").select("*", { count: "exact", head: true }).is("resolved_at", null),
    supabase
      .from("appointments")
      .select("id, appointment_date, appointment_time, status, services(name), users(name, email)")
      .gte("appointment_date", format(toZonedTime(new Date(), TZ), "yyyy-MM-dd"))
      .neq("status", "cancelled")
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true })
      .limit(8),
    supabase
      .from("orders")
      .select("id, total_amount, status, created_at, paystack_reference, users(name, email)")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("appointments").select("service_id, services(name)"),
    supabase.from("orders").select("status"),
  ]);

  const revenueLifetime =
    allOrders?.reduce((s, o) => s + Number(o.total_amount), 0) ?? 0;

  const pendingPayment =
    allOrdersForStatus?.filter((o) => o.status === "pending").length ?? 0;
  const fulfilling =
    allOrdersForStatus?.filter((o) =>
      ["paid", "processing", "shipped"].includes(o.status)
    ).length ?? 0;

  const dayLabels: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = subDays(toZonedTime(new Date(), TZ), i);
    dayLabels.push(format(d, "yyyy-MM-dd"));
  }

  const revenueByDay = new Map<string, number>();
  const ordersByDay = new Map<string, number>();
  dayLabels.forEach((k) => {
    revenueByDay.set(k, 0);
    ordersByDay.set(k, 0);
  });

  (orders7d ?? []).forEach((o) => {
    const key = dayKeyInTz(o.created_at);
    if (!revenueByDay.has(key)) return;
    ordersByDay.set(key, (ordersByDay.get(key) ?? 0) + 1);
    if (PAID_LIKE.includes(o.status as (typeof PAID_LIKE)[number])) {
      revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + Number(o.total_amount));
    }
  });

  const chartSeries = dayLabels.map((date) => ({
    date,
    label: format(toZonedTime(parseISO(`${date}T12:00:00`), TZ), "EEE d"),
    revenue: revenueByDay.get(date) ?? 0,
    orderCount: ordersByDay.get(date) ?? 0,
  }));

  const revenue7d = chartSeries.reduce((s, p) => s + p.revenue, 0);

  const serviceCounts = new Map<string, number>();
  const serviceNames = new Map<string, string>();
  (apptsAll ?? []).forEach((a) => {
    const sid = a.service_id as string;
    serviceCounts.set(sid, (serviceCounts.get(sid) ?? 0) + 1);
    const s = a.services as { name?: string } | null;
    if (s?.name) serviceNames.set(sid, s.name);
  });
  const topServices = [...serviceCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ name: serviceNames.get(id) ?? "Service", count }));

  const statusBreakdown: Record<string, number> = {};
  (allOrdersForStatus ?? []).forEach((o) => {
    statusBreakdown[o.status] = (statusBreakdown[o.status] ?? 0) + 1;
  });

  return {
    kpis: {
      revenueLifetime,
      revenue7d,
      apptTotal: apptTotal ?? 0,
      apptPending: apptPending ?? 0,
      orderTotal: orderTotal ?? 0,
      pendingPayment,
      fulfilling,
      customerTotal: customerTotal ?? 0,
      lowStockCount: lowProducts?.length ?? 0,
      contactAttention: contactAttention ?? 0,
      webhookOpen: webhookOpen ?? 0,
    },
    chartSeries,
    topServices,
    statusBreakdown,
    lowProducts: lowProducts ?? [],
    recentOrders: recentOrders ?? [],
    upcomingAppts: apptsUpcoming ?? [],
  };
}
