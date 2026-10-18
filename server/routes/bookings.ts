import { Router, Request, Response } from 'express';
import { db, RepairBooking } from '../db';
import { requireAdmin, authenticate, verifyToken } from './auth';
import { sendTransactionalSms, SmsTemplates } from '../services/sms';

const router = Router();

// Helper to generate unique booking number like PMR-2026-0891
function generateBookingNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `PMR-${dateStr.slice(0, 4)}-${randomSuffix}`;
}

// POST /api/bookings (Create repair booking)
router.post('/', async (req: Request, res: Response) => {
  const {
    brand,
    model,
    serviceCategory,
    serviceTitle,
    issueDescription,
    photos,
    appointmentDate,
    timeSlot,
    serviceType,
    pickupAddress,
    customerName,
    customerPhone,
    customerEmail
  } = req.body;

  if (!brand || !model || !serviceCategory || !customerName || !customerPhone || !appointmentDate || !timeSlot) {
    return res.status(400).json({ error: 'Please fill in all required booking details (device, date, time slot, and contact number).' });
  }

  // Prevent double booking for same slot on same date if capacity reached
  const bookings = db.get('repairBookings');
  const existingSlotCount = bookings.filter(
    b => b.appointmentDate === appointmentDate && b.timeSlot === timeSlot && b.status !== 'Cancelled'
  ).length;

  if (existingSlotCount >= 4) { // max 4 devices per 1 hour slot in shop
    return res.status(409).json({ error: 'This time slot is fully booked. Please choose an adjacent time slot or another date.' });
  }

  // Check if authenticated
  let userId: string | undefined;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const payload = verifyToken(authHeader.split(' ')[1]);
    if (payload) userId = payload.id;
  }

  const bookingNumber = generateBookingNumber();

  const newBooking: RepairBooking = {
    id: 'book-' + Date.now(),
    bookingNumber,
    userId,
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    customerEmail: customerEmail?.trim(),
    brand,
    model,
    serviceCategory,
    serviceTitle: serviceTitle || 'Hardware / Software Diagnosis',
    issueDescription: issueDescription || 'General diagnostic inspection required.',
    photos: Array.isArray(photos) ? photos : [],
    appointmentDate,
    timeSlot,
    serviceType: serviceType || 'shop_visit',
    pickupAddress: pickupAddress || undefined,
    status: 'Pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  bookings.unshift(newBooking);
  db.set('repairBookings', bookings);
  db.logAudit(userId || 'GUEST', customerName, 'REPAIR_BOOKED', `Created booking #${bookingNumber} for ${brand} ${model}`);

  // Dispatch Transactional SMS alert to customer
  try {
    const smsMsg = SmsTemplates.newBooking(
      customerName,
      bookingNumber,
      `${brand} ${model}`,
      appointmentDate,
      timeSlot
    );
    await sendTransactionalSms({
      phone: customerPhone,
      event: 'new_booking',
      message: smsMsg,
      userId
    });
  } catch (e) {
    console.error('Failed to dispatch booking SMS:', e);
  }

  return res.status(201).json({
    booking: newBooking,
    message: `Repair appointment booked successfully! Your tracking ID is #${bookingNumber}. An SMS confirmation has been dispatched to ${customerPhone}.`
  });
});

// GET /api/bookings/track (Public tracking by bookingNumber & phone)
router.get('/track', (req: Request, res: Response) => {
  const { bookingNumber, phone } = req.query;

  if (!bookingNumber) {
    return res.status(400).json({ error: 'Booking number is required' });
  }

  const bookings = db.get('repairBookings');
  const booking = bookings.find(
    b => b.bookingNumber.trim().toUpperCase() === (bookingNumber as string).trim().toUpperCase()
  );

  if (!booking) {
    return res.status(404).json({ error: 'No repair booking found matching this reference number' });
  }

  // If phone provided, verify match for privacy
  if (phone) {
    const cleanQueryPhone = (phone as string).replace(/[^0-9]/g, '');
    const cleanBookingPhone = booking.customerPhone.replace(/[^0-9]/g, '');
    if (!cleanBookingPhone.endsWith(cleanQueryPhone.slice(-8))) {
      return res.status(403).json({ error: 'Phone number does not match this booking record' });
    }
  }

  return res.json({ booking });
});

// GET /api/bookings/my-bookings (Customer view)
router.get('/my-bookings', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const bookings = db.get('repairBookings');
  const userBookings = bookings.filter(b => b.userId === user.id || b.customerEmail === user.email);
  return res.json({ bookings: userBookings });
});

