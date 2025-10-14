import React, { useState } from 'react';
import { Card, Row, Col, Button, Nav, Tab } from 'react-bootstrap';
import { PageHeader } from '../../../components/shared/PageHeader';
import { TestCatalogAdmin } from '../../../modules/admin/pages/TestCatalogAdmin';
import { TestCategoryAdmin } from '../../../modules/admin/pages/TestCategoryAdmin';
import { ResultTemplateAdmin } from '../../../modules/admin/pages/ResultTemplateAdmin';
import { DiagnosticOrderAdmin } from '../../../modules/admin/pages/DiagnosticOrderAdmin';
import { SampleAdmin } from '../../../modules/admin/pages/SampleAdmin';
import { DiagnosticResultAdmin } from '../../../modules/admin/pages/DiagnosticResultAdmin';

export function DiagnosticsAdminPage() {
  const [activeTab, setActiveTab] = useState('catalog');

  return (
    <div className="d-flex flex-column gap-3">
      <PageHeader
        title="Diagnostics Administration"
        subtitle="Manage test catalogs, categories, templates, and diagnostic workflows"
      />
      
      <Card className="shadow-sm border-0">
        <Card.Body>
          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'catalog')}>
            <Row>
              <Col md={3}>
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="catalog" className="d-flex align-items-center">
                      <i className="bi bi-clipboard-data me-2"></i>
                      Test Catalog
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="categories" className="d-flex align-items-center">
                      <i className="bi bi-tags me-2"></i>
                      Test Categories
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="templates" className="d-flex align-items-center">
                      <i className="bi bi-file-earmark-text me-2"></i>
                      Result Templates
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="orders" className="d-flex align-items-center">
                      <i className="bi bi-clipboard-check me-2"></i>
                      Diagnostic Orders
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="samples" className="d-flex align-items-center">
                      <i className="bi bi-droplet me-2"></i>
                      Sample Management
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="results" className="d-flex align-items-center">
                      <i className="bi bi-graph-up me-2"></i>
                      Results Management
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Col>
              <Col md={9}>
                <Tab.Content>
                  <Tab.Pane eventKey="catalog">
                    <TestCatalogAdmin />
                  </Tab.Pane>
                  <Tab.Pane eventKey="categories">
                    <TestCategoryAdmin />
                  </Tab.Pane>
                  <Tab.Pane eventKey="templates">
                    <ResultTemplateAdmin />
                  </Tab.Pane>
                  <Tab.Pane eventKey="orders">
                    <DiagnosticOrderAdmin />
                  </Tab.Pane>
                  <Tab.Pane eventKey="samples">
                    <SampleAdmin />
                  </Tab.Pane>
                  <Tab.Pane eventKey="results">
                    <DiagnosticResultAdmin />
                  </Tab.Pane>
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>
        </Card.Body>
      </Card>
    </div>
  );
}
