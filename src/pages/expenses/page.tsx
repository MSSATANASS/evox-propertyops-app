import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { motion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { CheckCircle2, XCircle } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { AddExpenseButton, EditExpenseButton, DeleteExpenseButton } from "./_components/ExpenseCrud.tsx";

const formatMXN = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(amount);

const formatDate = (dateStr: string) =>
  new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" }).format(new Date(dateStr));

const statusStyle: Record<string, string> = {
  pendiente: "text-yellow-400 bg-yellow-400/10",
  aprobado: "text-emerald-400 bg-emerald-400/10",
  rechazado: "text-red-400 bg-red-400/10",
};

const statusLabel: Record<string, string> = {
  pendiente: "Pending",
  aprobado: "Approved",
  rechazado: "Rejected",
};

const categoryStyle: Record<string, string> = {
  mantenimiento: "text-blue-400 bg-blue-400/10",
  servicios: "text-purple-400 bg-purple-400/10",
  reparacion: "text-red-400 bg-red-400/10",
};

const categoryLabel: Record<string, string> = {
  mantenimiento: "Maintenance",
  servicios: "Services",
  reparacion: "Repair",
};

export default function ExpensesPage() {
  const expenses = useQuery(api.expenses.list, {});
  const properties = useQuery(api.properties.list, {});
  const updateStatus = useMutation(api.expenses.updateStatus);

  const propMap = Object.fromEntries(properties?.map((p) => [p._id, p.name]) ?? []);

  const handleApprove = async (id: Id<"expenses">) => {
    await updateStatus({ id, status: "aprobado", approvedBy: "Evox Coordinator" });
  };

  const handleReject = async (id: Id<"expenses">) => {
    await updateStatus({ id, status: "rechazado" });
  };

  const totalApproved = expenses?.filter((e) => e.status === "aprobado").reduce((s, e) => s + e.amount, 0) ?? 0;
  const totalPending = expenses?.filter((e) => e.status === "pendiente").reduce((s, e) => s + e.amount, 0) ?? 0;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight">Expenses & Authorizations</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Expense control and approval</p>
        </div>
        <AddExpenseButton />
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: "Total Approved", value: formatMXN(totalApproved), style: "text-emerald-400" },
          { label: "Pending Approval", value: formatMXN(totalPending), style: "text-yellow-400" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">{s.label}</p>
            <p className={`text-xl font-bold tabular-nums ${s.style}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* List */}
      {expenses === undefined ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {expenses.length === 0 && (
            <p className="text-center text-muted-foreground py-12 text-[13px]">No expenses recorded.</p>
          )}
          {expenses.map((exp, i) => (
            <motion.div
              key={exp._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors ${i > 0 ? "border-t border-border" : ""}`}
            >
              {/* Left */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold truncate mb-1">{exp.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-muted-foreground">{propMap[exp.propertyId] ?? "—"}</span>
                  <span className="text-muted-foreground/40 text-[11px]">·</span>
                  <span className="text-[11px] text-muted-foreground">{formatDate(exp.date)}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${categoryStyle[exp.category] ?? ""}`}>
                    {categoryLabel[exp.category] ?? exp.category}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyle[exp.status] ?? ""}`}>
                    {statusLabel[exp.status] ?? exp.status}
                  </span>
                  {exp.status === "aprobado" && exp.approvedBy && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      {exp.approvedBy}
                    </span>
                  )}
                </div>
              </div>

              {/* Right */}
              <div className="flex items-center gap-2 shrink-0">
                <p className="text-[14px] font-bold tabular-nums">{formatMXN(exp.amount)}</p>
                <EditExpenseButton expense={exp} />
                <DeleteExpenseButton id={exp._id} />
                {exp.status === "pendiente" && (
                  <>
                    <button
                      onClick={() => handleReject(exp._id as Id<"expenses">)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                      title="Reject"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleApprove(exp._id as Id<"expenses">)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors cursor-pointer"
                      title="Approve"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
