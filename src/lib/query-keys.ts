export const queryKeys = {
  properties: ["properties"] as const,
  tasks: ["tasks"] as const,
  expenses: ["expenses"] as const,
  reportsSummary: ["reports-summary"] as const,
  ownerPortal: (ownerSlug: string) => ["owner-portal", ownerSlug] as const,
};
