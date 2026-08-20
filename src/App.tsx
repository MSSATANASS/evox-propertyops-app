import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useServiceWorker } from "@/hooks/use-service-worker.ts";
import { DefaultProviders } from "./components/providers/default.tsx";
import LoginPage from "./pages/auth/Login.tsx";
import AppLayout from "./pages/_layout/AppLayout.tsx";
import Index from "./pages/Index.tsx";
import PropertiesPage from "./pages/properties/page.tsx";
import TasksPage from "./pages/tasks/page.tsx";
import ExpensesPage from "./pages/expenses/page.tsx";
import ReportPage from "./pages/report/page.tsx";
import OwnerPortalPage from "./pages/owner/page.tsx";
import LandingPage from "./pages/landing/page.tsx";
import NotFound from "./pages/NotFound.tsx";

export default function App() {
  useServiceWorker();
  return (
    <DefaultProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/report" element={<ReportPage />} />
          </Route>
          <Route path="/owner/:ownerSlug" element={<OwnerPortalPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </DefaultProviders>
  );
}
