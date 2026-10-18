import { Router, Request, Response } from 'express';
import { db, WishlistItem } from '../db';
import { authenticate } from './auth';

const router = Router();

// GET /api/wishlist
router.get('/', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const wishlists = db.get('wishlists') || [];
  const userWishlist = wishlists.find(w => w.userId === user.id);

  if (!userWishlist || !userWishlist.productIds || userWishlist.productIds.length === 0) {
    return res.json({ productIds: [], products: [] });
  }

  const allProducts = db.get('products');
  const products = allProducts.filter(p => userWishlist.productIds.includes(p.id));

  return res.json({
    productIds: userWishlist.productIds,
    products
  });
});

// POST /api/wishlist/toggle
router.post('/toggle', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  const wishlists = db.get('wishlists') || [];
  let userWishlist = wishlists.find(w => w.userId === user.id);

  let isAdded = false;

  if (!userWishlist) {
    userWishlist = {
      userId: user.id,
      productIds: [productId],
      updatedAt: new Date().toISOString()
    };
    wishlists.push(userWishlist);
    isAdded = true;
  } else {
    const existsIndex = userWishlist.productIds.indexOf(productId);
    if (existsIndex > -1) {
      userWishlist.productIds.splice(existsIndex, 1);
      isAdded = false;
    } else {
      userWishlist.productIds.push(productId);
      isAdded = true;
    }
    userWishlist.updatedAt = new Date().toISOString();
  }

  db.set('wishlists', wishlists);

  const allProducts = db.get('products');
  const products = allProducts.filter(p => userWishlist!.productIds.includes(p.id));

  return res.json({
    isAdded,
    productIds: userWishlist.productIds,
    products,
    message: isAdded ? 'Added to your wishlist!' : 'Removed from your wishlist'
  });
});

// POST /api/wishlist/sync (Merge guest wishlist with user account)
router.post('/sync', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { guestProductIds } = req.body;

  if (!Array.isArray(guestProductIds)) {
    return res.status(400).json({ error: 'guestProductIds must be an array' });
  }

  const wishlists = db.get('wishlists') || [];
  let userWishlist = wishlists.find(w => w.userId === user.id);

  if (!userWishlist) {
    userWishlist = {
      userId: user.id,
      productIds: guestProductIds,
      updatedAt: new Date().toISOString()
    };
    wishlists.push(userWishlist);
  } else {
    // Unique merge
    const merged = Array.from(new Set([...userWishlist.productIds, ...guestProductIds]));
    userWishlist.productIds = merged;
    userWishlist.updatedAt = new Date().toISOString();
  }

  db.set('wishlists', wishlists);

  const allProducts = db.get('products');
  const products = allProducts.filter(p => userWishlist!.productIds.includes(p.id));

  return res.json({
    productIds: userWishlist.productIds,
    products
  });
});

export default router;
