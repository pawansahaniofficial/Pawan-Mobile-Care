import { Router, Request, Response } from 'express';
import { db, ShopSettings, Coupon } from '../db';
import { requireAdmin } from './auth';

const router = Router();

// GET /api/settings (Public settings)
router.get('/', (req: Request, res: Response) => {
  const settings = db.get('settings');
  // Don't leak secret keys to public
  const publicSettings = {
    shopName: settings.shopName,
    tagline: settings.tagline,
    phone: settings.phone,
    whatsapp: settings.whatsapp,
    email: settings.email,
    address: settings.address,
    city: settings.city,
    province: settings.province,
    openingHours: settings.openingHours,
    googleMapsEmbed: settings.googleMapsEmbed,
    googleMapsDirectionsUrl: settings.googleMapsDirectionsUrl,
    standardDeliveryChargeNpr: settings.standardDeliveryChargeNpr,
    freeDeliveryThresholdNpr: settings.freeDeliveryThresholdNpr,
    announcementText: settings.announcementText,
    isPickupAvailable: settings.isPickupAvailable,
    esewaProductCode: settings.esewaProductCode,
    esewaSandbox: settings.esewaSandbox,
    khaltiPublicKey: settings.khaltiPublicKey,
    khaltiSandbox: settings.khaltiSandbox,
    smsEnabled: settings.smsEnabled,
    smsProvider: settings.smsProvider
  };
  return res.json({ settings: publicSettings });
});

// GET /api/settings/full (Admin view including secrets)
router.get('/full', requireAdmin, (req: Request, res: Response) => {
  const settings = db.get('settings');
  return res.json({ settings });
});

// PUT /api/settings (Admin update)
router.put('/', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user;
  const current = db.get('settings');
  const updated: ShopSettings = {
    ...current,
    ...req.body
  };

  db.set('settings', updated);
  db.logAudit(admin.id, admin.name, 'SETTINGS_UPDATED', 'Updated shop website settings and integrations');

  return res.json({ settings: updated, message: 'Settings saved successfully' });
});

// POST /api/settings/validate-coupon
router.post('/validate-coupon', (req: Request, res: Response) => {
  const { code, cartTotal } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Please enter a coupon code' });
  }

  const coupons = db.get('coupons') || [];
  const coupon = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive);

  if (!coupon) {
    return res.status(404).json({ error: 'Invalid or expired coupon code' });
  }

  const total = Number(cartTotal) || 0;
  if (total < coupon.minOrderAmount) {
    return res.status(400).json({
      error: `This coupon requires a minimum order of NPR ${coupon.minOrderAmount.toLocaleString()}`
    });
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = Math.round((total * coupon.discountValue) / 100);
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.discountValue;
  }

  return res.json({
    valid: true,
    code: coupon.code,
    discount,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    message: `Coupon applied: NPR ${discount.toLocaleString()} savings!`
  });
});

// GET /api/settings/coupons (Admin)
router.get('/coupons', requireAdmin, (req: Request, res: Response) => {
  const coupons = db.get('coupons') || [];
  return res.json({ coupons });
});

// POST /api/settings/coupons (Admin)
router.post('/coupons', requireAdmin, (req: Request, res: Response) => {
  const { code, discountType, discountValue, minOrderAmount, maxDiscount, validUntil } = req.body;
  if (!code || !discountValue) {
    return res.status(400).json({ error: 'Coupon code and discount value are required' });
  }

  const coupons = db.get('coupons') || [];
  const newCoupon: Coupon = {
    code: code.trim().toUpperCase(),
    discountType: discountType || 'fixed',
    discountValue: Number(discountValue),
    minOrderAmount: Number(minOrderAmount) || 0,
    maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
    validUntil: validUntil || '2028-12-31',
    isActive: true,
    usageCount: 0
  };

  coupons.unshift(newCoupon);
  db.set('coupons', coupons);

  return res.status(201).json({ coupon: newCoupon });
});

export default router;
