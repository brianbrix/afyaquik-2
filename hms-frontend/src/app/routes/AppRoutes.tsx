import { TriageTitlesAdminPage } from "../../modules/admin/pages/TriageTitlesAdminPage";
import { ConsultationTitlesAdminPage } from "../../modules/admin/pages/ConsultationTitlesAdminPage";
import QueueStatusRoleMatrixAdminPage from "../../modules/admin/pages/QueueStatusRoleMatrixAdminPage";
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
import { MedicationsPage, PrescriptionsPage, PharmacyInventoryPage, MedicationInventoryPage } from "../../modules/pharmacy";
import { UserProfilePage } from "../../modules/profile";
import { BillsPage, PaymentsPage } from "../../modules/billing";
import { DiagnosticsAdminPage } from "../../modules/admin/pages/DiagnosticsAdminPage";
import { PaymentMethodsAdminPage } from "../../modules/admin/pages/PaymentMethodsAdminPage";
import { TeamManagementPage } from "../../modules/team/pages/TeamManagementPage";
import { TimeOffRequestPage } from "../../modules/timeoff/pages/TimeOffRequestPage";
import InventoryPage from "../../modules/inventory/pages/InventoryPage";

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
        <Route path="/pharmacy/medications" element={<MedicationsPage />} />
        <Route path="/pharmacy/inventory" element={<PharmacyInventoryPage />} />
        <Route path="/pharmacy/medication-inventory" element={<MedicationInventoryPage />} />
        <Route path="/pharmacy/prescriptions" element={<PrescriptionsPage />} />
        <Route path="/billing/bills" element={<BillsPage />} />
        <Route path="/billing/payments" element={<PaymentsPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/team" element={<TeamManagementPage />} />
        <Route path="/time-off" element={<TimeOffRequestPage />} />
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
          <Route path="triage-titles" element={<TriageTitlesAdminPage />} />
          <Route path="consultation-titles" element={<ConsultationTitlesAdminPage />} />
          <Route path="queue-status-role-matrix" element={<QueueStatusRoleMatrixAdminPage />} />
          <Route path="diagnostics" element={<DiagnosticsAdminPage />} />
          <Route path="payment-methods" element={<PaymentMethodsAdminPage />} />
          <Route path="inventory" element={<InventoryPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
