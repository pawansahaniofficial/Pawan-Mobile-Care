import { Router, Request, Response } from 'express';
import { db, Product } from '../db';
import { requireAdmin } from './auth';

const router = Router();

// GET /api/products
router.get('/', (req: Request, res: Response) => {
  let products = db.get('products');
  const reviews = db.get('reviews');

  // Recalculate average rating & reviewCount from approved reviews
  products = products.map(p => {
    const prodReviews = reviews.filter(r => r.targetType === 'product' && r.targetId === p.id && r.isApproved);
    if (prodReviews.length > 0) {
      const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
      return { ...p, rating: parseFloat(avg.toFixed(1)), reviewCount: prodReviews.length };
    }
    return p;
  });

  const { category, subCategory, brand, search, minPrice, maxPrice, sort, featured } = req.query;

  if (category) {
    products = products.filter(p => p.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (subCategory) {
    products = products.filter(p => p.subCategory?.toLowerCase() === (subCategory as string).toLowerCase());
  }

  if (brand) {
    products = products.filter(p => p.brand.toLowerCase() === (brand as string).toLowerCase());
  }

  if (featured === 'true') {
    products = products.filter(p => p.isFeatured);
  }

  if (search) {
    const q = (search as string).toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.compatibility.some(c => c.toLowerCase().includes(q))
    );
  }

  if (minPrice) {
    products = products.filter(p => p.price >= Number(minPrice));
  }

  if (maxPrice) {
    products = products.filter(p => p.price <= Number(maxPrice));
  }

  // Sorting
  if (sort === 'price_asc') {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    products.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    products.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'newest') {
    products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return res.json({ products, total: products.length });
});

// GET /api/products/:idOrSlug
router.get('/:idOrSlug', (req: Request, res: Response) => {
  const { idOrSlug } = req.params;
  const products = db.get('products');
  const reviews = db.get('reviews');

  const product = products.find(p => p.id === idOrSlug || p.slug === idOrSlug);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const prodReviews = reviews.filter(r => r.targetType === 'product' && r.targetId === product.id && r.isApproved);
  const avgRating = prodReviews.length > 0
    ? parseFloat((prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length).toFixed(1))
    : product.rating;

  // Get related accessories
  const related = products
    .filter(p => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
    .slice(0, 4);

  return res.json({
    product: {
      ...product,
      rating: avgRating,
      reviewCount: prodReviews.length || product.reviewCount
    },
    reviews: prodReviews,
    related
  });
});

// POST /api/products (Admin)
router.post('/', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user;
  const { name, category, subCategory, brand, price, originalPrice, description, stock, sku, warranty, images, features, compatibility } = req.body;

  if (!name || !category || !price) {
    return res.status(400).json({ error: 'Name, category, and price in NPR are required' });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const newProduct: Product = {
    id: 'prod-' + Date.now(),
    name,
    slug,
    category,
    subCategory,
    brand: brand || 'PawanTech Pro',
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    discountPercentage: originalPrice && originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
    description: description || '',
    stock: Number(stock) || 10,
    sku: sku || 'SKU-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    warranty: warranty || '6 Months Shop Warranty',
    images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80'],
    features: features || [],
    compatibility: compatibility || ['All standard smartphones'],
    rating: 5.0,
    reviewCount: 0,
    createdAt: new Date().toISOString()
  };

  const products = db.get('products');
  products.unshift(newProduct);
  db.set('products', products);
  db.logAudit(admin.id, admin.name, 'PRODUCT_CREATED', `Added new product: ${newProduct.name} (${newProduct.sku})`);

  return res.status(201).json({ product: newProduct });
});

// PUT /api/products/:id (Admin)
router.put('/:id', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user;
  const { id } = req.params;
  const products = db.get('products');
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const existing = products[index];
  const updated: Product = {
    ...existing,
    ...req.body,
    id: existing.id,
    updatedAt: new Date().toISOString()
  };

  if (updated.originalPrice && updated.originalPrice > updated.price) {
    updated.discountPercentage = Math.round(((updated.originalPrice - updated.price) / updated.originalPrice) * 100);
  }

  products[index] = updated;
  db.set('products', products);
  db.logAudit(admin.id, admin.name, 'PRODUCT_UPDATED', `Updated product: ${updated.name}`);

  return res.json({ product: updated });
});

// DELETE /api/products/:id (Admin)
router.delete('/:id', requireAdmin, (req: Request, res: Response) => {
  const admin = (req as any).user;
  const { id } = req.params;
  let products = db.get('products');
  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  products = products.filter(p => p.id !== id);
  db.set('products', products);
  db.logAudit(admin.id, admin.name, 'PRODUCT_DELETED', `Deleted product: ${product.name} (${product.sku})`);

  return res.json({ message: 'Product deleted successfully' });
});

// POST /api/products/upload-image (Admin image upload helper)
router.post('/upload-image', requireAdmin, (req: Request, res: Response) => {
  const { imageUrl } = req.body;
  if (!imageUrl) {
    return res.status(400).json({ error: 'Image URL or payload is required' });
  }
  return res.json({ url: imageUrl, message: 'Image uploaded successfully' });
});

export default router;
