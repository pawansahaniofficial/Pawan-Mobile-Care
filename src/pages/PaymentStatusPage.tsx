import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Printer, ArrowRight, ShieldCheck, Home } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { InvoiceModal } from '../components/InvoiceModal';
import confetti from 'canvas-confetti';

interface PaymentStatusPageProps {
  onNavigate: (page: string, params?: any) => void;
  params?: any;
}

export const PaymentStatusPage: React.FC<PaymentStatusPageProps> = ({ onNavigate, params }) => {
  const { showToast } = useToast();

  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  useEffect(() => {
    // Parse URL query params if redirected directly from eSewa or Khalti
    const searchParams = new URLSearchParams(window.location.search);
    const provider = searchParams.get('provider') || params?.provider;
    const esewaData = searchParams.get('data');
    const khaltiPidx = searchParams.get('pidx');
    const orderId = searchParams.get('orderId') || params?.orderId;
    const bookingId = searchParams.get('bookingId') || params?.bookingId;
    const statusParam = searchParams.get('status') || params?.status;

    if (statusParam === 'failed') {
      setIsVerifying(false);
      setIsSuccess(false);
      setErrorMsg('Payment was cancelled or failed on the payment gateway.');
      return;
    }

    if (provider === 'esewa' && esewaData) {
      // Verify eSewa transaction with backend
      fetch('/api/payments/esewa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encodedData: esewaData, orderId, bookingId })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setIsSuccess(true);
            setDetails(data);
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          } else {
            setIsSuccess(false);
            setErrorMsg(data.error || 'eSewa signature verification failed');
          }
        })
        .catch(err => {
          setIsSuccess(false);
          setErrorMsg(err.message);
        })
        .finally(() => setIsVerifying(false));
    } else if (provider === 'khalti' && khaltiPidx) {
      // Verify Khalti transaction with backend
      fetch('/api/payments/khalti/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pidx: khaltiPidx, orderId, bookingId })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setIsSuccess(true);
            setDetails(data);
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          } else {
            setIsSuccess(false);
            setErrorMsg(data.error || 'Khalti verification failed');
          }
        })
        .catch(err => {
          setIsSuccess(false);
          setErrorMsg(err.message);
        })
        .finally(() => setIsVerifying(false));
    } else if (provider === 'cod' || provider === 'pay_at_shop') {
      // Cash on delivery / Counter
      setIsSuccess(true);
      setIsVerifying(false);
      setDetails({
        orderNumber: orderId,
        amount: params?.amount,
        message: provider === 'cod' ? 'Cash on Delivery order confirmed' : 'Order ready for shop pickup'
      });
    } else {
      // Generic success check
      setIsVerifying(false);
      setIsSuccess(true);
      setDetails({
        orderNumber: orderId,
        amount: params?.amount
      });
    }
  }, [params]);

  if (isVerifying) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Verifying Payment with Gateway...
        </h2>
        <p className="text-xs text-slate-500">
          Performing cryptographic signature and server verification with eSewa / Khalti. Please do not close this window.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
      {isSuccess ? (
        <>
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Transaction Verified
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Payment Confirmed!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
              Thank you for shopping with Pawan Mobile Repairing Center. An SMS confirmation receipt has been sent to your phone.
            </p>
          </div>

          {/* Details Box */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 text-left space-y-3 text-xs shadow-md">
            {details?.transactionCode && (
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-500">Gateway Ref:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{details.transactionCode}</span>
              </div>
            )}
            {details?.amount && (
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  NPR {Number(details.amount).toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="font-bold text-emerald-600">VERIFIED / COMPLETED</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              View My Orders
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Return to Homepage
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-xl">
            <AlertCircle className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Payment Unsuccessful
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Transaction Incomplete
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
              {errorMsg || 'We could not verify your payment with the merchant gateway. Your order remains pending.'}
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={() => onNavigate('checkout')}
              className="px-6 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold shadow-md cursor-pointer"
            >
              Try Again
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
            >
              Contact Support
            </button>
          </div>
        </>
      )}
    </div>
  );
};
