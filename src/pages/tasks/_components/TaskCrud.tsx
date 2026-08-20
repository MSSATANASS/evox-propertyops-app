import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client.ts";
import { queryKeys } from "@/lib/query-keys.ts";
import type { Property, Task, TaskPayload } from "@/lib/api-types.ts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

type TaskForm = {
  propertyId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo: string;
  photoUrl: string;
};

const empty: TaskForm = {
  propertyId: "",
  title: "",
  description: "",
  status: "pendiente",
  priority: "media",
  assignedTo: "",
  photoUrl: "",
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[12px] text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function TaskDialog({
  trigger,
  initial,
  onSave,
}: {
  trigger: React.ReactNode;
  initial?: TaskForm;
  onSave: (data: TaskForm) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TaskForm>(initial ?? empty);
  const [saving, setSaving] = useState(false);
  const properties = useQuery({
    queryKey: queryKeys.properties,
    queryFn: () => apiRequest<Property[]>("/api/properties"),
  });

  const set = (k: keyof TaskForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (
      !form.propertyId ||
      !form.title ||
      !form.description ||
      !form.assignedTo
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
      setOpen(false);
      setForm(empty);
    } catch {
      toast.error("Error saving");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setForm(initial ?? empty);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit task" : "New task"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Field label="Property">
            <Select
              value={form.propertyId}
              onValueChange={(v) => set("propertyId", v)}
            >
              <SelectTrigger>
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
          </Field>
          <Field label="Title">
            <Input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Bathroom pipe leak"
            />
          </Field>
          <Field label="Description">
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Problem details..."
              rows={2}
              className="resize-none"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Priority">
              <Select
                value={form.priority}
                onValueChange={(v) => set("priority", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">High</SelectItem>
                  <SelectItem value="media">Medium</SelectItem>
                  <SelectItem value="baja">Low</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select
                value={form.status}
                onValueChange={(v) => set("status", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pending</SelectItem>
                  <SelectItem value="en_proceso">In Progress</SelectItem>
                  <SelectItem value="completada">Completed</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Assigned to">
            <Input
              value={form.assignedTo}
              onChange={(e) => set("assignedTo", e.target.value)}
              placeholder="John Smith"
            />
          </Field>
          <Field label="Photo URL (optional)">
            <Input
              value={form.photoUrl}
              onChange={(e) => set("photoUrl", e.target.value)}
              placeholder="https://..."
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AddTaskButton() {
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: (payload: TaskPayload) =>
      apiRequest<Task>("/api/tasks", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.reportsSummary,
      });
    },
  });
  return (
    <TaskDialog
      trigger={
        <Button
          size="sm"
          className="bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> New task
        </Button>
      }
      onSave={async (f) => {
        await create.mutateAsync({
          propertyId: Number(f.propertyId),
          title: f.title,
          description: f.description,
          status: f.status,
          priority: f.priority,
          assignedTo: f.assignedTo,
          photoUrl: f.photoUrl || null,
        });
        toast.success("Task created");
      }}
    />
  );
}

export function EditTaskButton({ task }: { task: Task }) {
  const queryClient = useQueryClient();
  const update = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<TaskPayload>;
    }) =>
      apiRequest<Task>(`/api/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.reportsSummary,
      });
    },
  });
  return (
    <TaskDialog
      trigger={
        <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-muted transition-colors cursor-pointer text-muted-foreground hover:text-foreground">
          <Pencil className="w-3 h-3" />
        </button>
      }
      initial={{
        propertyId: String(task.propertyId),
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo,
        photoUrl: task.photoUrl ?? "",
      }}
      onSave={async (f) => {
        await update.mutateAsync({
          id: task.id,
          payload: {
            propertyId: Number(f.propertyId),
            title: f.title,
            description: f.description,
            status: f.status,
            priority: f.priority,
            assignedTo: f.assignedTo,
            photoUrl: f.photoUrl || null,
          },
        });
        toast.success("Task updated");
      }}
    />
  );
}

export function DeleteTaskButton({ id }: { id: number }) {
  const queryClient = useQueryClient();
  const remove = useMutation({
    mutationFn: () =>
      apiRequest<void>(`/api/tasks/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.reportsSummary,
      });
    },
  });
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-500/10 transition-colors cursor-pointer text-muted-foreground hover:text-red-400">
          <Trash2 className="w-3 h-3" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete task?</DialogTitle>
        </DialogHeader>
        <p className="text-[13px] text-muted-foreground">
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={async () => {
              await remove.mutateAsync();
              setOpen(false);
              toast.success("Task deleted");
            }}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
