import { Button, Card, Table } from "react-bootstrap";
import { FilterBar } from "../../../components/shared/FilterBar";

export function PatientsPage() {
  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h1 className="h4 mb-0">Patients</h1>
          <span className="text-muted">Search, filter, and manage patient records.</span>
        </div>
        <Button variant="primary">New patient</Button>
      </div>
      <Card className="shadow-sm">
        <Card.Body>
          <div className="mb-3">
            <FilterBar placeholder="Search patients" />
          </div>
          <div className="table-responsive">
            <Table hover className="mb-0">
            <thead>
              <tr>
                <th>MRN</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Last visit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>AFQ-0001</td>
                <td>Jane Doe</td>
                <td>+254 700 000 000</td>
                <td>3 Oct 2025</td>
                <td>Active</td>
              </tr>
              <tr>
                <td>AFQ-0002</td>
                <td>John Mwangi</td>
                <td>+254 711 222 333</td>
                <td>1 Oct 2025</td>
                <td>Follow-up due</td>
              </tr>
            </tbody>
          </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
