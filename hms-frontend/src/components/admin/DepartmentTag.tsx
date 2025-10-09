import React from 'react';
import { AdminDepartment } from '../../services/adminApi';

interface DepartmentTagProps { dept: Pick<AdminDepartment,'displayName'|'departmentId'>; }

export const DepartmentTag: React.FC<DepartmentTagProps> = ({ dept }) => {
  return (
    <span className="badge rounded-pill text-bg-info text-dark me-1" title={dept.departmentId}>
      {dept.displayName}
    </span>
  );
};
