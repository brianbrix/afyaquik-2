import React from 'react';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import './PrintableInvoice.css';

interface PrintableInvoiceProps {
  bill: {
    id: number;
    billNumber: string;
    patientId: number;
    patientName: string;
    queueItemId?: number;
    status: string;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    paidAmount: number;
    balanceDue: number;
    billingDate: string;
    dueDate?: string;
    paymentTerms?: string;
    notes?: string;
    items: Array<{
      id: number;
      description: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
      serviceCategory?: string;
    }>;
    discounts?: Array<{
      id: number;
      description: string;
      type: 'PERCENTAGE' | 'FIXED';
      value: number;
      amount: number;
      appliedBy: string;
      appliedAt: string;
    }>;
  };
}

export const PrintableInvoice = React.forwardRef<HTMLDivElement, PrintableInvoiceProps>(({ bill }, ref) => {
  const { formatCurrency } = useSystemSettings();
  
  // Debug logging
  console.log('PrintableInvoice received bill:', bill);

  // Safety check
  if (!bill) {
    return (
      <div ref={ref} className="printable-invoice">
        <div className="text-center py-5">
          <h3>No bill data available</h3>
          <p>Please try again later.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div ref={ref} className="printable-invoice">
      {/* Header */}
      <div className="invoice-header">
        <div className="company-info">
          <h1>AfyaQuik Hospital Management System</h1>
          <p>123 Healthcare Avenue</p>
          <p>Nairobi, Kenya</p>
          <p>Phone: +254 700 000 000</p>
          <p>Email: info@afyaquik.com</p>
        </div>
        <div className="invoice-title">
          <h2>INVOICE</h2>
          <p className="invoice-number">#{bill.billNumber}</p>
          <p className="invoice-date">Date: {new Date(bill.billingDate).toLocaleDateString()}</p>
          {bill.dueDate && (
            <p className="due-date">Due Date: {new Date(bill.dueDate).toLocaleDateString()}</p>
          )}
        </div>
      </div>

      {/* Patient Information */}
      <div className="patient-info">
        <h3>Bill To:</h3>
        <p><strong>{bill.patientName}</strong></p>
        <p>Patient ID: {bill.patientId}</p>
        {bill.queueItemId && <p>Visit ID: {bill.queueItemId}</p>}
      </div>

      {/* Bill Status */}
      <div className="bill-status">
        <span className={`status-badge status-${bill.status.toLowerCase()}`}>
          {bill.status}
        </span>
      </div>

      {/* Items Table */}
      <table className="items-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Description</th>
            <th>Category</th>
            <th className="text-right">Quantity</th>
            <th className="text-right">Unit Price</th>
            <th className="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>{item.description}</td>
              <td>{item.serviceCategory || '-'}</td>
              <td className="text-right">{(item.quantity || 0).toFixed(2)}</td>
              <td className="text-right">{formatCurrency(item.unitPrice || 0)}</td>
              <td className="text-right">{formatCurrency(item.lineTotal || 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Discounts Section */}
      {bill.discounts && bill.discounts.length > 0 && (
        <div className="discounts-section">
          <h4>Discounts Applied:</h4>
          <table className="discounts-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Type</th>
                <th>Value</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bill.discounts.map(discount => (
                <tr key={discount.id}>
                  <td>{discount.description}</td>
                  <td>{discount.type === 'PERCENTAGE' ? 'Percentage' : 'Fixed'}</td>
                  <td>{discount.type === 'PERCENTAGE' ? `${discount.value}%` : formatCurrency(discount.value || 0)}</td>
                  <td className="text-right">-{formatCurrency(discount.amount || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Totals */}
      <div className="totals-section">
        <div className="totals-row">
            <span>Subtotal:</span>
            <span>{formatCurrency(bill.subtotal || 0)}</span>
        </div>
        {(bill.taxAmount || 0) > 0 && (
          <div className="totals-row">
            <span>Tax:</span>
            <span>{formatCurrency(bill.taxAmount || 0)}</span>
          </div>
        )}
        {(bill.discountAmount || 0) > 0 && (
          <div className="totals-row discount">
            <span>Discount:</span>
            <span>-{formatCurrency(bill.discountAmount || 0)}</span>
          </div>
        )}
        <div className="totals-row total">
          <span><strong>Total Amount:</strong></span>
          <span><strong>{formatCurrency(bill.totalAmount || 0)}</strong></span>
        </div>
        <div className="totals-row paid">
          <span>Paid Amount:</span>
          <span>{formatCurrency(bill.paidAmount || 0)}</span>
        </div>
        <div className="totals-row balance">
          <span><strong>Balance Due:</strong></span>
          <span><strong>{formatCurrency(bill.balanceDue || 0)}</strong></span>
        </div>
      </div>

      {/* Payment Terms */}
      {bill.paymentTerms && (
        <div className="payment-terms">
          <h4>Payment Terms:</h4>
          <p>{bill.paymentTerms}</p>
        </div>
      )}

      {/* Notes */}
      {bill.notes && (
        <div className="notes">
          <h4>Notes:</h4>
          <p>{bill.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="invoice-footer">
        <p>Thank you for choosing AfyaQuik Hospital Management System!</p>
        <p className="footer-note">This is a computer-generated invoice and does not require a signature.</p>
      </div>
    </div>
  );
});

PrintableInvoice.displayName = 'PrintableInvoice';

