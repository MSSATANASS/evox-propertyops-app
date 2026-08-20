import { useQuery } from "@tanstack/react-query";
import { useParams, Link, Navigate } from "react-router-dom";
import { apiRequest, ApiError } from "@/lib/api-client.ts";
import { queryKeys } from "@/lib/query-keys.ts";
import type { OwnerPortalData } from "@/lib/api-types.ts";
import { useLocalAuth } from "@/components/providers/local-auth.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { motion } from "motion/react";
import {
  Building2,
  MapPin,
  TrendingUp,
  Wrench,
  ReceiptText,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

const formatMXN = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (dateStr: string) =>
  new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));

const statusLabel: Record<string, string> = {
  pendiente: "Pending",
  en_proceso: "In Progress",
  completada: "Completed",
  aprobado: "Approved",
  rechazado: "Rejected",
};

const taskStatusStyle: Record<string, string> = {
  pendiente: "text-yellow-400 bg-yellow-400/10",
  en_proceso: "text-blue-400 bg-blue-400/10",
  completada: "text-emerald-400 bg-emerald-400/10",
};

const expenseStatusStyle: Record<string, string> = {
  pendiente: "text-yellow-400 bg-yellow-400/10",
  aprobado: "text-emerald-400 bg-emerald-400/10",
  rechazado: "text-red-400 bg-red-400/10",
};

const priorityDot: Record<string, string> = {
  alta: "bg-red-500",
  media: "bg-yellow-500",
  baja: "bg-blue-500",
};

const priorityLabel: Record<string, string> = {
  alta: "High",
  media: "Medium",
  baja: "Low",
};

const categoryLabel: Record<string, string> = {
  mantenimiento: "Maintenance",
  servicios: "Services",
  reparacion: "Repair",
};

type StatCardProps = {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color: string;
  delay?: number;
};

function StatCard({
  label,
  value,
  sub,
  icon,
  color,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="bg-card border border-border rounded-xl p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">
          {label}
        </p>
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}
        >
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
    </motion.div>
  );
}

