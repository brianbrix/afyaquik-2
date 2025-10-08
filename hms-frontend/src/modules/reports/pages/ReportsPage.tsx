import { Card, Col, Row } from "react-bootstrap";
import { PageHeader } from "../../../components/shared/PageHeader";
import { FilterBar } from "../../../components/shared/FilterBar";

export function ReportsPage() {
  return (
    <div className="d-flex flex-column gap-3">
      <PageHeader
        title="Reports & analytics"
        subtitle="Generate operational, financial, and compliance dashboards."
        actions={<FilterBar placeholder="Filter reports" />}
      />
      <Row className="g-3">
        {["Operational snapshot", "Finance summary", "Compliance audit"].map((report) => (
          <Col key={report} xl={4} md={6}>
            <Card className="shadow-sm h-100">
              <Card.Body className="d-flex flex-column">
                <h2 className="h5">{report}</h2>
                <p className="text-muted flex-grow-1">
                  Placeholder content describing metrics and export options for the {report.toLowerCase()}.
                </p>
                <a className="stretched-link" href="#">
                  View report
                </a>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
