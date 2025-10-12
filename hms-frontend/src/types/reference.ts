
export interface RoleDefinition {
  id: number;
  name: string;
  displayName: string;
}

export interface DepartmentDefinition {
  id: number;
  name: string;
  displayName: string;
}

export type RolesResponse = RoleDefinition[];
export type DepartmentsResponse = DepartmentDefinition[];
