import { Router, Request, Response } from 'express';
import { db } from '../db';
import { requireAdmin } from './auth';
import { sendTransactionalSms } from '../services/sms';

const router = Router();

// GET /api/admin/overview
router.get('/overview', requireAdmin, (req: Request, res: Response) => {
  const orders = db.get('orders') || [];
  const bookings = db.get('repairBookings') || [];
  const products = db.get('products') || [];
  const users = db.get('users') || [];
  const smsLogs = db.get('smsLogs') || [];

  const todayStr = new Date().toISOString().slice(0, 10);

  const todayOrders = orders.filter(o => o.createdAt.startsWith(todayStr));
  const pendingBookings = bookings.filter(b => b.status === 'Pending' || b.status === 'Device Received' || b.status === 'Under Diagnosis' || b.status === 'Awaiting Approval');
  
  const verifiedOrders = orders.filter(o => o.paymentStatus === 'verified');
  const totalRevenueNpr = verifiedOrders.reduce((sum, o) => sum + o.total, 0);

  const pendingRevenueNpr = orders.filter(o => o.paymentStatus === 'pending').reduce((sum, o) => sum + o.total, 0);

  const lowStockProducts = products.filter(p => p.stock <= 8);

  const recentOrders = orders.slice(0, 5);
  const recentBookings = bookings.slice(0, 5);
  const recentLogs = db.get('auditLogs').slice(0, 8);

  return res.json({
    metrics: {
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      totalRepairBookings: bookings.length,
      pendingRepairBookings: pendingBookings.length,
      totalRevenueNpr,
      pendingRevenueNpr,
      totalCustomers: users.filter(u => u.role === 'customer').length,
      totalProducts: products.length,
      lowStockCount: lowStockProducts.length,
      smsSentCount: smsLogs.length
    },
    lowStockProducts,
    recentOrders,
    recentBookings,
    recentLogs
  });
});

// GET /api/admin/reports
router.get('/reports', requireAdmin, (req: Request, res: Response) => {
  const orders = db.get('orders') || [];
  const bookings = db.get('repairBookings') || [];
  const products = db.get('products') || [];

  // Group bookings by category
  const repairsByCategory: Record<string, number> = {};
  bookings.forEach(b => {
    repairsByCategory[b.serviceCategory] = (repairsByCategory[b.serviceCategory] || 0) + 1;
  });

  // Group orders by payment method
  const ordersByPaymentMethod: Record<string, number> = {};
  orders.forEach(o => {
    ordersByPaymentMethod[o.paymentMethod] = (ordersByPaymentMethod[o.paymentMethod] || 0) + 1;
  });

  // Top products by quantity sold
  const productSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
  orders.forEach(o => {
    o.items.forEach(item => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = { name: item.name, quantity: 0, revenue: 0 };
      }
      productSalesMap[item.productId].quantity += item.quantity;
      productSalesMap[item.productId].revenue += item.price * item.quantity;
    });
  });

  const topProducts = Object.values(productSalesMap).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  return res.json({
    repairsByCategory,
    ordersByPaymentMethod,
    topProducts,
    inventorySummary: {
      totalItemsInStock: products.reduce((sum, p) => sum + p.stock, 0),
      inventoryValueNpr: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
    }
  });
});

// GET /api/admin/audit-logs
router.get('/audit-logs', requireAdmin, (req: Request, res: Response) => {
  const logs = db.get('auditLogs') || [];
  return res.json({ logs });
});

// GET /api/admin/sms-logs
router.get('/sms-logs', requireAdmin, (req: Request, res: Response) => {
  const smsLogs = db.get('smsLogs') || [];
  return res.json({ smsLogs });
});

// POST /api/admin/resend-sms
router.post('/resend-sms', requireAdmin, async (req: Request, res: Response) => {
  const admin = (req as any).user;
  const { phone, message, event } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ error: 'Phone and message are required' });
  }

  const result = await sendTransactionalSms({
    phone,
    event: event || 'repair_status_update',
    message
  });

  db.logAudit(admin.id, admin.name, 'MANUAL_SMS_SENT', `Sent manual SMS to ${phone}`);
  return res.json(result);
});

// GET /api/admin/users
router.get('/users', requireAdmin, (req: Request, res: Response) => {
  const users = db.get('users').map(({ passwordHash: _, ...u }) => u);
  return res.json({ users });
});

export default router;
