import { Router, Request, Response } from 'express';
import { db, Review, Product, RepairService } from '../db';
import { requireAdmin } from './auth';

const router = Router();

// Helper to extract optional authenticated user
function getOptionalUser(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [id] = decoded.split(':');
    const users = db.get('users') || [];
    return users.find(u => u.id === id) || null;
  } catch {
    return null;
  }
}

// GET /api/reviews/stats (Aggregate metrics for trust banner & badges)
router.get('/stats', (req: Request, res: Response) => {
  const { targetType, targetId } = req.query;
  let reviews = db.get('reviews') || [];

  // Filter for approved reviews
  reviews = reviews.filter(r => r.isApproved);

  if (targetType) {
    reviews = reviews.filter(r => r.targetType === targetType);
  }
  if (targetId) {
    reviews = reviews.filter(r => r.targetId === targetId);
  }

  const totalReviews = reviews.length;
  if (totalReviews === 0) {
    return res.json({
      averageRating: 5.0,
      totalReviews: 0,
      verifiedCount: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      ratingPercentages: { 5: 100, 4: 0, 3: 0, 2: 0, 1: 0 },
      recommendationRate: 100,
      repairsCount: 0,
      productsCount: 0
    });
  }

  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let totalRatingSum = 0;
  let verifiedCount = 0;
  let repairsCount = 0;
  let productsCount = 0;

  reviews.forEach(r => {
    const star = Math.max(1, Math.min(5, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    ratingDistribution[star] = (ratingDistribution[star] || 0) + 1;
    totalRatingSum += r.rating;
    if (r.isVerified) verifiedCount++;
    if (r.targetType === 'repair') repairsCount++;
    if (r.targetType === 'product') productsCount++;
  });

  const averageRating = parseFloat((totalRatingSum / totalReviews).toFixed(1));
  const positiveCount = (ratingDistribution[5] || 0) + (ratingDistribution[4] || 0);
  const recommendationRate = Math.round((positiveCount / totalReviews) * 100);

  const ratingPercentages = {
    5: Math.round(((ratingDistribution[5] || 0) / totalReviews) * 100),
    4: Math.round(((ratingDistribution[4] || 0) / totalReviews) * 100),
    3: Math.round(((ratingDistribution[3] || 0) / totalReviews) * 100),
    2: Math.round(((ratingDistribution[2] || 0) / totalReviews) * 100),
    1: Math.round(((ratingDistribution[1] || 0) / totalReviews) * 100)
  };

  return res.json({
    averageRating,
    totalReviews,
    verifiedCount,
    ratingDistribution,
    ratingPercentages,
    recommendationRate,
    repairsCount,
    productsCount
  });
});

// GET /api/reviews
router.get('/', (req: Request, res: Response) => {
  const { targetType, targetId, all, featured, minRating, sort, search, limit } = req.query;
  let reviews = db.get('reviews') || [];

  if (targetType && targetType !== 'all') {
    reviews = reviews.filter(r => r.targetType === targetType);
  }

  if (targetId) {
    reviews = reviews.filter(r => r.targetId === targetId);
  }

  if (featured === 'true') {
    reviews = reviews.filter(r => r.isFeatured);
  }

  if (minRating) {
    const min = Number(minRating);
    if (!isNaN(min)) {
      reviews = reviews.filter(r => r.rating >= min);
    }
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    reviews = reviews.filter(r =>
      r.comment.toLowerCase().includes(q) ||
      r.userName.toLowerCase().includes(q) ||
      (r.targetName && r.targetName.toLowerCase().includes(q)) ||
      (r.location && r.location.toLowerCase().includes(q)) ||
      (r.title && r.title.toLowerCase().includes(q))
    );
  }

  // If not admin and not explicitly requesting all, show only approved
  if (all !== 'true') {
    reviews = reviews.filter(r => r.isApproved);
  }

  // Sorting
  if (sort === 'rating') {
    reviews.sort((a, b) => b.rating - a.rating || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sort === 'helpful') {
    reviews.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else {
    // default: newest first
    reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  if (limit) {
    const lim = parseInt(limit as string, 10);
    if (!isNaN(lim) && lim > 0) {
      reviews = reviews.slice(0, lim);
    }
  }

  return res.json({ reviews, count: reviews.length });
});

// POST /api/reviews (Customer submit review - supports both logged-in and guest customers)
router.post('/', (req: Request, res: Response) => {
  const user = getOptionalUser(req);
  const {
    targetType,
    targetId,
    targetName,
    rating,
    comment,
    title,
    location,
    customerName,
    customerEmail,
    customerPhone
  } = req.body;

  if (!targetType || !targetId || !rating || !comment) {
    return res.status(400).json({ error: 'Please provide rating (1-5 stars) and a written review.' });
  }

  const numRating = Number(rating);
  if (numRating < 1 || numRating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5 stars.' });
  }

  const reviewerName = (user ? user.name : customerName?.trim()) || 'Verified Customer';
  const reviewerEmail = user ? user.email : customerEmail?.trim();
  const reviewerPhone = user ? user.phone : customerPhone?.trim();

  // Verify buyer or repair booking
  let isVerified = false;
  const orders = db.get('orders') || [];
  const bookings = db.get('repairBookings') || [];

  if (targetType === 'product') {
    const matchingOrder = orders.find(o => {
      const isOwner = (user && o.userId === user.id) ||
        (reviewerEmail && o.customerEmail?.toLowerCase() === reviewerEmail.toLowerCase()) ||
        (reviewerPhone && o.customerPhone && o.customerPhone.replace(/\D/g, '').includes(reviewerPhone.replace(/\D/g, '')));
      return isOwner && o.items.some(i => i.productId === targetId || i.name.toLowerCase().includes(targetName.toLowerCase()));
    });
    if (matchingOrder) isVerified = true;
  } else if (targetType === 'repair') {
    const matchingBooking = bookings.find(b => {
      const isOwner = (user && b.userId === user.id) ||
        (reviewerEmail && b.customerEmail?.toLowerCase() === reviewerEmail.toLowerCase()) ||
        (reviewerPhone && b.customerPhone && b.customerPhone.replace(/\D/g, '').includes(reviewerPhone.replace(/\D/g, '')));
      return isOwner && (
        b.serviceCategory === targetId ||
        b.serviceTitle?.toLowerCase().includes(targetName.toLowerCase()) ||
        b.id === targetId
      );
    });
    if (matchingBooking) isVerified = true;
  }

  // If user is authenticated, give verified benefit if they have any order or booking in system
  if (!isVerified && user) {
    const userHasOrders = orders.some(o => o.userId === user.id);
    const userHasBookings = bookings.some(b => b.userId === user.id);
    if (userHasOrders || userHasBookings) {
      isVerified = true;
    }
  }

  const newReview: Review = {
    id: 'rev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    userId: user?.id,
    userName: reviewerName,
    userAvatar: user?.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(reviewerName)}&backgroundColor=0284c7`,
    location: location?.trim() || (user ? 'Nepal' : 'Biratnagar, Nepal'),
    targetType,
    targetId,
    targetName: targetName || 'Smartphone Repair / Accessory',
    rating: numRating,
    title: title ? title.trim() : undefined,
    comment: comment.trim(),
    isVerified,
    isApproved: true, // Auto-published, subject to admin moderation
    isFeatured: numRating >= 5, // Top rated reviews eligible for home page showcase
    helpfulCount: 0,
    createdAt: new Date().toISOString()
  };

  const reviews = db.get('reviews') || [];
  reviews.unshift(newReview);
  db.set('reviews', reviews);

  // Update product cache rating if product
  if (targetType === 'product') {
    const products = db.get('products') || [];
    const prod = products.find(p => p.id === targetId || p.slug === targetId);
    if (prod) {
      const prodReviews = reviews.filter(r => r.targetType === 'product' && (r.targetId === prod.id || r.targetId === prod.slug) && r.isApproved);
      const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
      prod.rating = parseFloat(avg.toFixed(1));
      prod.reviewCount = prodReviews.length;
      db.set('products', products);
    }
  }

  // Update repair service cache rating if repair
  if (targetType === 'repair') {
    const repairServices = db.get('repairServices') || [];
    const serv = repairServices.find(s => s.id === targetId || s.slug === targetId || s.category === targetId);
    if (serv) {
      const servReviews = reviews.filter(r => r.targetType === 'repair' && (r.targetId === serv.id || r.targetId === serv.slug || r.targetId === serv.category) && r.isApproved);
      if (servReviews.length > 0) {
        const avg = servReviews.reduce((sum, r) => sum + r.rating, 0) / servReviews.length;
        serv.rating = parseFloat(avg.toFixed(1));
        serv.reviewCount = servReviews.length;
        db.set('repairServices', repairServices);
      }
    }
  }

  db.logAudit(
    user?.id || 'guest',
    reviewerName,
    'REVIEW_POSTED',
    `Submitted review for ${targetType}: ${targetName} (${numRating} stars)`
  );

  return res.status(201).json({
    review: newReview,
    message: isVerified
      ? 'Thank you! Your verified review has been published.'
      : 'Thank you for your feedback! Your review has been published on the site.'
  });
});

// POST /api/reviews/:id/helpful (Upvote a review)
router.post('/:id/helpful', (req: Request, res: Response) => {
  const { id } = req.params;
  const reviews = db.get('reviews') || [];
  const review = reviews.find(r => r.id === id);

  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }

  review.helpfulCount = (review.helpfulCount || 0) + 1;
  db.set('reviews', reviews);

  return res.json({
    success: true,
    helpfulCount: review.helpfulCount,
    message: 'Marked as helpful'
  });
});

// PUT /api/reviews/:id/feature (Admin - toggle featured for home page)
router.put('/:id/feature', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { isFeatured } = req.body;
  const reviews = db.get('reviews') || [];
  const review = reviews.find(r => r.id === id);

  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }

  review.isFeatured = typeof isFeatured === 'boolean' ? isFeatured : !review.isFeatured;
  db.set('reviews', reviews);

  return res.json({
    review,
    message: `Review ${review.isFeatured ? 'featured on home page' : 'unfeatured'}`
  });
});

// POST /api/reviews/:id/reply (Admin - add shop owner / technician response)
router.post('/:id/reply', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { reply } = req.body;
  const reviews = db.get('reviews') || [];
  const review = reviews.find(r => r.id === id);

  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }

  review.adminReply = reply ? reply.trim() : undefined;
  db.set('reviews', reviews);

  return res.json({
    review,
    message: reply ? 'Technician response saved' : 'Response removed'
  });
});

// PUT /api/reviews/:id/approve (Admin)
router.put('/:id/approve', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { isApproved } = req.body;
  const reviews = db.get('reviews') || [];
  const review = reviews.find(r => r.id === id);

  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }

  review.isApproved = !!isApproved;
  db.set('reviews', reviews);

  return res.json({ review, message: `Review ${isApproved ? 'approved' : 'hidden'}` });
});

// DELETE /api/reviews/:id (Admin)
router.delete('/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  let reviews = db.get('reviews') || [];
  const review = reviews.find(r => r.id === id);

  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }

  reviews = reviews.filter(r => r.id !== id);
  db.set('reviews', reviews);

  return res.json({ message: 'Review removed' });
});

export default router;
