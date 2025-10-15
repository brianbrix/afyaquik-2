import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import { apiClient } from '../../services/apiClient';

interface InvoiceViewerProps {
  show: boolean;
  onHide: () => void;
  billId: number;
  patientName: string;
}

export const InvoiceViewer: React.FC<InvoiceViewerProps> = ({
  show,
  onHide,
  billId,
  patientName
}) => {
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show && billId) {
      loadInvoice();
    }
  }, [show, billId]);

  const loadInvoice = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/billing/documents/invoice/${billId}`);
      setInvoice(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load invoice');
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
      <Modal show={show} onHide={onHide} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Invoice - {patientName}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-3">Loading invoice...</p>
        </Modal.Body>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal show={show} onHide={onHide} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Invoice - {patientName}</Modal.Title>
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
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Invoice - {patientName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {invoice && (
          <div className="invoice-container" id="invoice-content">
            {/* Header */}
            <div className="text-center mb-4">
              <h2 className="mb-1">MEDICAL INVOICE</h2>
              <p className="text-muted mb-0">Invoice #{invoice.invoiceNumber}</p>
              <p className="text-muted">Date: {invoice.invoiceDate}</p>
            </div>

            {/* Patient Information */}
            <div className="row mb-4">
              <div className="col-md-6">
                <h6>Bill To:</h6>
                <p className="mb-1"><strong>{invoice.patientName}</strong></p>
                <p className="mb-1">Patient ID: {invoice.patientId}</p>
                {invoice.patientPhone && <p className="mb-1">Phone: {invoice.patientPhone}</p>}
                {invoice.patientEmail && <p className="mb-0">Email: {invoice.patientEmail}</p>}
              </div>
              <div className="col-md-6 text-end">
                <h6>Invoice Details:</h6>
                <p className="mb-1">Invoice #: {invoice.invoiceNumber}</p>
                <p className="mb-1">Date: {invoice.invoiceDate}</p>
                {invoice.dueDate && <p className="mb-0">Due Date: {invoice.dueDate}</p>}
              </div>
            </div>

            {/* Items Table */}
            <div className="table-responsive mb-4">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th className="text-center">Qty</th>
                    <th className="text-end">Unit Price</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item: any, index: number) => (
                    <tr key={index}>
                      <td>{item.description}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-end">{formatCurrency(item.unitPrice)}</td>
                      <td className="text-end">{formatCurrency(item.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="row">
              <div className="col-md-6"></div>
              <div className="col-md-6">
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <td><strong>Subtotal:</strong></td>
                      <td className="text-end">{formatCurrency(invoice.subtotal)}</td>
                    </tr>
                    {invoice.discountAmount > 0 && (
                      <tr>
                        <td>Discount:</td>
                        <td className="text-end text-danger">-{formatCurrency(invoice.discountAmount)}</td>
                      </tr>
                    )}
                    <tr className="table-active">
                      <td><strong>Total Amount:</strong></td>
                      <td className="text-end"><strong>{formatCurrency(invoice.totalAmount)}</strong></td>
                    </tr>
                    <tr>
                      <td>Paid Amount:</td>
                      <td className="text-end text-success">{formatCurrency(invoice.paidAmount)}</td>
                    </tr>
                    <tr className="table-warning">
                      <td><strong>Balance Due:</strong></td>
                      <td className="text-end"><strong>{formatCurrency(invoice.balanceDue)}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payments */}
            {invoice.payments && invoice.payments.length > 0 && (
              <div className="mt-4">
                <h6>Payment History:</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-bordered">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.payments.map((payment: any, index: number) => (
                        <tr key={index}>
                          <td>{payment.paymentDate}</td>
                          <td>{formatCurrency(payment.amount)}</td>
                          <td>{payment.paymentMethod}</td>
                          <td>
                            <span className={`badge ${payment.status === 'COMPLETED' ? 'bg-success' : 'bg-warning'}`}>
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-5 pt-3 border-top">
              <div className="row">
                <div className="col-md-6">
                  <p className="text-muted small">
                    Thank you for choosing our medical services.<br />
                    For any inquiries, please contact our billing department.
                  </p>
                </div>
                <div className="col-md-6 text-end">
                  <p className="text-muted small">
                    Status: <span className={`badge ${invoice.status === 'PAID' ? 'bg-success' : invoice.status === 'PARTIALLY_PAID' ? 'bg-warning' : 'bg-danger'}`}>
                      {invoice.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
        <Button variant="primary" onClick={handlePrint}>
          <i className="bi bi-printer me-1"></i>
          Print Invoice
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
