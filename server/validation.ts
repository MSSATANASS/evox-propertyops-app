import { z } from "zod";

const nonEmptyText = z.string().trim().min(1);
const dateText = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}(?:T.*)?$/, "invalid date");

export const propertyCreateSchema = z.object({
  name: nonEmptyText,
  address: nonEmptyText,
  type: nonEmptyText,
  owner: nonEmptyText,
  monthlyRent: z.number().finite().positive(),
  status: z.enum(["ocupado", "desocupado"]),
});

export const propertyUpdateSchema = propertyCreateSchema
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "at least one field is required",
  );

export const taskCreateSchema = z.object({
  propertyId: z.number().int().positive(),
  title: nonEmptyText,
  description: nonEmptyText,
  status: z.enum(["pendiente", "en_proceso", "completada"]),
  priority: z.enum(["baja", "media", "alta"]),
  assignedTo: nonEmptyText,
  photoUrl: z.string().url().nullable().optional(),
  completedAt: dateText.nullable().optional(),
});

export const taskUpdateSchema = taskCreateSchema
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "at least one field is required",
  );

export const expenseCreateSchema = z.object({
  propertyId: z.number().int().positive(),
  description: nonEmptyText,
  amount: z.number().finite().positive(),
  category: z.enum(["mantenimiento", "servicios", "reparacion"]),
  status: z.enum(["pendiente", "aprobado", "rechazado"]),
  requestedBy: nonEmptyText,
  approvedBy: nonEmptyText.nullable().optional(),
  date: dateText,
});

export const expenseUpdateSchema = expenseCreateSchema
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "at least one field is required",
  );

export const taskQuerySchema = z.object({
  propertyId: z.coerce.number().int().positive().optional(),
  status: z.enum(["pendiente", "en_proceso", "completada"]).optional(),
  priority: z.enum(["baja", "media", "alta"]).optional(),
  dateFrom: dateText.optional(),
  dateTo: dateText.optional(),
});

export const expenseQuerySchema = z.object({
  propertyId: z.coerce.number().int().positive().optional(),
  status: z.enum(["pendiente", "aprobado", "rechazado"]).optional(),
  category: z.enum(["mantenimiento", "servicios", "reparacion"]).optional(),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function notFound(entity: string): HttpError {
  return new HttpError(404, "NOT_FOUND", `${entity} not found`);
}

export function forbidden(message = "forbidden"): HttpError {
  return new HttpError(403, "FORBIDDEN", message);
}

export function validationError(error: z.ZodError): HttpError {
  return new HttpError(400, "VALIDATION_ERROR", "request validation failed", {
    issues: error.issues,
  });
}

export function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  try {
    return schema.parse(value);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw validationError(error);
    }
    throw error;
  }
}