// GET /api/bookings (Admin view with filters)
router.get('/', requireAdmin, (req: Request, res: Response) => {
  let bookings = db.get('repairBookings');
  const { status, search } = req.query;

  if (status) {
    bookings = bookings.filter(b => b.status.toLowerCase() === (status as string).toLowerCase());
  }

  if (search) {
    const q = (search as string).toLowerCase();
    bookings = bookings.filter(b =>
      b.bookingNumber.toLowerCase().includes(q) ||
      b.customerName.toLowerCase().includes(q) ||
      b.customerPhone.includes(q) ||
      b.model.toLowerCase().includes(q)
    );
  }

  return res.json({ bookings, total: bookings.length });
});

// PUT /api/bookings/:id/status (Admin update status, technician, quotation)
router.put('/:id/status', requireAdmin, async (req: Request, res: Response) => {
  const admin = (req as any).user;
  const { id } = req.params;
  const {
    status,
    assignedTechnician,
    technicianNotes,
    quotedCost,
    partsUsed,
    laborCharge
  } = req.body;

  const bookings = db.get('repairBookings');
  const index = bookings.findIndex(b => b.id === id || b.bookingNumber === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Repair booking not found' });
  }

  const existing = bookings[index];
  const oldStatus = existing.status;
  const updatedStatus = status || existing.status;

  bookings[index] = {
    ...existing,
    status: updatedStatus,
    assignedTechnician: assignedTechnician !== undefined ? assignedTechnician : existing.assignedTechnician,
    technicianNotes: technicianNotes !== undefined ? technicianNotes : existing.technicianNotes,
    quotedCost: quotedCost !== undefined ? Number(quotedCost) : existing.quotedCost,
    partsUsed: partsUsed !== undefined ? partsUsed : existing.partsUsed,
    laborCharge: laborCharge !== undefined ? Number(laborCharge) : existing.laborCharge,
    updatedAt: new Date().toISOString()
  };

  db.set('repairBookings', bookings);
  db.logAudit(admin.id, admin.name, 'BOOKING_STATUS_UPDATED', `Updated booking #${existing.bookingNumber} to status: ${updatedStatus}`);

  // Send Transactional SMS if status has changed
  if (updatedStatus !== oldStatus) {
    try {
      if (updatedStatus === 'Ready for Pickup') {
        const total = (bookings[index].quotedCost || 0);
        const smsMsg = SmsTemplates.readyForPickup(
          existing.customerName,
          existing.bookingNumber,
          `${existing.brand} ${existing.model}`,
          total
        );
        await sendTransactionalSms({
          phone: existing.customerPhone,
          event: 'ready_for_pickup',
          message: smsMsg,
          userId: existing.userId
        });
      } else {
        const smsMsg = SmsTemplates.repairStatusUpdate(
          existing.customerName,
          existing.bookingNumber,
          updatedStatus,
          technicianNotes
        );
        await sendTransactionalSms({
          phone: existing.customerPhone,
          event: 'repair_status_update',
          message: smsMsg,
          userId: existing.userId
        });
      }
    } catch (err) {
      console.error('Error dispatching repair update SMS:', err);
    }
  }

  return res.json({ booking: bookings[index], message: `Booking status updated to ${updatedStatus}` });
});

// POST /api/bookings/:id/approve-quote (Customer accepts/declines repair quotation)
router.post('/:id/approve-quote', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { approved } = req.body; // boolean

  const bookings = db.get('repairBookings');
  const index = bookings.findIndex(b => b.id === id || b.bookingNumber === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Repair booking not found' });
  }

  bookings[index].customerApprovedQuote = !!approved;
  if (approved) {
    bookings[index].status = 'In Progress';
    bookings[index].technicianNotes = (bookings[index].technicianNotes || '') + '\n[Customer Approved Quotation: Proceed with repair.]';
  } else {
    bookings[index].status = 'Cancelled';
    bookings[index].technicianNotes = (bookings[index].technicianNotes || '') + '\n[Customer Declined Quotation: Return device without repair.]';
  }
  bookings[index].updatedAt = new Date().toISOString();

  db.set('repairBookings', bookings);

  // Notify technician via SMS log
  await sendTransactionalSms({
    phone: bookings[index].customerPhone,
    event: 'repair_status_update',
    message: approved
      ? `[Pawan Mobile] Thank you! Quotation approved for #${bookings[index].bookingNumber}. Technician has commenced the repair.`
      : `[Pawan Mobile] Quotation declined for #${bookings[index].bookingNumber}. Your device will be prepared for collection with no hidden charges.`,
    userId: bookings[index].userId
  });

  return res.json({
    booking: bookings[index],
    message: approved ? 'Quotation accepted! Repair is now in progress.' : 'Quotation declined. You can collect your device at our center.'
  });
});

export default router;
