import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardPage } from "../../modules/dashboard";
import { QueueBoardPage } from "../../modules/queue";
import { PatientsPage } from "../../modules/patients";
import { SchedulingCalendarPage } from "../../modules/scheduling";
import { ReportsPage } from "../../modules/reports";
import { ProtectedLayout } from "./ProtectedLayout";
import { LoginPage } from "../../modules/auth";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/queue" element={<QueueBoardPage />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/scheduling" element={<SchedulingCalendarPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
