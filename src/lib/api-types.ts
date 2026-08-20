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

export interface ReportsSummary {
  counts: {
    properties: number;
    tasksPending: number;
    tasksInProgress: number;
    tasksCompleted: number;
    expensesApproved: number;
    expensesPending: number;
  };
  totals: {
    approvedExpenses: number;
    pendingExpenses: number;
  };
  recentTasks: Task[];
  recentExpenses: Expense[];
}

export interface OwnerPortalData {
  ownerName: string;
  properties: Property[];
  tasks: Task[];
  expenses: Expense[];
  summary: {
    totalRent: number;
    totalExpensesApproved: number;
    totalExpensesPending: number;
    openTasks: number;
    completedTasks: number;
    netIncome: number;
  };
}

export type PropertyPayload = Omit<Property, "id" | "createdAt" | "updatedAt">;
export type TaskPayload = Omit<
  Task,
  "id" | "createdAt" | "updatedAt" | "photoUrl" | "completedAt"
> & {
  photoUrl?: string | null;
  completedAt?: string | null;
};
export type ExpensePayload = Omit<
  Expense,
  "id" | "createdAt" | "updatedAt" | "approvedBy"
> & {
  approvedBy?: string | null;
};
