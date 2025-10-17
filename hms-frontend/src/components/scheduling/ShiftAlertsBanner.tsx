
import { useShiftAlerts } from "../../hooks/useShiftAlerts";
import { Alert, Button, Spinner, Fade } from "react-bootstrap";
import { SHIFT_STATUS_LABELS, type StaffShift } from "../../types/scheduling";
import React from "react";
import { toNairobiIsoString, toDayFormat } from "../../utils/timezone";
import { useSystemSettings } from "../../hooks/useSystemSettings";


export function ShiftAlertsBanner({ onCheckIn, onCheckOut }: {
  onCheckIn: (shift: StaffShift) => void;
  onCheckOut: (shift: StaffShift) => void;
}) {
  const { data: alerts, isLoading, isError, isFetching } = useShiftAlerts();
  const { settings } = useSystemSettings();
  // Only show spinner on initial load, not on background polling
  const showSpinner = isLoading && !alerts;
  const hasAlerts = !isError && alerts && alerts.length > 0;
  
  // Use a stable container height to prevent layout shifts
  const containerStyle = {
    minHeight: hasAlerts ? 'auto' : '0px',
    transition: 'min-height 0.3s ease-in-out'
  };

  return (
    <div className="mb-3" style={containerStyle}>
      {/* Always render the container, fade in/out the content */}
      {showSpinner ? (
        <div className="d-flex align-items-center">
          <Spinner animation="border" size="sm" className="me-2" />
          <span className="text-muted">Loading shift alerts...</span>
        </div>
      ) : (
        <Fade in={hasAlerts} appear={true} mountOnEnter unmountOnExit>
          <div>
            {hasAlerts && alerts!.map(shift => (
              <Alert key={shift.id} variant="warning" className="d-flex align-items-center justify-content-between mb-2">
                <div>
                  <b>Shift Alert:</b> {SHIFT_STATUS_LABELS[shift.status]} for <b>{shift.staffDisplayName}</b> ({shift.roleName})<br />
                  <span>From <b>{toDayFormat(shift.startsAt, settings)}</b> to <b>{toDayFormat(shift.endsAt, settings)}</b></span>
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
      {/* Remove the background fetching indicator to prevent twitching */}
    </div>
  );
}
