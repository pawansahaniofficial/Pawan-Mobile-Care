import React from 'react';
import { X, Printer, CheckCircle, ShieldCheck, Smartphone, Wrench } from 'lucide-react';
import { Order, RepairBooking } from '../types';

interface InvoiceModalProps {
  order?: Order;
  booking?: RepairBooking;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, booking, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = order ? order.orderNumber : (booking ? booking.bookingNumber : 'INV-0001');
  const invoiceDate = order ? new Date(order.createdAt).toLocaleDateString('en-GB') : (booking ? new Date(booking.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'));
  const customerName = order ? order.customerName : (booking ? booking.customerName : 'Valued Customer');
  const customerPhone = order ? order.customerPhone : (booking ? booking.customerPhone : '');
  const customerEmail = order ? order.customerEmail : (booking ? booking.customerEmail : '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden my-8 print:m-0 print:shadow-none print:w-full print:max-w-none">
        {/* Action Header (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Tax Invoice / Service Receipt
            </span>
            <span className="text-xs text-slate-400">#{invoiceNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Document Body */}
        <div className="p-8 print:p-6 text-slate-900 bg-white" id="printable-invoice">
          {/* Shop Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                  PAWAN MOBILE REPAIRING CENTER
                </h1>
              </div>
              <p className="text-xs text-slate-600">
                Main Commercial Road, Biratnagar / Kathmandu, Nepal
              </p>
              <p className="text-xs text-slate-600 font-mono">
                Phone: +977-9812345678 | Email: contact@pawanmobile.com
              </p>
              <p className="text-xs font-semibold text-slate-700 mt-1">
                PAN / VAT Reg No: <span className="font-mono">601289453</span>
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider">
                {order ? 'Retail Invoice' : 'Repair Job Card'}
              </span>
              <p className="text-sm font-bold font-mono text-slate-900 mt-2">
                #{invoiceNumber}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Date: {invoiceDate}
              </p>
            </div>
          </div>

          {/* Billed To */}
          <div className="grid grid-cols-2 gap-6 mb-6 text-xs">
            <div>
              <p className="font-bold text-slate-400 uppercase tracking-wider mb-1">
                Customer Details:
              </p>
              <p className="text-sm font-bold text-slate-900">{customerName}</p>
              <p className="text-slate-600 font-mono">{customerPhone}</p>
              {customerEmail && <p className="text-slate-600">{customerEmail}</p>}
              {order?.shippingAddress && (
                <p className="text-slate-600 mt-1">
                  Delivery Address: {order.shippingAddress.street}, {order.shippingAddress.city}
                </p>
              )}
            </div>

            <div className="text-right">
              <p className="font-bold text-slate-400 uppercase tracking-wider mb-1">
                Payment Details:
              </p>
              <p className="font-semibold text-slate-900 capitalize">
                Method: {order?.paymentMethod || 'Shop Counter / eSewa / Khalti'}
              </p>
              <div className="inline-flex items-center gap-1 mt-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-200">
                <CheckCircle className="w-3 h-3" />
                <span>Status: {(order?.paymentStatus || booking?.status === 'Completed' ? 'VERIFIED / PAID' : 'PENDING')}</span>
              </div>
              {order?.transactionId && (
                <p className="text-slate-500 font-mono mt-1 text-[11px]">
                  Txn ID: {order.transactionId}
                </p>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="p-3">SN</th>
                  <th className="p-3">Description / Service</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Total (NPR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {order && order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-3 text-slate-400">{idx + 1}</td>
                    <td className="p-3">
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">SKU: {item.sku}</p>
                    </td>
                    <td className="p-3 text-right font-mono">NPR {item.price.toLocaleString()}</td>
                    <td className="p-3 text-center">{item.quantity}</td>
                    <td className="p-3 text-right font-mono font-bold">
                      NPR {(item.price * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}

                {booking && (
                  <>
                    <tr>
                      <td className="p-3 text-slate-400">1</td>
                      <td className="p-3">
                        <p className="font-semibold text-slate-900">{booking.serviceTitle}</p>
                        <p className="text-[11px] text-slate-500">
                          Device: {booking.brand} {booking.model}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Problem: {booking.issueDescription}
                        </p>
                      </td>
                      <td className="p-3 text-right font-mono">
                        NPR {(booking.quotedCost || booking.laborCharge || 1200).toLocaleString()}
                      </td>
                      <td className="p-3 text-center">1</td>
                      <td className="p-3 text-right font-mono font-bold">
                        NPR {(booking.quotedCost || booking.laborCharge || 1200).toLocaleString()}
                      </td>
                    </tr>
                    {booking.partsUsed && booking.partsUsed.map((part, pIdx) => (
                      <tr key={'part-' + pIdx}>
                        <td className="p-3 text-slate-400">{pIdx + 2}</td>
                        <td className="p-3">
                          <p className="font-semibold text-slate-900">{part.partName}</p>
                          <p className="text-[11px] text-slate-400">Genuine Replacement Part</p>
                        </td>
                        <td className="p-3 text-right font-mono">NPR {part.cost.toLocaleString()}</td>
                        <td className="p-3 text-center">1</td>
                        <td className="p-3 text-right font-mono font-bold">
                          NPR {part.cost.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Subtotal Calculation */}
          <div className="flex justify-end mb-6 text-xs">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono">
                  NPR {(order?.subtotal || booking?.quotedCost || 1200).toLocaleString()}
                </span>
              </div>
              {order && order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Savings:</span>
                  <span className="font-mono">-NPR {order.discount.toLocaleString()}</span>
                </div>
              )}
              {order && (
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charge:</span>
                  <span className="font-mono">
                    {order.deliveryCharge === 0 ? 'FREE' : `NPR ${order.deliveryCharge}`}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-slate-900 border-t border-slate-200 pt-2">
                <span>Total Amount:</span>
                <span className="font-mono text-sky-600">
                  NPR {(order?.total || booking?.quotedCost || 1200).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Terms & Warranty Notice */}
          <div className="border-t border-slate-200 pt-4 text-[11px] text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Terms & Warranty Policy:</p>
            <p>· Display & Screen replacement comes with 180 days touch warranty (physical and liquid damage excluded).</p>
            <p>· Batteries and charging adapters carry a 6-month shop replacement warranty upon presentation of this invoice.</p>
            <p>· For repair inquiries or warranty claims, contact: <strong>+977-9812345678</strong>.</p>
          </div>

          {/* Signoff */}
          <div className="flex justify-between items-end mt-8 pt-4 border-t border-dashed border-slate-200 text-xs">
            <div>
              <p className="font-bold text-slate-900">Pawan Mobile Repairing Center</p>
              <p className="text-[10px] text-slate-400">Authorized Technician Signature</p>
            </div>
            <div className="text-right">
              <p className="italic text-slate-500">“Thank you for trusting our craft!”</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
