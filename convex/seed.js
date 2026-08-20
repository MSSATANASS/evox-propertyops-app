import { mutation } from "./_generated/server";

export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    // Only seed if properties table is empty
    const existing = await ctx.db.query("properties").first();
    if (existing) return { seeded: false };

    // Insert properties
    const prop1 = await ctx.db.insert("properties", {
      name: "Casa Montecristo",
      address: "Calle 21 #304, Col. Montecristo, Mérida, Yucatán",
      type: "Casa",
      owner: "Arq. Roberto Peniche",
      monthlyRent: 18500,
      status: "ocupado",
    });

    const prop2 = await ctx.db.insert("properties", {
      name: "Depto García Ginerés",
      address: "Av. Pérez Ponce #156 Int. 3B, García Ginerés, Mérida",
      type: "Departamento",
      owner: "Lic. Carmen Zavala",
      monthlyRent: 12000,
      status: "ocupado",
    });

    const prop3 = await ctx.db.insert("properties", {
      name: "Local Itzimná",
      address: "Calle 17 #89, Col. Itzimná, Mérida",
      type: "Local Comercial",
      owner: "Ing. Marco Cetina",
      monthlyRent: 22000,
      status: "desocupado",
    });

    // Insert tasks
    await ctx.db.insert("tasks", {
      propertyId: prop1,
      title: "Fuga en tubería de baño principal",
      description: "Se detectó fuga activa en la tubería del baño principal. Requiere atención inmediata.",
      status: "en_proceso",
      priority: "alta",
      assignedTo: "Plomero Alejandro Tun",
      photoUrl: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400",
    });

    await ctx.db.insert("tasks", {
      propertyId: prop1,
      title: "Pintura exterior deteriorada",
      description: "La pintura exterior de la fachada muestra deterioro significativo. Se requiere repintado completo.",
      status: "pendiente",
      priority: "media",
      assignedTo: "Por asignar",
    });

    await ctx.db.insert("tasks", {
      propertyId: prop2,
      title: "AC sin enfriar en recámara",
      description: "El aire acondicionado de la recámara principal no enfría correctamente. Se requiere revisión y recarga.",
      status: "completada",
      priority: "alta",
      assignedTo: "Técnico Frío Express",
      photoUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
      completedAt: "2026-08-14T10:00:00Z",
    });

    await ctx.db.insert("tasks", {
      propertyId: prop2,
      title: "Revisión eléctrica general",
      description: "Inspección de instalaciones eléctricas, tablero, contactos y luminarias.",
      status: "pendiente",
      priority: "baja",
      assignedTo: "Por asignar",
    });

    await ctx.db.insert("tasks", {
      propertyId: prop3,
      title: "Limpieza de fachada y cortinas",
      description: "Limpieza profunda de fachada exterior y cortinas metálicas del local.",
      status: "pendiente",
      priority: "media",
      assignedTo: "Equipo de mantenimiento",
    });

    // Insert expenses
    await ctx.db.insert("expenses", {
      propertyId: prop1,
      description: "Refacciones plomería — fuga baño",
      amount: 1850,
      category: "mantenimiento",
      status: "aprobado",
      requestedBy: "Plomero Alejandro Tun",
      approvedBy: "Coordinador Evox",
      date: "2026-08-13",
    });

    await ctx.db.insert("expenses", {
      propertyId: prop1,
      description: "Pintura exterior (presupuesto)",
      amount: 8400,
      category: "reparacion",
      status: "pendiente",
      requestedBy: "Coordinador Evox",
      date: "2026-08-15",
    });

    await ctx.db.insert("expenses", {
      propertyId: prop2,
      description: "Recarga de gas refrigerante AC",
      amount: 950,
      category: "mantenimiento",
      status: "aprobado",
      requestedBy: "Técnico Frío Express",
      approvedBy: "Coordinador Evox",
      date: "2026-08-14",
    });

    await ctx.db.insert("expenses", {
      propertyId: prop3,
      description: "Señalización local comercial",
      amount: 2200,
      category: "servicios",
      status: "pendiente",
      requestedBy: "Coordinador Evox",
      date: "2026-08-16",
    });

    return { seeded: true };
  },
});
