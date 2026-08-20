import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client.ts";
import { queryKeys } from "@/lib/query-keys.ts";
import type { Expense, ExpensePayload, Property } from "@/lib/api-types.ts";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

type ExpenseForm = {
  propertyId: string;
  description: string;
  amount: string;
  category: string;
  status: string;
  requestedBy: string;
  date: string;
};

const today = new Date().toISOString().split("T")[0];

const empty: ExpenseForm = {
  propertyId: "",
  description: "",
  amount: "",
  category: "mantenimiento",
  status: "pendiente",
  requestedBy: "",
  date: today,
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

function ExpenseDialog({
  trigger,
  initial,
  onSave,
}: {
  trigger: React.ReactNode;
  initial?: ExpenseForm;
  onSave: (data: ExpenseForm) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ExpenseForm>(initial ?? empty);
  const [saving, setSaving] = useState(false);
  const properties = useQuery({
    queryKey: queryKeys.properties,
    queryFn: () => apiRequest<Property[]>("/api/properties"),
  });

  const set = (k: keyof ExpenseForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (
      !form.propertyId ||
      !form.description ||
      !form.amount ||
      !form.requestedBy
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
          <DialogTitle>{initial ? "Edit expense" : "New expense"}</DialogTitle>
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
          <Field label="Description">
            <Input
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Plumbing parts"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount (MXN)">
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
                placeholder="1850"
              />
            </Field>
            <Field label="Date">
              <Input
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <Select
                value={form.category}
                onValueChange={(v) => set("category", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mantenimiento">Maintenance</SelectItem>
                  <SelectItem value="servicios">Services</SelectItem>
                  <SelectItem value="reparacion">Repair</SelectItem>
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
                  <SelectItem value="aprobado">Approved</SelectItem>
                  <SelectItem value="rechazado">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Requested by">
            <Input
              value={form.requestedBy}
              onChange={(e) => set("requestedBy", e.target.value)}
              placeholder="John Smith"
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

export function AddExpenseButton() {
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: (payload: ExpensePayload) =>
      apiRequest<Expense>("/api/expenses", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.reportsSummary,
      });
    },
  });
  return (
    <ExpenseDialog
      trigger={
        <Button
          size="sm"
          className="bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> New expense
        </Button>
      }
      onSave={async (f) => {
        await create.mutateAsync({
          propertyId: Number(f.propertyId),
          description: f.description,
          amount: parseFloat(f.amount),
          category: f.category,
          status: f.status,
          requestedBy: f.requestedBy,
          date: f.date,
        });
        toast.success("Expense recorded");
      }}
    />
  );
}

export function EditExpenseButton({ expense }: { expense: Expense }) {
  const queryClient = useQueryClient();
  const update = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<ExpensePayload>;
    }) =>
      apiRequest<Expense>(`/api/expenses/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.reportsSummary,
      });
    },
  });
  return (
    <ExpenseDialog
      trigger={
        <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-muted transition-colors cursor-pointer text-muted-foreground hover:text-foreground">
          <Pencil className="w-3 h-3" />
        </button>
      }
      initial={{
        propertyId: String(expense.propertyId),
        description: expense.description,
        amount: String(expense.amount),
        category: expense.category,
        status: expense.status,
        requestedBy: expense.requestedBy,
        date: expense.date,
      }}
      onSave={async (f) => {
        await update.mutateAsync({
          id: expense.id,
          payload: {
            propertyId: Number(f.propertyId),
            description: f.description,
            amount: parseFloat(f.amount),
            category: f.category,
            status: f.status,
            requestedBy: f.requestedBy,
            date: f.date,
            approvedBy: expense.approvedBy,
          },
        });
        toast.success("Expense updated");
      }}
    />
  );
}

export function DeleteExpenseButton({ id }: { id: number }) {
  const queryClient = useQueryClient();
  const remove = useMutation({
    mutationFn: () =>
      apiRequest<void>(`/api/expenses/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
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
          <DialogTitle>Delete expense?</DialogTitle>
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
              toast.success("Expense deleted");
            }}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
