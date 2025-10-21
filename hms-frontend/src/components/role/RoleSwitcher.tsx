import { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { useRoleContext } from "../../hooks/useRoleContext";

export function RoleSwitcher() {
  const { activeRole, availableRoles, setActiveRole } = useRoleContext();
  const [isConfirming, setIsConfirming] = useState(false);
  const [pendingRole, setPendingRole] = useState(activeRole);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setPendingRole(activeRole);
  }, [activeRole]);

  const handleSelect = (role: string | null) => {
    if (!role || role === activeRole) return;
    setPendingRole(role as typeof activeRole);
    setIsConfirming(true);
  };

  const confirmSwitch = async () => {
    setIsSaving(true);
    try {
      await setActiveRole(pendingRole);
      setIsConfirming(false);
    } catch (error) {
      console.error("Failed to switch role", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="d-flex align-items-center gap-2">
      <span className="text-light small">Active role:</span>
      <Dropdown onSelect={handleSelect}>
        <Dropdown.Toggle size="sm" variant="outline-light" disabled={isSaving}>
          {activeRole}
        </Dropdown.Toggle>
        <Dropdown.Menu className="dropdown-menu-constrained">
          {availableRoles.map((role: typeof activeRole) => (
            <Dropdown.Item key={role} eventKey={role} active={role === activeRole}>
              {role}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
      {isConfirming && (
        <button className="btn btn-warning btn-sm" onClick={confirmSwitch} disabled={isSaving}>
          {isSaving ? "Switching..." : "Confirm switch"}
        </button>
      )}
    </div>
  );
}
