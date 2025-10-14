import React, { useState, useMemo } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useStaffDirectory } from '../../services/staffDirectoryApi';

interface StaffDirectoryEntry { 
  id: number; 
  username: string; 
  displayName: string; 
  roles: string[]; 
  departments: string[] 
}

interface SearchableStaffSelectProps {
  value?: StaffDirectoryEntry | null;
  onChange: (staff: StaffDirectoryEntry | null) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  showRole?: boolean;
  showDepartment?: boolean;
}

export function SearchableStaffSelect({ 
  value, 
  onChange, 
  placeholder = "Search staff...", 
  disabled = false,
  required = false,
  label = "Staff Member",
  showRole = true,
  showDepartment = true
}: SearchableStaffSelectProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: staffData = [], isLoading } = useStaffDirectory(true);
  
  const filteredStaff = useMemo(() => {
    if (!searchQuery.trim()) return staffData;
    const query = searchQuery.toLowerCase();
    return staffData.filter(staff => 
      staff.username.toLowerCase().includes(query) || 
      staff.displayName.toLowerCase().includes(query) ||
      staff.roles.some(role => role.toLowerCase().includes(query)) ||
      staff.departments.some(dept => dept.toLowerCase().includes(query))
    );
  }, [staffData, searchQuery]);

  const handleSelect = (staff: StaffDirectoryEntry) => {
    onChange(staff);
    setSearchQuery(staff.displayName);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    // Delay closing to allow clicks on dropdown items
    setTimeout(() => setIsOpen(false), 150);
  };

  return (
    <div className="position-relative">
      <Form.Group>
        <Form.Label>
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </Form.Label>
        <div className="d-flex gap-2">
          <Form.Control
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            disabled={disabled}
            required={required}
            autoComplete="off"
          />
          {value && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleClear}
              disabled={disabled}
              title="Clear selection"
            >
              <i className="bi bi-x"></i>
            </Button>
          )}
        </div>
      </Form.Group>

      {isOpen && (
        <div 
          className="border rounded bg-white shadow-sm position-absolute w-100" 
          style={{ 
            zIndex: 1050, 
            maxHeight: '300px', 
            overflowY: 'auto',
            top: '100%',
            left: 0,
            right: 0
          }}
        >
          {isLoading ? (
            <div className="p-3 text-center text-muted">
              <i className="bi bi-hourglass-split me-2"></i>
              Loading staff...
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="p-3 text-center text-muted">
              <i className="bi bi-search me-2"></i>
              No staff members found
            </div>
          ) : (
            filteredStaff.map(staff => (
              <div
                key={staff.id}
                className={`p-3 border-bottom cursor-pointer hover-bg-light ${
                  value?.id === staff.id ? 'bg-light' : ''
                }`}
                onClick={() => handleSelect(staff)}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="fw-semibold">{staff.displayName}</div>
                    <div className="text-muted small">@{staff.username}</div>
                  </div>
                  <div className="text-end">
                    {showRole && staff.roles.length > 0 && (
                      <div className="small">
                        <span className="badge bg-primary me-1">{staff.roles[0]}</span>
                        {staff.roles.length > 1 && (
                          <span className="text-muted">+{staff.roles.length - 1}</span>
                        )}
                      </div>
                    )}
                    {showDepartment && staff.departments.length > 0 && (
                      <div className="small text-muted">
                        {staff.departments[0]}
                        {staff.departments.length > 1 && (
                          <span> +{staff.departments.length - 1}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {value && (
        <div className="mt-2">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-person-check text-success"></i>
            <span className="fw-semibold">{value.displayName}</span>
            <span className="text-muted small">@{value.username}</span>
            {showRole && value.roles.length > 0 && (
              <span className="badge bg-primary">{value.roles[0]}</span>
            )}
            {showDepartment && value.departments.length > 0 && (
              <span className="badge bg-secondary">{value.departments[0]}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}