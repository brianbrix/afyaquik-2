
import { useShiftAlerts } from "../../hooks/useShiftAlerts";
import { Alert, Button, Spinner, Fade } from "react-bootstrap";
import { SHIFT_STATUS_LABELS, type StaffShift } from "../../types/scheduling";
import React from "react";


export function ShiftAlertsBanner({ onCheckIn, onCheckOut }: {
  onCheckIn: (shift: StaffShift) => void;
  onCheckOut: (shift: StaffShift) => void;
}) {
  const { data: alerts, isLoading, isError, isFetching } = useShiftAlerts();
  // Only show spinner on initial load, not on background polling
  const showSpinner = isLoading && !alerts;
  const hasAlerts = !isError && alerts && alerts.length > 0;

  return (
    <div className="mb-3" style={{ minHeight: 0 }}>
      {/* Always render the container, fade in/out the content */}
      {showSpinner ? (
        <Spinner animation="border" size="sm" className="me-2" />
      ) : (
        <Fade in={hasAlerts} appear={true} mountOnEnter unmountOnExit>
          <div>
            {hasAlerts && alerts!.map(shift => (
              <Alert key={shift.id} variant="warning" className="d-flex align-items-center justify-content-between mb-2">
                <div>
                  <b>Shift Alert:</b> {SHIFT_STATUS_LABELS[shift.status]} for <b>{shift.staffDisplayName}</b> ({shift.roleName})<br />
                  <span>From <b>{new Date(shift.startsAt).toLocaleString()}</b> to <b>{new Date(shift.endsAt).toLocaleString()}</b></span>
                </div>
                <div>
                  {shift.status === "SCHEDULED" && (
                    <Button size="sm" variant="primary" onClick={() => onCheckIn(shift)}>
                      Check In
                    </Button>
                  )}
                  {(shift.status === "CHECKED_IN" || shift.status === "IN_PROGRESS") && (
                    <Button size="sm" variant="success" onClick={() => onCheckOut(shift)}>
                      Check Out
                    </Button>
                  )}
                </div>
              </Alert>
            ))}
          </div>
        </Fade>
      )}
      {/* Optionally, show a subtle indicator if background fetching */}
      {hasAlerts && isFetching && !isLoading && (
        <div style={{ fontSize: 12, color: '#888', marginTop: -8, marginBottom: 4 }}>Refreshing alerts…</div>
      )}
    </div>
  );
}
