import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Smartphone,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Upload,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { DeviceBrand, RepairService } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';

interface BookRepairPageProps {
  onNavigate: (page: string, params?: any) => void;
  initialParams?: any;
}

const TIME_SLOTS = [
  '09:30 AM - 10:30 AM',
  '11:00 AM - 12:00 PM',
  '12:30 PM - 01:30 PM',
  '02:00 PM - 03:00 PM',
  '03:30 PM - 04:30 PM',
  '05:00 PM - 06:00 PM',
  '06:30 PM - 07:30 PM'
];

export const BookRepairPage: React.FC<BookRepairPageProps> = ({ onNavigate, initialParams }) => {
  const { user } = useAuth();
  const { showToast, showSmsToast } = useToast();

  const [brands, setBrands] = useState<DeviceBrand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('Apple iPhone');
  const [customBrand, setCustomBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [customModel, setCustomModel] = useState('');

  const [category, setCategory] = useState(initialParams?.serviceCategory || 'display');
  const [serviceTitle, setServiceTitle] = useState(initialParams?.serviceTitle || 'Original / OLED Display & Touch Replacement');
  const [issueDescription, setIssueDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // Date defaults to tomorrow
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [appointmentDate, setAppointmentDate] = useState(tomorrow);
  const [timeSlot, setTimeSlot] = useState('11:00 AM - 12:00 PM');
  const [serviceType, setServiceType] = useState<'shop_visit' | 'pickup_delivery' | 'free_diagnosis'>('shop_visit');
  const [pickupAddress, setPickupAddress] = useState('');

  // Customer Contact
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/repairs/brands')
      .then(res => res.json())
      .then(data => {
        setBrands(data.brands || []);
        if (data.brands && data.brands.length > 0) {
          const defaultB = data.brands[0];
          setSelectedBrand(defaultB.name);
          if (defaultB.models && defaultB.models.length > 0) {
            setSelectedModel(defaultB.models[0]);
          }
        }
      })
      .catch(e => console.error(e));
  }, []);

  // Update selected model when brand changes
  useEffect(() => {
    const matched = brands.find(b => b.name === selectedBrand);
    if (matched && matched.models.length > 0) {
      setSelectedModel(matched.models[0]);
    } else {
      setSelectedModel('');
    }
  }, [selectedBrand, brands]);

  // Update title based on category
  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    const map: Record<string, string> = {
      display: 'Original / OLED Display & Touch Replacement',
      battery: 'Genuine Battery Replacement',
      charging: 'Charging Port & Pin Replacement',
      power: 'Motherboard Short-Circuit & Dead Phone Recovery',
      additional: 'Water Damage Ultrasonic Cleaning',
      audio: 'Loudspeaker, Earpiece & Mic Replacement',
      network: 'Network Signal & Wi-Fi IC Repair',
      camera: 'Camera Module & Lens Replacement',
      software: 'Official Firmware Recovery & Boot-loop Repair'
    };
    setServiceTitle(map[cat] || 'General Diagnostic Check');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalBrand = selectedBrand === 'Other Brand' ? customBrand : selectedBrand;
    const finalModel = selectedModel === 'Other Model' ? customModel : selectedModel;

    if (!finalBrand || !finalModel) {
      showToast('error', 'Device Required', 'Please specify your phone brand and model.');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      showToast('error', 'Contact Details Required', 'Please enter your name and phone number for SMS tracking.');
      return;
    }

    if (serviceType === 'pickup_delivery' && !pickupAddress.trim()) {
      showToast('error', 'Address Required', 'Please enter your doorstep pickup address in Nepal.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: finalBrand,
          model: finalModel,
          serviceCategory: category,
          serviceTitle,
          issueDescription: issueDescription || 'General diagnosis requested.',
          photos: photoUrl ? [photoUrl] : [],
          appointmentDate,
          timeSlot,
          serviceType,
          pickupAddress: serviceType === 'pickup_delivery' ? pickupAddress : undefined,
          customerName,
          customerPhone,
          customerEmail
        })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast('error', 'Booking Failed', data.error);
        setIsSubmitting(false);
        return;
      }

      setBookingSuccess(data.booking);
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });

      // Trigger SMS Toast notification for customer visibility
      const smsMsg = `[Pawan Mobile] Namaste ${customerName}, your repair booking #${data.booking.bookingNumber} for ${finalBrand} ${finalModel} is confirmed on ${appointmentDate} (${timeSlot}). Helpline: +977-9812345678.`;
      showSmsToast(customerPhone, smsMsg);
      showToast('success', 'Repair Appointment Confirmed!', data.message);
    } catch (err: any) {
      showToast('error', 'Submission Error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const matchedBrand = brands.find(b => b.name === selectedBrand);

  if (bookingSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg animate-bounce">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Appointment Booked Successfully
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Tracking ID: #{bookingSuccess.bookingNumber}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            An automated transactional SMS confirmation has been sent to <strong>{bookingSuccess.customerPhone}</strong>.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 text-left space-y-3 text-xs shadow-md">
          <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-slate-500">Device:</span>
            <span className="font-bold text-slate-900 dark:text-white">{bookingSuccess.brand} {bookingSuccess.model}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-slate-500">Service:</span>
            <span className="font-bold text-slate-900 dark:text-white">{bookingSuccess.serviceTitle}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-slate-500">Scheduled Date:</span>
            <span className="font-bold text-sky-600 dark:text-sky-400">{bookingSuccess.appointmentDate} ({bookingSuccess.timeSlot})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Service Mode:</span>
            <span className="font-bold text-slate-900 dark:text-white capitalize">{bookingSuccess.serviceType.replace('_', ' ')}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('track-repair', { bookingNumber: bookingSuccess.bookingNumber, phone: bookingSuccess.customerPhone })}
            className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            Track Repair Progress Live
          </button>
          <button
            onClick={() => {
              setBookingSuccess(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Book Another Phone
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-xs font-bold uppercase tracking-wider">
          <Wrench className="w-3.5 h-3.5 text-sky-500" />
          <span>12-Step Guided System</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Book Your Smartphone Repair
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Reserve an express slot at our repair lab or schedule home pickup in Nepal.
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
        {/* Section 1: Device Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Smartphone className="w-4 h-4 text-sky-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              1. Select Device Brand & Model
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Phone Brand
              </label>
              <select
                value={selectedBrand}
                onChange={e => setSelectedBrand(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:border-sky-500 focus:outline-hidden"
              >
                {brands.map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
                <option value="Other Brand">Other / Unlisted Brand</option>
              </select>
              {selectedBrand === 'Other Brand' && (
                <input
                  type="text"
                  placeholder="Enter brand name..."
                  value={customBrand}
                  onChange={e => setCustomBrand(e.target.value)}
                  className="mt-2 w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  required
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Phone Model
              </label>
              {matchedBrand && matchedBrand.models.length > 0 ? (
                <select
                  value={selectedModel}
                  onChange={e => setSelectedModel(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:border-sky-500 focus:outline-hidden"
                >
                  {matchedBrand.models.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                  <option value="Other Model">Other Model Variant</option>
                </select>
              ) : null}

              {(selectedModel === 'Other Model' || !matchedBrand) && (
                <input
                  type="text"
                  placeholder="e.g. Redmi Note 11 Pro 5G..."
                  value={customModel}
                  onChange={e => setCustomModel(e.target.value)}
                  className="mt-2 w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  required
                />
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Fault Category & Description */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Wrench className="w-4 h-4 text-sky-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              2. Fault Category & Symptoms
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { id: 'display', label: 'Screen & Touch' },
              { id: 'battery', label: 'Battery & Drain' },
              { id: 'charging', label: 'Charging & Port' },
              { id: 'power', label: 'Dead / Motherboard' },
              { id: 'additional', label: 'Water Damage' },
              { id: 'audio', label: 'Speaker / Mic' },
              { id: 'network', label: 'Signal / Wi-Fi' },
              { id: 'camera', label: 'Camera / Sensor' },
              { id: 'software', label: 'Bootloop / OS' }
            ].map(cat => (
              <button
                type="button"
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                  category === cat.id
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 ring-2 ring-sky-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Describe Problem in Detail
            </label>
            <textarea
              rows={3}
              value={issueDescription}
              onChange={e => setIssueDescription(e.target.value)}
              placeholder="e.g. Phone fell on concrete. Screen turned black with faint purple flicker. Vibrates when charger plugged in..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-sky-500 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Photo of Damaged Device (Optional Image URL)
            </label>
            <input
              type="text"
              value={photoUrl}
              onChange={e => setPhotoUrl(e.target.value)}
              placeholder="https://... (or upload to Imgur/Cloud)"
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
            />
          </div>
        </div>

        {/* Section 3: Appointment Date & Time Slot */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Calendar className="w-4 h-4 text-sky-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              3. Appointment Date & Slot
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Preferred Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={appointmentDate}
                onChange={e => setAppointmentDate(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-sky-500 cursor-pointer"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Available Time Slot
              </label>
              <select
                value={timeSlot}
                onChange={e => setTimeSlot(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-sky-500 cursor-pointer"
              >
                {TIME_SLOTS.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Service Type Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Truck className="w-4 h-4 text-sky-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              4. Service Mode
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'shop_visit', title: 'Visit Shop', desc: 'Walk into our Biratnagar / Kathmandu shop' },
              { id: 'pickup_delivery', title: 'Home Pickup', desc: 'Doorstep device pickup & return in Nepal' },
              { id: 'free_diagnosis', title: 'Free Diagnosis', desc: 'Inspection without obligation' }
            ].map(type => (
              <button
                type="button"
                key={type.id}
                onClick={() => setServiceType(type.id as any)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  serviceType === type.id
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 ring-2 ring-sky-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <p className="text-xs font-bold text-slate-900 dark:text-white">{type.title}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{type.desc}</p>
              </button>
            ))}
          </div>

          {serviceType === 'pickup_delivery' && (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Pickup Address in Nepal
              </label>
              <input
                type="text"
                placeholder="e.g. Ward No. 10, New Baneshwor, Kathmandu / Main Road, Biratnagar..."
                value={pickupAddress}
                onChange={e => setPickupAddress(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                required
              />
            </div>
          )}
        </div>

        {/* Section 5: Customer Contact */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <User className="w-4 h-4 text-sky-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              5. Customer Contact & SMS Alert
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Ramesh Adhikari"
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Phone Number (For SMS Tracking)
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                placeholder="+977-9800000000"
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Zero charges until you approve the quotation after free diagnosis.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Confirming Reservation...</span>
            ) : (
              <>
                <span>Confirm Repair Booking</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
