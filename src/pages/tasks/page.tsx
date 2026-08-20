import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client.ts";
import { queryKeys } from "@/lib/query-keys.ts";
import type { Property, Task } from "@/lib/api-types.ts";
import { useState } from "react";
import { motion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { User, Calendar } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import {
  AddTaskButton,
  EditTaskButton,
  DeleteTaskButton,
} from "./_components/TaskCrud.tsx";

type StatusFilter = "all" | "pendiente" | "en_proceso" | "completada";

const priorityDot: Record<string, string> = {
  alta: "bg-red-500",
  media: "bg-yellow-500",
  baja: "bg-blue-500",
};

const priorityStyle: Record<string, string> = {
  alta: "text-red-400 bg-red-400/10",
  media: "text-yellow-400 bg-yellow-400/10",
  baja: "text-blue-400 bg-blue-400/10",
};

const priorityLabel: Record<string, string> = {
  alta: "High",
  media: "Medium",
  baja: "Low",
};

const statusStyle: Record<string, string> = {
  pendiente: "text-yellow-400 bg-yellow-400/10",
  en_proceso: "text-blue-400 bg-blue-400/10",
  completada: "text-emerald-400 bg-emerald-400/10",
};

const statusLabel: Record<string, string> = {
  pendiente: "Pending",
  en_proceso: "In Progress",
  completada: "Completed",
};

const tabs: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pendiente", label: "Pending" },
  { key: "en_proceso", label: "In Progress" },
  { key: "completada", label: "Completed" },
];

const formatDate = (dateStr: string) =>
  new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));

export default function TasksPage() {
  const queryClient = useQueryClient();
  const tasks = useQuery({
    queryKey: queryKeys.tasks,
    queryFn: () => apiRequest<Task[]>("/api/tasks"),
  });
  const properties = useQuery({
    queryKey: queryKeys.properties,
    queryFn: () => apiRequest<Property[]>("/api/properties"),
  });
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest<Task>(`/api/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          ...(status === "completada"
            ? { completedAt: new Date().toISOString() }
            : {}),
        }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.reportsSummary,
      });
    },
  });
  const [filter, setFilter] = useState<StatusFilter>("all");

  const propMap = Object.fromEntries(
    (properties.data ?? []).map((p) => [p.id, p.name]),
  );
  const filtered = (tasks.data ?? []).filter(
    (t) => filter === "all" || t.status === filter,
  );

  const handleStatusChange = async (id: number, status: string) => {
    await updateStatus.mutateAsync({ id, status });
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Maintenance Tasks
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Active work orders
          </p>
        </div>
        <AddTaskButton />
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 bg-muted rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              "px-3 py-1.5 rounded-md text-[12px] font-medium transition-all cursor-pointer",
              filter === tab.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tasks.isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              className="bg-card border border-border rounded-xl p-4 hover:border-border/80 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Photo */}
                {task.photoUrl && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <img
                        src={task.photoUrl}
                        alt="Evidence"
                        className="w-14 h-14 rounded-lg object-cover shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <img
                        src={task.photoUrl}
                        alt="Evidence"
                        className="w-full rounded-lg"
                      />
                    </DialogContent>
                  </Dialog>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityDot[task.priority] ?? "bg-muted-foreground"}`}
                      />
                      <h3 className="text-[14px] font-semibold leading-tight truncate">
                        {task.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${priorityStyle[task.priority] ?? ""}`}
                      >
                        {priorityLabel[task.priority] ?? task.priority}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyle[task.status] ?? ""}`}
                      >
                        {statusLabel[task.status]}
                      </span>
                      <EditTaskButton task={task} />
                      <DeleteTaskButton id={task.id} />
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground font-medium mb-1.5">
                    {propMap[task.propertyId] ?? "—"}
                  </p>
                  <p className="text-[12px] text-muted-foreground leading-relaxed mb-3">
                    {task.description}
                  </p>

                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <User className="w-3 h-3" />
                      {task.assignedTo}
                    </div>
                    {task.completedAt && (
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatDate(task.completedAt)}
                      </div>
                    )}
                    <div className="ml-auto">
                      <Select
                        value={task.status}
                        onValueChange={(val) =>
                          void handleStatusChange(task.id, val)
                        }
                      >
                        <SelectTrigger className="h-7 text-[11px] w-32 bg-muted border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendiente">Pending</SelectItem>
                          <SelectItem value="en_proceso">
                            In Progress
                          </SelectItem>
                          <SelectItem value="completada">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12 text-[13px]">
              No tasks in this category.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
