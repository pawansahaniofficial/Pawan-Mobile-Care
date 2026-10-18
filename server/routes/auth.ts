import { Router, Request, Response } from 'express';
import { db, UserProfile } from '../db';
import crypto from 'crypto';

const router = Router();

// Simple JWT-like secure token generator for demo & production compatibility
export function generateToken(user: UserProfile): string {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  };
  const json = JSON.stringify(payload);
  const base64 = Buffer.from(json).toString('base64url');
  const signature = crypto.createHmac('sha256', 'pawan-repair-secret-2026').update(base64).digest('base64url');
  return `${base64}.${signature}`;
}

export function verifyToken(token: string): { id: string; email: string; role: string; name: string } | null {
  try {
    const [base64, signature] = token.split('.');
    if (!base64 || !signature) return null;
    const expectedSig = crypto.createHmac('sha256', 'pawan-repair-secret-2026').update(base64).digest('base64url');
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(base64, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// Middleware to extract user
export function authenticate(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized: Session expired or invalid' });
  }
  (req as any).user = payload;
  next();
}

// Middleware to enforce Admin role
export function requireAdmin(req: Request, res: Response, next: Function) {
  authenticate(req, res, () => {
    const user = (req as any).user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
  });
}

// POST /api/auth/register
router.post('/register', (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const users = db.get('users');
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const newUser: UserProfile = {
    id: 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone ? phone.trim() : undefined,
    role: 'customer',
    passwordHash: password, // In production, bcrypt.hash
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0284c7`,
    addresses: [],
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  db.set('users', users);
  db.logAudit(newUser.id, newUser.name, 'USER_REGISTERED', `New customer signed up: ${newUser.email}`);

  const token = generateToken(newUser);
  const { passwordHash: _, ...safeUser } = newUser;
  return res.status(201).json({ user: safeUser, token });
});

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const users = db.get('users');
  const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  
  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = generateToken(user);
  const { passwordHash: _, ...safeUser } = user;
  db.logAudit(user.id, user.name, 'USER_LOGIN', `User logged in with role: ${user.role}`);
  return res.json({ user: safeUser, token });
});

// POST /api/auth/google-login
router.post('/google-login', (req: Request, res: Response) => {
  const { email, name, avatarUrl } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required from Google authentication' });
  }

  const users = db.get('users');
  let user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

  if (!user) {
    user = {
      id: 'usr-g-' + Date.now(),
      name: name || email.split('@')[0],
      email: email.trim().toLowerCase(),
      role: 'customer',
      passwordHash: 'google_oauth_' + Math.random().toString(36),
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'Customer')}&backgroundColor=0284c7`,
      addresses: [],
      createdAt: new Date().toISOString()
    };
    users.push(user);
    db.set('users', users);
    db.logAudit(user.id, user.name, 'GOOGLE_SIGNUP', `Customer registered via Google login: ${user.email}`);
  }

  const token = generateToken(user);
  const { passwordHash: _, ...safeUser } = user;
  return res.json({ user: safeUser, token });
});

// GET /api/auth/me
router.get('/me', authenticate, (req: Request, res: Response) => {
  const authPayload = (req as any).user;
  const users = db.get('users');
  const user = users.find(u => u.id === authPayload.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { passwordHash: _, ...safeUser } = user;
  return res.json({ user: safeUser });
});

// PUT /api/auth/profile
router.put('/profile', authenticate, (req: Request, res: Response) => {
  const authPayload = (req as any).user;
  const { name, phone, addresses, avatarUrl } = req.body;
  const users = db.get('users');
  const index = users.findIndex(u => u.id === authPayload.id);
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (name) users[index].name = name.trim();
  if (phone) users[index].phone = phone.trim();
  if (avatarUrl) users[index].avatarUrl = avatarUrl;
  if (addresses && Array.isArray(addresses)) {
    users[index].addresses = addresses;
  }

  db.set('users', users);
  const { passwordHash: _, ...safeUser } = users[index];
  return res.json({ user: safeUser, message: 'Profile updated successfully' });
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  return res.json({ message: 'Logged out successfully' });
});

export default router;
