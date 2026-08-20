import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  }).index("by_token", ["tokenIdentifier"]),

  properties: defineTable({
    name: v.string(),
    address: v.string(),
    type: v.string(), // "Casa", "Departamento", "Local Comercial"
    owner: v.string(),
    monthlyRent: v.number(),
    status: v.string(), // "ocupado", "desocupado"
  }),

  tasks: defineTable({
    propertyId: v.id("properties"),
    title: v.string(),
    description: v.string(),
    status: v.string(), // "pendiente", "en_proceso", "completada"
    priority: v.string(), // "alta", "media", "baja"
    assignedTo: v.string(),
    photoUrl: v.optional(v.string()),
    completedAt: v.optional(v.string()),
  }).index("by_property", ["propertyId"]),

  expenses: defineTable({
    propertyId: v.id("properties"),
    description: v.string(),
    amount: v.number(),
    category: v.string(), // "mantenimiento", "servicios", "reparacion"
    status: v.string(), // "pendiente", "aprobado", "rechazado"
    requestedBy: v.string(),
    approvedBy: v.optional(v.string()),
    date: v.string(),
  }).index("by_property", ["propertyId"]),
});