export default function OwnerPortalPage() {
  const { ownerSlug } = useParams<{ ownerSlug: string }>();
  const { status } = useLocalAuth();
  const report = useQuery({
    queryKey: queryKeys.ownerPortal(ownerSlug ?? ""),
    queryFn: () =>
      apiRequest<OwnerPortalData>(
        `/api/reports/owner/${encodeURIComponent(ownerSlug ?? "")}`,
      ),
    enabled: Boolean(ownerSlug) && status === "authenticated",
  });
  const data = report.data;

  if (status === "loading" || report.isPending) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-10 max-w-4xl mx-auto">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  if (report.error instanceof ApiError && report.error.status === 404) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold">Owner not found</h1>
          <p className="text-muted-foreground text-[13px] max-w-xs mx-auto">
            This link may be outdated. Contact your Evox coordinator.
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold">Unable to load owner portal</h1>
          <p className="text-muted-foreground text-[13px] max-w-xs mx-auto">
            Please try again or contact your Evox coordinator.
          </p>
        </div>
      </div>
    );
  }

  const month = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground leading-none">
                PropertyOps by Evox
              </p>
              <p className="text-[13px] font-semibold leading-tight">
                {data.ownerName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-muted-foreground hidden sm:block capitalize">
              {month}
            </span>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
              Read only
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold tracking-tight">
            Your portfolio summary
          </h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            {data.properties.length} propert
            {data.properties.length !== 1 ? "ies" : "y"} under management ·
            Updated in real time
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Total Rent"
            value={formatMXN(data.summary.totalRent)}
            sub="monthly"
            icon={<TrendingUp className="w-4 h-4" />}
            color="bg-emerald-500/10 text-emerald-400"
            delay={0.05}
          />
          <StatCard
            label="Net Income"
            value={formatMXN(data.summary.netIncome)}
            sub="after approved expenses"
            icon={<ReceiptText className="w-4 h-4" />}
            color="bg-blue-500/10 text-blue-400"
            delay={0.1}
          />
          <StatCard
            label="Open Tasks"
            value={String(data.summary.openTasks)}
            sub={`${data.summary.completedTasks} completed`}
            icon={<Wrench className="w-4 h-4" />}
            color="bg-yellow-500/10 text-yellow-400"
            delay={0.15}
          />
          <StatCard
            label="Pending Expenses"
            value={formatMXN(data.summary.totalExpensesPending)}
            sub="to authorize"
            icon={<Clock className="w-4 h-4" />}
            color="bg-orange-500/10 text-orange-400"
            delay={0.2}
          />
        </div>

        {/* Properties */}
        <section>
          <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Properties
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {data.properties.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.25 + i * 0.07 }}
                className="bg-card border border-border rounded-xl p-5"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-[14px] font-semibold">{p.name}</h3>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      p.status === "ocupado"
                        ? "text-emerald-400 bg-emerald-400/10"
                        : "text-yellow-400 bg-yellow-400/10"
                    }`}
                  >
                    {p.status === "ocupado" ? "Occupied" : "Vacant"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground mb-3">
                  <MapPin className="w-3 h-3 shrink-0" />
                  {p.address}
                </div>
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Monthly Rent
                  </span>
                  <span className="text-[15px] font-bold tabular-nums">
                    {formatMXN(p.monthlyRent)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Tasks */}
        {data.tasks.length > 0 && (
          <section>
            <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Maintenance Tasks
            </h2>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {data.tasks.map((task, i) => {
                const propName =
                  data.properties.find((p) => p.id === task.propertyId)?.name ??
                  "—";
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25, delay: 0.35 + i * 0.04 }}
                    className={`flex items-start gap-3 px-5 py-4 ${i > 0 ? "border-t border-border" : ""}`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${priorityDot[task.priority] ?? "bg-muted-foreground"}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold mb-0.5">
                        {task.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground mb-1.5">
                        {propName}
                      </p>
                      {task.description && (
                        <p className="text-[12px] text-muted-foreground leading-relaxed mb-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] text-muted-foreground">
                          {task.assignedTo}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${taskStatusStyle[task.status] ?? ""}`}
                        >
                          {statusLabel[task.status]}
                        </span>
                        {task.priority && (
                          <span className="text-[10px] text-muted-foreground">
                            Priority: {priorityLabel[task.priority]}
                          </span>
                        )}
                        {task.completedAt && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            {formatDate(task.completedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    {task.photoUrl && (
                      <img
                        src={task.photoUrl}
                        alt="Evidence"
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Expenses */}
        {data.expenses.length > 0 && (
          <section>
            <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Period Expenses
            </h2>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {data.expenses.map((exp, i) => {
                const propName =
                  data.properties.find((p) => p.id === exp.propertyId)?.name ??
                  "—";
                return (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25, delay: 0.4 + i * 0.04 }}
                    className={`flex items-center gap-3 px-5 py-4 ${i > 0 ? "border-t border-border" : ""}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold mb-1">
                        {exp.description}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] text-muted-foreground">
                          {propName}
                        </span>
                        <span className="text-muted-foreground/40">·</span>
                        <span className="text-[11px] text-muted-foreground">
                          {formatDate(exp.date)}
                        </span>
                        <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {categoryLabel[exp.category] ?? exp.category}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${expenseStatusStyle[exp.status] ?? ""}`}
                        >
                          {statusLabel[exp.status]}
                        </span>
                        {exp.approvedBy && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            {exp.approvedBy}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-[14px] font-bold tabular-nums shrink-0">
                      {formatMXN(exp.amount)}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="border-t border-border pt-6 pb-8 flex items-center justify-between"
        >
          <div>
            <p className="text-[12px] text-muted-foreground">
              Managed by{" "}
              <span className="font-semibold text-foreground">Evox</span>
            </p>
            <p className="text-[11px] text-muted-foreground">
              PropertyOps · This view is read-only
            </p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Admin
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
