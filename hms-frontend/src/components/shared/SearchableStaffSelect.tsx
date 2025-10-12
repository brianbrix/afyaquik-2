import { useState, useMemo } from "react";
import { Spinner } from "react-bootstrap";
import Select from "react-select";
import { useStaffDirectory } from "../../services/staffDirectoryApi";

export function SearchableStaffSelect({ value, onChange, disabled = false, name = "staffUserId", required = false }: {
  value: number | undefined;
  onChange: (id: number | undefined) => void;
  disabled?: boolean;
  name?: string;
  required?: boolean;
}) {
  const [q, setQ] = useState("");
  const { data: staff, isLoading } = useStaffDirectory(!disabled, q);


  // Always show the selected user in the dropdown, even if not in the current query
  const selectedOption = useMemo(() => {
    if (!value) return null;
    const found = (staff || []).find(s => s.id === value);
    if (found) return { value: found.id, label: found.displayName || found.username };
    // If not found, fallback to showing the id
    return { value, label: `User #${value}` };
  }, [value, staff]);

  const options = useMemo(() => {
    const opts = (staff || []).map(s => ({ value: s.id, label: s.displayName || s.username }));
    // Ensure selected option is present
    if (selectedOption && !opts.some(o => o.value === selectedOption.value)) {
      return [selectedOption, ...opts];
    }
    return opts;
  }, [staff, selectedOption]);

  return (
    <div style={{ minWidth: 220 }}>
      <Select
        inputId={name}
        name={name}
        value={selectedOption}
        onChange={opt => onChange(opt ? opt.value : undefined)}
        onInputChange={setQ}
        options={options}
        isDisabled={disabled}
        isClearable={!required}
        isLoading={isLoading}
        placeholder="Search staff..."
        required={required}
        styles={{ menu: base => ({ ...base, zIndex: 9999 }) }}
      />
      {isLoading && <Spinner animation="border" size="sm" className="ms-2" />}
    </div>
  );
}
