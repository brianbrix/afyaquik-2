
export interface RoleDefinition {
  id: number;
  name: string;
  roleKey: string;
  displayName: string;
}

export interface DepartmentDefinition {
  id: number;
  departmentId: string;
  name: string;
  displayName: string;
}

export type RolesResponse = RoleDefinition[];
export type DepartmentsResponse = DepartmentDefinition[];
