import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client.ts";
import { queryKeys } from "@/lib/query-keys.ts";
import type { Expense, Property, Task } from "@/lib/api-types.ts";
import { useState } from "react";
import { motion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import {
  Printer,
  Building2,
  CheckCircle2,
  Clock,
  Wrench,
  Receipt,
} from "lucide-react";

const formatMXN = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "MXN" }).format(
    amount,
  );

const formatDate = (dateStr: string) =>
  new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(
    new Date(dateStr),
  );

const statusLabel: Record<string, string> = {
  pendiente: "Pending",
  en_proceso: "In Progress",
  completada: "Completed",
  aprobado: "Approved",
  rechazado: "Rejected",
};

const statusColor: Record<string, string> = {
  pendiente: "bg-orange-100 text-orange-700",
  en_proceso: "bg-blue-100 text-blue-700",
  completada: "bg-green-100 text-green-700",
  aprobado: "bg-green-100 text-green-700",
  rechazado: "bg-red-100 text-red-700",
};

export default function ReportPage() {
  const properties = useQuery({
    queryKey: queryKeys.properties,
    queryFn: () => apiRequest<Property[]>("/api/properties"),
  });
  const allTasks = useQuery({
    queryKey: queryKeys.tasks,
    queryFn: () => apiRequest<Task[]>("/api/tasks"),
  });
  const allExpenses = useQuery({
    queryKey: queryKeys.expenses,
    queryFn: () => apiRequest<Expense[]>("/api/expenses"),
  });

  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(
    null,
  );

  const loading =
    properties.isPending || allTasks.isPending || allExpenses.isPending;

  // Default to first property when loaded
  const effectiveId = selectedPropertyId ?? properties.data?.[0]?.id ?? null;
  const property = properties.data?.find((p) => p.id === effectiveId) ?? null;

  const tasks = (allTasks.data ?? []).filter(
    (t) => t.propertyId === effectiveId,
  );
  const expenses = (allExpenses.data ?? []).filter(
    (e) => e.propertyId === effectiveId,
  );

  const completedTasks = tasks.filter((t) => t.status === "completada");
  const pendingTasks = tasks.filter((t) => t.status === "pendiente");
  const inProcessTasks = tasks.filter((t) => t.status === "en_proceso");

  const approvedExpenses = expenses.filter((e) => e.status === "aprobado");
  const pendingExpenses = expenses.filter((e) => e.status === "pendiente");

  const totalApproved = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPending = pendingExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Controls — hidden on print */}
      <div className="no-print flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Monthly Report</h1>
          <p className="text-muted-foreground text-sm mt-1">Owner document</p>
        </div>
        <div className="flex items-center gap-3">
          {loading ? (
            <Skeleton className="h-9 w-44" />
          ) : (
            <Select
              value={effectiveId === null ? "none" : String(effectiveId)}
              onValueChange={(val) =>
                setSelectedPropertyId(val === "none" ? null : Number(val))
              }
            >
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {properties.data?.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button
            className="bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4 mr-2" />
            Print / PDF
          </Button>
        </div>
      </div>

      {/* Report document */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : property ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl border border-border shadow-sm overflow-hidden"
        >
          {/* Report header */}
          <div className="bg-[oklch(0.25_0.08_250)] text-white px-8 py-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[oklch(0.72_0.18_70)] flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[oklch(0.15_0.04_60)]" />
                </div>
                <div>
                  <p className="font-bold text-lg leading-tight">PropertyOps</p>
                  <p className="text-white/60 text-xs">
                    by Evox · Professional Property Management
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">
                  Monthly Management Report
                </p>
                <p className="text-white/70 text-xs mt-0.5">
                  Period: August 2026
                </p>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 space-y-8">
            {/* Property & owner info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Owner
                </p>
                <p className="text-xl font-bold text-foreground">
                  {property.owner}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {property.name}
                </p>
              </div>
              <div className="rounded-lg border border-border p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Property Details
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium">{property.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${
                      property.status === "ocupado"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {property.status === "ocupado" ? "Occupied" : "Vacant"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monthly Rent</span>
                  <span className="font-bold text-[oklch(0.25_0.08_250)]">
                    {formatMXN(property.monthlyRent)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground pt-1 border-t border-border">
                  {property.address}
                </p>
              </div>
            </div>

            {/* Tasks summary */}
            <section>
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[oklch(0.25_0.08_250)]" />
                Maintenance Tasks Summary
              </h2>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  {
                    label: "Total",
                    value: tasks.length,
                    icon: Wrench,
                    color: "text-foreground",
                  },
                  {
                    label: "Completed",
                    value: completedTasks.length,
                    icon: CheckCircle2,
                    color: "text-green-600",
                  },
                  {
                    label: "Pending",
                    value: pendingTasks.length,
                    icon: Clock,
                    color: "text-orange-500",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg border border-border p-3 text-center"
                  >
                    <stat.icon
                      className={`w-4 h-4 mx-auto mb-1 ${stat.color}`}
                    />
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Completed tasks detail */}
              {completedTasks.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2 text-foreground">
                    Tasks completed this period:
                  </p>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">
                            Task
                          </th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">
                            Technician
                          </th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {completedTasks.map((task, i) => (
                          <tr
                            key={task.id}
                            className={i % 2 === 0 ? "bg-white" : "bg-muted/20"}
                          >
                            <td className="px-4 py-2.5 font-medium">
                              {task.title}
                            </td>
                            <td className="px-4 py-2.5 text-muted-foreground">
                              {task.assignedTo}
                            </td>
                            <td className="px-4 py-2.5 text-muted-foreground">
                              {task.completedAt
                                ? formatDate(task.completedAt)
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Pending/in-process */}
              {(pendingTasks.length > 0 || inProcessTasks.length > 0) && (
                <div className="mt-3">
                  <p className="text-sm font-semibold mb-2 text-foreground">
                    Tasks in progress or pending:
                  </p>
                  <div className="space-y-1.5">
                    {[...inProcessTasks, ...pendingTasks].map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between px-4 py-2 rounded-lg bg-muted/30 text-sm"
                      >
                        <span>{task.title}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-medium ${statusColor[task.status] ?? ""}`}
                        >
                          {statusLabel[task.status]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Expenses section */}
            <section>
              <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[oklch(0.25_0.08_250)]" />
                Expense Summary
              </h2>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">
                    Total approved
                  </p>
                  <p className="text-xl font-bold text-green-600">
                    {formatMXN(totalApproved)}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">
                    Pending approval
                  </p>
                  <p className="text-xl font-bold text-orange-500">
                    {formatMXN(totalPending)}
                  </p>
                </div>
              </div>

              {expenses.length > 0 && (
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">
                          Date
                        </th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">
                          Description
                        </th>
                        <th className="text-right px-4 py-2 text-xs font-semibold text-muted-foreground">
                          Amount
                        </th>
                        <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((exp, i) => (
                        <tr
                          key={exp.id}
                          className={i % 2 === 0 ? "bg-white" : "bg-muted/20"}
                        >
                          <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                            {formatDate(exp.date)}
                          </td>
                          <td className="px-4 py-2.5 font-medium">
                            {exp.description}
                          </td>
                          <td className="px-4 py-2.5 text-right font-semibold">
                            {formatMXN(exp.amount)}
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-medium ${statusColor[exp.status] ?? ""}`}
                            >
                              {statusLabel[exp.status] ?? exp.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t border-border bg-muted/30">
                      <tr>
                        <td
                          colSpan={2}
                          className="px-4 py-2.5 text-sm font-semibold"
                        >
                          Period total
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold">
                          {formatMXN(
                            expenses.reduce((s, e) => s + e.amount, 0),
                          )}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </section>

            {/* Footer */}
            <div className="border-t border-border pt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>Generated by PropertyOps · by Evox · Mérida, Yucatán</span>
              <span>August 2026 Report</span>
            </div>
          </div>
        </motion.div>
      ) : (
        <p className="text-center text-muted-foreground py-12">
          No properties available.
        </p>
      )}
    </div>
  );
}
