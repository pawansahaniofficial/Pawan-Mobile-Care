import { Router, Request, Response } from 'express';
import { db, RepairService } from '../db';
import { requireAdmin } from './auth';

const router = Router();

// GET /api/repairs/services
router.get('/services', (req: Request, res: Response) => {
  let services = db.get('repairServices');
  const reviews = db.get('reviews');
  const { category, search } = req.query;

  if (category) {
    services = services.filter(s => s.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (search) {
    const q = (search as string).toLowerCase();
    services = services.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.categoryLabel.toLowerCase().includes(q) ||
      s.symptoms.some(sym => sym.toLowerCase().includes(q)) ||
      s.compatibleBrands.some(b => b.toLowerCase().includes(q))
    );
  }

  // Attach reviews count
  const servicesWithStats = services.map(s => {
    const serviceReviews = reviews.filter(
      r => r.targetType === 'repair' && (r.targetId === s.id || r.targetId === s.slug || r.targetId === s.category) && r.isApproved
    );
    const avgRating = serviceReviews.length > 0
      ? parseFloat((serviceReviews.reduce((sum, r) => sum + r.rating, 0) / serviceReviews.length).toFixed(1))
      : 4.9;
    return {
      ...s,
      rating: avgRating,
      reviewCount: serviceReviews.length
    };
  });

  return res.json({ services: servicesWithStats });
});

// GET /api/repairs/services/:slug
router.get('/services/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const services = db.get('repairServices');
  const reviews = db.get('reviews');

  const service = services.find(s => s.slug === slug || s.id === slug);
  if (!service) {
    return res.status(404).json({ error: 'Repair service not found' });
  }

  const serviceReviews = reviews.filter(
    r => r.targetType === 'repair' && (r.targetId === service.id || r.targetId === service.slug || r.targetId === service.category) && r.isApproved
  );
  const avgRating = serviceReviews.length > 0
    ? parseFloat((serviceReviews.reduce((sum, r) => sum + r.rating, 0) / serviceReviews.length).toFixed(1))
    : 4.9;

  return res.json({
    service: {
      ...service,
      rating: avgRating,
      reviewCount: serviceReviews.length
    },
    reviews: serviceReviews
  });
});

// GET /api/repairs/brands
router.get('/brands', (req: Request, res: Response) => {
  const brands = db.get('deviceBrands');
  return res.json({ brands });
});

// POST /api/repairs/estimate (Instant price estimator)
router.post('/estimate', (req: Request, res: Response) => {
  const { brand, model, serviceCategory } = req.body;
  const services = db.get('repairServices');
  const service = services.find(s => s.category === serviceCategory);

  if (!service) {
    return res.status(400).json({ error: 'Please choose a valid repair problem category' });
  }

  // Flagship multiplier if iPhone Pro / Samsung Ultra
  let multiplier = 1.0;
  const modelLower = (model || '').toLowerCase();
  if (modelLower.includes('ultra') || modelLower.includes('pro max') || modelLower.includes('fold')) {
    multiplier = 1.35;
  } else if (modelLower.includes('pro') || modelLower.includes('plus')) {
    multiplier = 1.15;
  }

  const minPrice = Math.round(service.estimatedPriceMin * multiplier);
  const maxPrice = Math.round(service.estimatedPriceMax * multiplier);

  return res.json({
    brand: brand || 'Device',
    model: model || 'Smartphone',
    serviceTitle: service.title,
    minPrice,
    maxPrice,
    estimatedDuration: service.estimatedDuration,
    symptoms: service.symptoms,
    procedure: service.procedure,
    note: 'Starting estimate in NPR. Final quotation provided after free diagnostic inspection by Pawan Mobile technicians.'
  });
});

// POST /api/repairs/services (Admin add service)
router.post('/services', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user;
  const newService: RepairService = {
    id: 'rep-' + Date.now(),
    slug: req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    ...req.body
  };
  const services = db.get('repairServices');
  services.push(newService);
  db.set('repairServices', services);
  db.logAudit(admin.id, admin.name, 'REPAIR_SERVICE_CREATED', `Added repair service: ${newService.title}`);
  return res.status(201).json({ service: newService });
});

export default router;
