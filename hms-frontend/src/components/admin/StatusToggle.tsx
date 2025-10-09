import React from 'react';

interface StatusToggleProps {
  enabled: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}

export const StatusToggle: React.FC<StatusToggleProps> = ({ enabled, onChange, disabled }) => {
  return (
    <button
      type="button"
      className={`btn btn-sm ${enabled ? 'btn-success' : 'btn-outline-secondary'}`}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
    >
      {enabled ? 'Active' : 'Disabled'}
    </button>
  );
};
