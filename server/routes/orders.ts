import { Router, Request, Response } from 'express';
import { db, Order, OrderItem } from '../db';
import { requireAdmin, authenticate, verifyToken } from './auth';
import { sendTransactionalSms, SmsTemplates } from '../services/sms';

const router = Router();

function generateOrderNumber(): string {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `ORD-${randomSuffix}`;
}

// POST /api/orders (Create order with server-side validation)
router.post('/', async (req: Request, res: Response) => {
  const {
    items,
    shippingAddress,
    paymentMethod,
    couponCode,
    customerName,
    customerEmail,
    customerPhone,
    notes
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty. Please add accessories before placing an order.' });
  }

  if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
    return res.status(400).json({ error: 'Please provide a valid delivery address in Nepal.' });
  }

  if (!customerName || !customerPhone) {
    return res.status(400).json({ error: 'Customer name and active phone number are required.' });
  }

  // Validate items and stock on server side
  const products = db.get('products');
  const validatedItems: OrderItem[] = [];
  let calculatedSubtotal = 0;

  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    if (!product) {
      return res.status(400).json({ error: `Product ${item.name || item.productId} no longer exists.` });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({
        error: `Insufficient stock for "${product.name}". Only ${product.stock} units available.`
      });
    }

    validatedItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      image: product.images[0] || '',
      sku: product.sku
    });

    calculatedSubtotal += product.price * item.quantity;
  }

  // Calculate discount from coupon
  let discount = 0;
  if (couponCode) {
    const coupons = db.get('coupons');
    const coupon = coupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.isActive);
    if (coupon) {
      if (calculatedSubtotal >= coupon.minOrderAmount) {
        if (coupon.discountType === 'percentage') {
          discount = Math.round((calculatedSubtotal * coupon.discountValue) / 100);
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        } else {
          discount = coupon.discountValue;
        }
        coupon.usageCount = (coupon.usageCount || 0) + 1;
        db.set('coupons', coupons);
      }
    }
  }

  // Calculate delivery charge
  const settings = db.get('settings');
  const deliveryCharge = calculatedSubtotal >= settings.freeDeliveryThresholdNpr ? 0 : settings.standardDeliveryChargeNpr;
  const calculatedTotal = Math.max(0, calculatedSubtotal - discount + deliveryCharge);

  // Extract user if logged in
  let userId: string | undefined;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const payload = verifyToken(authHeader.split(' ')[1]);
    if (payload) userId = payload.id;
  }

  const orderNumber = generateOrderNumber();

  // Deduct stock
  for (const item of validatedItems) {
    const pIndex = products.findIndex(p => p.id === item.productId);
    if (pIndex !== -1) {
      products[pIndex].stock = Math.max(0, products[pIndex].stock - item.quantity);
    }
  }
  db.set('products', products);

  const initialPaymentStatus = (paymentMethod === 'cod' || paymentMethod === 'pay_at_shop') ? 'pending' : 'pending';

  const newOrder: Order = {
    id: 'ord-' + Date.now(),
    orderNumber,
    userId,
    customerName: customerName.trim(),
    customerEmail: customerEmail?.trim() || '',
    customerPhone: customerPhone.trim(),
    shippingAddress,
    items: validatedItems,
    subtotal: calculatedSubtotal,
    deliveryCharge,
    discount,
    couponCode: couponCode ? couponCode.trim().toUpperCase() : undefined,
    total: calculatedTotal,
    paymentMethod: paymentMethod || 'cod',
    paymentStatus: initialPaymentStatus,
    fulfillmentStatus: 'pending',
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const orders = db.get('orders');
  orders.unshift(newOrder);
  db.set('orders', orders);
  db.logAudit(userId || 'GUEST', customerName, 'ORDER_CREATED', `Created order #${orderNumber} total NPR ${calculatedTotal}`);

  // Dispatch Transactional SMS for order confirmation
  try {
    const smsMsg = SmsTemplates.orderConfirmed(customerName, orderNumber, calculatedTotal);
    await sendTransactionalSms({
      phone: customerPhone,
      event: 'order_confirmed',
      message: smsMsg,
      userId
    });
  } catch (err) {
    console.error('Error dispatching order confirmation SMS:', err);
  }

  return res.status(201).json({
    order: newOrder,
    message: `Order #${orderNumber} created successfully! SMS confirmation sent to ${customerPhone}.`
  });
});

// GET /api/orders/my-orders (Customer orders)
router.get('/my-orders', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const orders = db.get('orders');
  const userOrders = orders.filter(o => o.userId === user.id || o.customerEmail === user.email);
  return res.json({ orders: userOrders });
});

// GET /api/orders/:idOrNumber (Single order / invoice)
router.get('/:idOrNumber', (req: Request, res: Response) => {
  const { idOrNumber } = req.params;
  const orders = db.get('orders');
  const order = orders.find(o => o.id === idOrNumber || o.orderNumber.toUpperCase() === idOrNumber.toUpperCase());

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const settings = db.get('settings');

  return res.json({
    order,
    shop: {
      name: settings.shopName,
      address: settings.address,
      phone: settings.phone,
      email: settings.email,
      pan: '601234567' // Standard VAT/PAN format in Nepal
    }
  });
});

// GET /api/orders (Admin list all orders)
router.get('/', requireAdmin, (req: Request, res: Response) => {
  let orders = db.get('orders');
  const { status, paymentStatus, search } = req.query;

  if (status) {
    orders = orders.filter(o => o.fulfillmentStatus.toLowerCase() === (status as string).toLowerCase());
  }

  if (paymentStatus) {
    orders = orders.filter(o => o.paymentStatus.toLowerCase() === (paymentStatus as string).toLowerCase());
  }

  if (search) {
    const q = (search as string).toLowerCase();
    orders = orders.filter(o =>
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q)
    );
  }

  return res.json({ orders, total: orders.length });
});

// PUT /api/orders/:id/status (Admin update fulfillment/payment status)
router.put('/:id/status', requireAdmin, async (req: Request, res: Response) => {
  const admin = (req as any).user;
  const { id } = req.params;
  const { fulfillmentStatus, paymentStatus, transactionId } = req.body;

  const orders = db.get('orders');
  const index = orders.findIndex(o => o.id === id || o.orderNumber === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const existing = orders[index];
  const oldFulfillment = existing.fulfillmentStatus;

  orders[index] = {
    ...existing,
    fulfillmentStatus: fulfillmentStatus || existing.fulfillmentStatus,
    paymentStatus: paymentStatus || existing.paymentStatus,
    transactionId: transactionId || existing.transactionId,
    updatedAt: new Date().toISOString()
  };

  db.set('orders', orders);
  db.logAudit(admin.id, admin.name, 'ORDER_STATUS_UPDATED', `Order #${existing.orderNumber} status set to ${orders[index].fulfillmentStatus}/${orders[index].paymentStatus}`);

  // Send SMS on delivery or shipping update
  if (fulfillmentStatus && fulfillmentStatus !== oldFulfillment) {
    try {
      await sendTransactionalSms({
        phone: existing.customerPhone,
        event: 'order_confirmed',
        message: `[Pawan Mobile] Update on Order #${existing.orderNumber}: Status changed to "${fulfillmentStatus.toUpperCase()}". Helpline: +977-9812345678.`,
        userId: existing.userId
      });
    } catch (e) {
      console.error('Error dispatching order status update SMS:', e);
    }
  }

  return res.json({ order: orders[index], message: 'Order status updated successfully' });
});

export default router;
