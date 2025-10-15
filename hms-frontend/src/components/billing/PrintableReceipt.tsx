import React from 'react';
import './PrintableReceipt.css';

interface PrintableReceiptProps {
  payment: {
    id: number;
    paymentNumber?: string;
    amount: number;
    paymentMethod: {
      name: string;
    };
    paymentDate: string;
    referenceNumber?: string;
    notes?: string;
    status: string;
    createdAt: string;
  };
  bill: {
    billNumber: string;
    patientName: string;
    patientId: number;
    totalAmount: number;
    paidAmount: number;
    balanceDue: number;
  };
}

export const PrintableReceipt = React.forwardRef<HTMLDivElement, PrintableReceiptProps>(({ payment, bill }, ref) => {
  // Debug logging
  console.log('PrintableReceipt received payment:', payment);
  console.log('PrintableReceipt received bill:', bill);
  
  // Safety check
  if (!payment || !bill) {
    return (
      <div ref={ref} className="printable-receipt">
        <div className="text-center py-5">
          <h3>No payment or bill data available</h3>
          <p>Please try again later.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div ref={ref} className="printable-receipt">
      {/* Header */}
      <div className="receipt-header">
        <h1>AfyaQuik HMS</h1>
        <h2>PAYMENT RECEIPT</h2>
        <div className="receipt-number">Receipt # {payment.paymentNumber || `PAY-${payment.id}`}</div>
      </div>

      {/* Receipt Info */}
      <div className="receipt-info">
        <div className="info-row">
          <span className="label">Date:</span>
          <span className="value">{new Date(payment.createdAt).toLocaleString()}</span>
        </div>
        <div className="info-row">
          <span className="label">Patient:</span>
          <span className="value">{bill.patientName} (ID: {bill.patientId})</span>
        </div>
        <div className="info-row">
          <span className="label">Bill Number:</span>
          <span className="value">{bill.billNumber}</span>
        </div>
      </div>

      {/* Payment Details */}
      <div className="payment-details">
        <h3>Payment Details</h3>
        <div className="detail-row">
          <span>Payment Method:</span>
          <span>{payment.paymentMethod.name}</span>
        </div>
        {payment.referenceNumber && (
          <div className="detail-row">
            <span>Reference Number:</span>
            <span>{payment.referenceNumber}</span>
          </div>
        )}
        <div className="detail-row">
          <span>Payment Date:</span>
          <span>{new Date(payment.paymentDate).toLocaleDateString()}</span>
        </div>
        <div className="detail-row">
          <span>Status:</span>
          <span className={`status-${payment.status.toLowerCase()}`}>{payment.status}</span>
        </div>
      </div>

      {/* Amount Details */}
      <div className="amount-details">
        <div className="amount-row">
          <span>Bill Total:</span>
          <span>KES {(bill.totalAmount || 0).toFixed(2)}</span>
        </div>
        <div className="amount-row payment">
          <span><strong>Amount Paid:</strong></span>
          <span><strong>KES {(payment.amount || 0).toFixed(2)}</strong></span>
        </div>
        <div className="amount-row total-paid">
          <span>Total Paid:</span>
          <span>KES {(bill.paidAmount || 0).toFixed(2)}</span>
        </div>
        <div className="amount-row balance">
          <span><strong>Balance Due:</strong></span>
          <span><strong>KES {(bill.balanceDue || 0).toFixed(2)}</strong></span>
        </div>
      </div>

      {/* Notes */}
      {payment.notes && (
        <div className="receipt-notes">
          <h4>Notes:</h4>
          <p>{payment.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="receipt-footer">
        <div className="thank-you">Thank you for your payment!</div>
        <div className="contact-info">
          <p>AfyaQuik Hospital Management System</p>
          <p>123 Healthcare Avenue, Nairobi, Kenya</p>
          <p>Phone: +254 700 000 000 | Email: info@afyaquik.com</p>
        </div>
        <div className="footer-note">
          This is a computer-generated receipt and is valid without signature.
        </div>
        <div className="stamp-section">
          <div className="stamp-box">
            <div>OFFICIAL STAMP</div>
          </div>
        </div>
      </div>
    </div>
  );
});

PrintableReceipt.displayName = 'PrintableReceipt';

