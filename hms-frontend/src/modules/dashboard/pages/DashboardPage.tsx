import { Card, Col, Row } from "react-bootstrap";
import { PageHeader } from "../../../components/shared/PageHeader";

export function DashboardPage() {
  return (
    <div className="d-flex flex-column gap-3">
      <PageHeader
        title="Welcome back"
        subtitle="Track hospital-wide KPIs, open tasks, and real-time patient flow snapshots."
      />
      <Row className="g-3">
        {[
          { title: "Patients waiting", value: 12 },
          { title: "In-clinic now", value: 34 },
          { title: "Pending diagnostics", value: 7 }
        ].map((metric) => (
          <Col key={metric.title} lg={4} md={6} sm={12}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <span className="text-uppercase text-muted small">{metric.title}</span>
                <h2 className="display-6 fw-semibold mb-0">{metric.value}</h2>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
