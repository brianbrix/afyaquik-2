import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardPage } from "../../modules/dashboard";
import { QueueBoardPage } from "../../modules/queue";
import { PatientsPage } from "../../modules/patients";
import { SchedulingCalendarPage } from "../../modules/scheduling";
import { ReportsPage } from "../../modules/reports";
import { ProtectedLayout } from "./ProtectedLayout";
import { LoginPage } from "../../modules/auth";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { UserDirectory } from "../../components/admin/UserDirectory";
import { RoleListWithFormDemo } from "../../components/admin/RoleList";
import { DepartmentTable } from "../../components/admin/DepartmentTable";
import { RoleRedirectUrlTable } from "../../components/admin/RoleRedirectUrlTable";
import { DynamicFormPage } from "../../components/admin/DynamicFormPage";
import { AdminUserGroupsPage } from "../../modules/admin/pages/AdminUserGroupsPage";
import PermissionMatrixAdminPage from "../../modules/admin/permissions/PermissionMatrixAdminPage";
import { NotificationTemplatesAdminPage } from "../../modules/admin/pages/NotificationTemplatesAdminPage";
import { AdminShiftTypesPage } from "../../modules/admin/pages/AdminShiftTypesPage";
import { InsuranceAdminPage } from "../../modules/insurance/InsuranceAdminPage";

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
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="users" replace />} />
          <Route path="users" element={<UserDirectory />} />
          <Route path="roles" element={<RoleListWithFormDemo />} />
          <Route path="user-groups" element={<AdminUserGroupsPage />} />
          <Route path="role-redirects" element={<RoleRedirectUrlTable />} />
          <Route path="permissions" element={<PermissionMatrixAdminPage />} />
          <Route path="departments" element={<DepartmentTable />} />
          <Route path="notification-templates" element={<NotificationTemplatesAdminPage />} />
          <Route path="shift-types" element={<AdminShiftTypesPage />} />
          <Route path="forms/:formKey" element={<DynamicFormPage />} />
          <Route path="insurance" element={<InsuranceAdminPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
