import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client.ts";
import { queryKeys } from "@/lib/query-keys.ts";
import type { Property } from "@/lib/api-types.ts";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { MapPin, User, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";
import {
  AddPropertyButton,
  EditPropertyButton,
  DeletePropertyButton,
} from "./_components/PropertyCrud.tsx";

const formatMXN = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(amount);

const typeStyle: Record<string, string> = {
  Casa: "text-blue-400 bg-blue-400/10",
  Departamento: "text-purple-400 bg-purple-400/10",
  "Local Comercial": "text-orange-400 bg-orange-400/10",
};

const typeLabel: Record<string, string> = {
  Casa: "House",
  Departamento: "Apartment",
  "Local Comercial": "Commercial Space",
};

export default function PropertiesPage() {
  const properties = useQuery({
    queryKey: queryKeys.properties,
    queryFn: () => apiRequest<Property[]>("/api/properties"),
  });
  const navigate = useNavigate();

  const copyOwnerLink = (owner: string) => {
    const url = `${window.location.origin}/owner/${encodeURIComponent(owner)}`;
    void navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight">Properties</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Managed portfolio
          </p>
        </div>
        <AddPropertyButton />
      </motion.div>

      {properties.isPending ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-52 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(properties.data ?? []).map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
              className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4 hover:border-primary/30 transition-colors"
            >
              {/* Top */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-[14px] font-semibold leading-tight truncate">
                    {p.name}
                  </h3>
                  <span
                    className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeStyle[p.type] ?? "text-muted-foreground bg-muted"}`}
                  >
                    {typeLabel[p.type] ?? p.type}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      p.status === "ocupado"
                        ? "text-emerald-400 bg-emerald-400/10"
                        : "text-yellow-400 bg-yellow-400/10"
                    }`}
                  >
                    {p.status === "ocupado" ? "Occupied" : "Vacant"}
                  </span>
                  <EditPropertyButton property={p} />
                  <DeletePropertyButton id={p.id} />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-1.5">
                <div className="flex items-start gap-2 text-[12px] text-muted-foreground">
                  <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                  <span className="leading-tight">{p.address}</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                  <User className="w-3 h-3 shrink-0" />
                  <span>{p.owner}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Monthly Rent
                  </p>
                  <p className="text-[16px] font-bold tabular-nums">
                    {formatMXN(p.monthlyRent)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => copyOwnerLink(p.owner)}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted cursor-pointer"
                    title="Copy owner link"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() =>
                      navigate(`/owner/${encodeURIComponent(p.owner)}`)
                    }
                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted cursor-pointer"
                    title="View owner portal"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Portal</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
