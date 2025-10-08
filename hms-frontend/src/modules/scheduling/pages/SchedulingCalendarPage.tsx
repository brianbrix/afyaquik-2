import { Button, Card } from "react-bootstrap";
import { PageHeader } from "../../../components/shared/PageHeader";

export function SchedulingCalendarPage() {
  return (
    <div className="d-flex flex-column gap-3">
      <PageHeader
        title="Scheduling"
        subtitle="Coordinate provider availability, procedure rooms, and shared resources."
        actions={<Button variant="outline-primary">Sync calendars</Button>}
      />
      <Card className="shadow-sm">
        <Card.Body>
          <p className="text-muted mb-0">
            Shared staff calendar with department and role filters will be rendered here.
          </p>
        </Card.Body>
      </Card>
    </div>
  );
}
