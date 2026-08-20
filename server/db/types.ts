export interface Property {
  id: number;
  name: string;
  address: string;
  type: string;
  owner: string;
  monthlyRent: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export type PropertyInput = Omit<Property, "id" | "createdAt" | "updatedAt">;
export type PropertyUpdate = Partial<PropertyInput>;

export interface Task {
  id: number;
  propertyId: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo: string;
  photoUrl: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TaskInput = Omit<Task, "id" | "createdAt" | "updatedAt" | "photoUrl" | "completedAt"> & {
  photoUrl?: string | null;
  completedAt?: string | null;
};
export type TaskUpdate = Partial<TaskInput>;

export interface Expense {
  id: number;
  propertyId: number;
  description: string;
  amount: number;
  category: string;
  status: string;
  requestedBy: string;
  approvedBy: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseInput = Omit<Expense, "id" | "createdAt" | "updatedAt" | "approvedBy"> & {
  approvedBy?: string | null;
};
export type ExpenseUpdate = Partial<ExpenseInput>;
