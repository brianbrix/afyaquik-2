export type RoleKey = string;

export interface RoleDefinition {
  roleKey: RoleKey;
  displayName: string;
}

export interface DepartmentDefinition {
  departmentId: string;
  displayName: string;
}

// After ApiResponse envelope: backend returns ApiResponse<RoleRef[]> etc.
export type RolesResponse = RoleDefinition[];
export type DepartmentsResponse = DepartmentDefinition[];
