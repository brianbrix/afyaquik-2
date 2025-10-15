import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import { apiClient } from '../../services/apiClient';

interface ReceiptViewerProps {
  show: boolean;
  onHide: () => void;
  paymentId: number;
  patientName: string;
}

export const ReceiptViewer: React.FC<ReceiptViewerProps> = ({
  show,
  onHide,
  paymentId,
  patientName
}) => {
  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show && paymentId) {
      loadReceipt();
    }
  }, [show, paymentId]);

  const loadReceipt = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/billing/documents/receipt/${paymentId}`);
      setReceipt(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load receipt');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  if (loading) {
    return (
      <Modal show={show} onHide={onHide} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Receipt - {patientName}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-3">Loading receipt...</p>
        </Modal.Body>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal show={show} onHide={onHide} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Receipt - {patientName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">{error}</Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Receipt - {patientName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {receipt && (
          <div className="receipt-container" id="receipt-content">
            {/* Header */}
            <div className="text-center mb-4">
              <h2 className="mb-1">PAYMENT RECEIPT</h2>
              <p className="text-muted mb-0">Receipt #{receipt.receiptNumber}</p>
              <p className="text-muted">Date: {receipt.receiptDate}</p>
            </div>

            {/* Patient Information */}
            <div className="row mb-4">
              <div className="col-md-6">
                <h6>Patient Details:</h6>
                <p className="mb-1"><strong>{receipt.patientName}</strong></p>
                <p className="mb-1">Patient ID: {receipt.patientId}</p>
                {receipt.patientPhone && <p className="mb-1">Phone: {receipt.patientPhone}</p>}
                {receipt.patientEmail && <p className="mb-0">Email: {receipt.patientEmail}</p>}
              </div>
              <div className="col-md-6 text-end">
                <h6>Receipt Details:</h6>
                <p className="mb-1">Receipt #: {receipt.receiptNumber}</p>
                <p className="mb-1">Date: {receipt.receiptDate}</p>
                <p className="mb-0">Payment Date: {receipt.paymentDate}</p>
              </div>
            </div>

            {/* Payment Information */}
            <div className="card mb-4">
              <div className="card-header">
                <h6 className="mb-0">Payment Information</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <p className="mb-2"><strong>Amount Paid:</strong></p>
                    <h4 className="text-success">{formatCurrency(receipt.amount)}</h4>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-2"><strong>Payment Method:</strong></p>
                    <p className="mb-0">{receipt.paymentMethod}</p>
                  </div>
                </div>
                {receipt.reference && (
                  <div className="row mt-3">
                    <div className="col-md-6">
                      <p className="mb-1"><strong>Reference:</strong></p>
                      <p className="mb-0">{receipt.reference}</p>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-1"><strong>Status:</strong></p>
                      <span className={`badge ${receipt.status === 'COMPLETED' ? 'bg-success' : 'bg-warning'}`}>
                        {receipt.status}
                      </span>
                    </div>
                  </div>
                )}
                {receipt.notes && (
                  <div className="mt-3">
                    <p className="mb-1"><strong>Notes:</strong></p>
                    <p className="mb-0">{receipt.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bill Summary */}
            <div className="card mb-4">
              <div className="card-header">
                <h6 className="mb-0">Bill Summary</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <p className="mb-1"><strong>Bill Number:</strong> {receipt.billNumber}</p>
                    <p className="mb-0"><strong>Total Bill Amount:</strong> {formatCurrency(receipt.billTotal)}</p>
                  </div>
                  <div className="col-md-6 text-end">
                    <p className="mb-1"><strong>Remaining Balance:</strong></p>
                    <h5 className={receipt.billBalance > 0 ? 'text-warning' : 'text-success'}>
                      {formatCurrency(receipt.billBalance)}
                    </h5>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-top">
              <div className="text-center">
                <p className="text-muted small mb-2">
                  Thank you for your payment!
                </p>
                <p className="text-muted small">
                  This receipt serves as proof of payment for the services rendered.<br />
                  Please keep this receipt for your records.
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
        <Button variant="primary" onClick={handlePrint}>
          <i className="bi bi-printer me-1"></i>
          Print Receipt
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
