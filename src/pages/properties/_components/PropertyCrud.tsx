import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client.ts";
import { queryKeys } from "@/lib/query-keys.ts";
import type { Property, PropertyPayload } from "@/lib/api-types.ts";
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

type PropertyForm = {
  name: string;
  address: string;
  type: string;
  owner: string;
  monthlyRent: string;
  status: string;
};

const empty: PropertyForm = {
  name: "",
  address: "",
  type: "Casa",
  owner: "",
  monthlyRent: "",
  status: "ocupado",
};

function PropertyDialog({
  trigger,
  initial,
  onSave,
}: {
  trigger: React.ReactNode;
  initial?: PropertyForm;
  onSave: (data: PropertyForm) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<PropertyForm>(initial ?? empty);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof PropertyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.address || !form.owner || !form.monthlyRent) {
      toast.error("Please fill in all fields");
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
          <DialogTitle>
            {initial ? "Edit property" : "New property"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Field label="Name">
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Casa Montecristo"
            />
          </Field>
          <Field label="Address">
            <Input
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="123 Main St, City"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <Select value={form.type} onValueChange={(v) => set("type", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Casa">House</SelectItem>
                  <SelectItem value="Departamento">Apartment</SelectItem>
                  <SelectItem value="Local Comercial">
                    Commercial Space
                  </SelectItem>
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
                  <SelectItem value="ocupado">Occupied</SelectItem>
                  <SelectItem value="desocupado">Vacant</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Owner">
            <Input
              value={form.owner}
              onChange={(e) => set("owner", e.target.value)}
              placeholder="John Smith"
            />
          </Field>
          <Field label="Monthly Rent (MXN)">
            <Input
              type="number"
              value={form.monthlyRent}
              onChange={(e) => set("monthlyRent", e.target.value)}
              placeholder="18500"
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

export function AddPropertyButton() {
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: (payload: PropertyPayload) =>
      apiRequest<Property>("/api/properties", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.properties });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.reportsSummary,
      });
    },
  });
  return (
    <PropertyDialog
      trigger={
        <Button
          size="sm"
          className="bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> New property
        </Button>
      }
      onSave={async (f) => {
        await create.mutateAsync({
          ...f,
          monthlyRent: parseFloat(f.monthlyRent),
        });
        toast.success("Property created");
      }}
    />
  );
}

export function EditPropertyButton({ property }: { property: Property }) {
  const queryClient = useQueryClient();
  const update = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<PropertyPayload>;
    }) =>
      apiRequest<Property>(`/api/properties/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.properties });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.reportsSummary,
      });
    },
  });
  return (
    <PropertyDialog
      trigger={
        <button className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted transition-colors cursor-pointer text-muted-foreground hover:text-foreground">
          <Pencil className="w-3.5 h-3.5" />
        </button>
      }
      initial={{
        name: property.name,
        address: property.address,
        type: property.type,
        owner: property.owner,
        monthlyRent: String(property.monthlyRent),
        status: property.status,
      }}
      onSave={async (f) => {
        await update.mutateAsync({
          id: property.id,
          payload: { ...f, monthlyRent: parseFloat(f.monthlyRent) },
        });
        toast.success("Property updated");
      }}
    />
  );
}

export function DeletePropertyButton({ id }: { id: number }) {
  const queryClient = useQueryClient();
  const remove = useMutation({
    mutationFn: () =>
      apiRequest<void>(`/api/properties/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.properties });
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
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
        <button className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-red-500/10 transition-colors cursor-pointer text-muted-foreground hover:text-red-400">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete property?</DialogTitle>
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
              toast.success("Property deleted");
            }}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
