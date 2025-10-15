import React, { useState } from 'react';
import { Button, Form, Modal, Row, Col } from 'react-bootstrap';

interface DateRangePickerProps {
  onDateRangeChange: (startDate: string, endDate: string) => void;
  onClear: () => void;
  disabled?: boolean;
}

export function DateRangePicker({ onDateRangeChange, onClear, disabled }: DateRangePickerProps) {
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleApply = () => {
    if (startDate && endDate) {
      onDateRangeChange(startDate, endDate);
      setShowModal(false);
    }
  };

  const handleQuickSelect = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    setStartDate(formatDate(start));
    setEndDate(formatDate(end));
    onDateRangeChange(formatDate(start), formatDate(end));
    setShowModal(false);
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    onClear();
    setShowModal(false);
  };

  return (
    <>
      <Button 
        variant="outline-secondary" 
        onClick={() => setShowModal(true)}
        disabled={disabled}
      >
        <i className="bi bi-calendar-range me-1"></i>
        Date Range
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Select Date Range</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="mt-4">
            <h6>Quick Select</h6>
            <div className="d-flex flex-wrap gap-2">
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => handleQuickSelect(7)}
              >
                Last 7 days
              </Button>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => handleQuickSelect(30)}
              >
                Last 30 days
              </Button>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => handleQuickSelect(90)}
              >
                Last 90 days
              </Button>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => handleQuickSelect(365)}
              >
                Last year
              </Button>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClear}>
            Clear Range
          </Button>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleApply}
            disabled={!startDate || !endDate}
          >
            Apply
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
