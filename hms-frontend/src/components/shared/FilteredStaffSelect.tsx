import React, { useState, useMemo, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';

interface StaffDirectoryEntry { 
  id: number; 
  username: string;
  displayName: string; 
  roles: string[]; 
  departments: string[] 
}

interface FilteredStaffSelectProps {
  value?: StaffDirectoryEntry | null;
  onChange: (staff: StaffDirectoryEntry | null) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  staffData: StaffDirectoryEntry[];
  selectedStatus?: string;
  statusMatrix?: Record<string, Set<string>>;
}

export function FilteredStaffSelect({ 
  value, 
  onChange, 
  placeholder = "Search staff...", 
  disabled = false,
  required = false,
  label = "Staff Member",
  staffData,
  selectedStatus,
  statusMatrix
}: FilteredStaffSelectProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Sync searchQuery with value prop when value changes externally
  useEffect(() => {
    if (value) {
      setSearchQuery(value.displayName);
      console.log('FilteredStaffSelect: Value changed to', value.displayName);
    } else {
      setSearchQuery('');
    }
  }, [value]);
  
  // Filter staff based on selected status and role matrix
  const filteredStaff = useMemo(() => {
    if (!selectedStatus || !statusMatrix) return staffData;
    
    // Get roles that can see the selected status
    const allowedRoles = Object.entries(statusMatrix)
      .filter(([_, statuses]) => statuses.has(selectedStatus))
      .map(([role, _]) => role);
    
    // Filter staff by allowed roles, but always include the currently selected user
    const filtered = staffData.filter(staff => 
      staff.roles.some(role => allowedRoles.includes(role))
    );
    
    // If the current value is not in the filtered list, add it back
    if (value && !filtered.some(staff => staff.id === value.id)) {
      console.log('FilteredStaffSelect: Adding current value back to filtered list', value.displayName);
      filtered.unshift(value);
    }
    
    console.log('FilteredStaffSelect: Filtered staff count', filtered.length, 'for status', selectedStatus);
    return filtered;
  }, [staffData, selectedStatus, statusMatrix, value]);

  const searchFilteredStaff = useMemo(() => {
    if (!searchQuery.trim()) return filteredStaff;
    const query = searchQuery.toLowerCase();
    return filteredStaff.filter(staff => 
      staff.username.toLowerCase().includes(query) || 
      staff.displayName.toLowerCase().includes(query) ||
      staff.roles.some(role => role.toLowerCase().includes(query)) ||
      staff.departments.some(dept => dept.toLowerCase().includes(query))
    );
  }, [filteredStaff, searchQuery]);

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
        <Form.Label>{label} {required && <span className="text-danger">*</span>}</Form.Label>
        <div className="d-flex">
          <Form.Control
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            disabled={disabled}
            required={required}
          />
          {value && (
            <Button
              variant="outline-secondary"
              onClick={handleClear}
              disabled={disabled}
              className="ms-2"
            >
              Clear
            </Button>
          )}
        </div>
        {value && (
          <div className="mt-2">
            <small className="text-muted">
              Selected: {value.displayName} ({value.username})
            </small>
          </div>
        )}
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
          {searchFilteredStaff.length === 0 ? (
            <div className="p-3 text-center text-muted">
              <i className="bi bi-search me-2"></i>
              {selectedStatus ? `No staff members found for ${selectedStatus}` : 'No staff members found'}
            </div>
          ) : (
            searchFilteredStaff.map(staff => (
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
                    <div className="text-muted small">{staff.username}</div>
                  </div>
                  <div className="text-end">
                    <div className="small text-muted">
                      {staff.roles.slice(0, 2).join(', ')}
                      {staff.roles.length > 2 && '...'}
                    </div>
                    <div className="small text-muted">
                      {staff.departments.slice(0, 2).join(', ')}
                      {staff.departments.length > 2 && '...'}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

