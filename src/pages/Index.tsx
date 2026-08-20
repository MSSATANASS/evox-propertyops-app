import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client.ts";
import { queryKeys } from "@/lib/query-keys.ts";
import type { Property, ReportsSummary } from "@/lib/api-types.ts";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
  Building2,
  Wrench,
  Clock,
  Receipt,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

const formatMXN = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (dateStr: string) =>
  new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" }).format(
    new Date(dateStr),
  );

const today = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  day: "numeric",
  month: "long",
}).format(new Date());

const priorityDot: Record<string, string> = {
  alta: "bg-red-500",
  media: "bg-yellow-500",
  baja: "bg-blue-500",
};

const statusLabel: Record<string, string> = {
  pendiente: "Pending",
  en_proceso: "In Progress",
  completada: "Completed",
  aprobado: "Approved",
  rechazado: "Rejected",
};

const statusStyle: Record<string, string> = {
  pendiente: "text-yellow-400 bg-yellow-400/10",
  en_proceso: "text-blue-400 bg-blue-400/10",
  completada: "text-emerald-400 bg-emerald-400/10",
  aprobado: "text-emerald-400 bg-emerald-400/10",
  rechazado: "text-red-400 bg-red-400/10",
};

export default function Index() {
  const summary = useQuery({
    queryKey: queryKeys.reportsSummary,
    queryFn: () => apiRequest<ReportsSummary>("/api/reports/summary"),
  });
  const properties = useQuery({
    queryKey: queryKeys.properties,
    queryFn: () => apiRequest<Property[]>("/api/properties"),
  });

  const loading = summary.isPending || properties.isPending;
  const data = summary.data;
  const recentTasks = data?.recentTasks ?? [];
  const recentExpenses = data?.recentExpenses ?? [];
  const propMap = Object.fromEntries(
    (properties.data ?? []).map((p) => [p.id, p.name]),
  );

  const stats = [
    {
      label: "Properties",
      value: loading ? null : `${data?.counts.properties ?? 0}`,
      sub: "under management",
      icon: Building2,
      accent: "text-primary bg-primary/10",
    },
    {
      label: "Pending",
      value: loading ? null : `${data?.counts.tasksPending ?? 0}`,
      sub: "tasks",
      icon: Clock,
      accent: "text-yellow-400 bg-yellow-400/10",
    },
    {
      label: "In Progress",
      value: loading ? null : `${data?.counts.tasksInProgress ?? 0}`,
      sub: "active orders",
      icon: Wrench,
      accent: "text-blue-400 bg-blue-400/10",
    },
    {
      label: "Appr. Expenses",
      value: loading ? null : formatMXN(data?.totals.approvedExpenses ?? 0),
      sub: "this period",
      icon: Receipt,
      accent: "text-emerald-400 bg-emerald-400/10",
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1 capitalize">
          {today}
        </p>
        <h1 className="text-2xl font-bold tracking-tight">
          Good morning, Coordinator
        </h1>
      </motion.div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3"
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.accent}`}
            >
              <s.icon className="w-4 h-4" />
            </div>
            <div>
              {s.value === null ? (
                <Skeleton className="h-7 w-14 mb-1" />
              ) : (
                <p className="text-xl font-bold tracking-tight">{s.value}</p>
              )}
              <p className="text-[11px] text-muted-foreground">{s.sub}</p>
            </div>
            <p className="text-xs font-medium text-muted-foreground mt-auto">
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Two columns */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.28 }}
          className="bg-card border border-border rounded-xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <span className="text-[13px] font-semibold">Recent Tasks</span>
            <Link
              to="/tasks"
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="px-5 py-3 flex items-center gap-3">
                    <Skeleton className="w-1.5 h-1.5 rounded-full shrink-0" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))
              : recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityDot[task.priority] ?? "bg-muted-foreground"}`}
                      />
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium truncate">
                          {task.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {propMap[task.propertyId] ?? "—"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyle[task.status] ?? ""}`}
                    >
                      {statusLabel[task.status]}
                    </span>
                  </div>
                ))}
          </div>
        </motion.div>

        {/* Expenses */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.34 }}
          className="bg-card border border-border rounded-xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <span className="text-[13px] font-semibold">Recent Expenses</span>
            <Link
              to="/expenses"
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="px-5 py-3 flex items-center justify-between gap-3"
                  >
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))
              : recentExpenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium truncate">
                        {exp.description}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatDate(exp.date)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
                      <span className="text-[13px] font-semibold tabular-nums">
                        {formatMXN(exp.amount)}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyle[exp.status] ?? ""}`}
                      >
                        {statusLabel[exp.status] ?? exp.status}
                      </span>
                    </div>
                  </div>
                ))}
          </div>
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="flex justify-end"
      >
        <Link
          to="/report"
          className="inline-flex items-center gap-2 bg-accent text-accent-foreground hover:bg-accent/90 transition-colors px-4 py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          View Monthly Report
        </Link>
      </motion.div>
    </div>
  );
}
