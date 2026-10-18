import { Router, Request, Response } from 'express';
import { db, ContactMessage } from '../db';
import { requireAdmin } from './auth';

const router = Router();

// POST /api/contact (Public inquiry submission)
router.post('/', (req: Request, res: Response) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  const newMessage: ContactMessage = {
    id: 'msg-' + Date.now(),
    name: name.trim(),
    email: email.trim(),
    phone: phone ? phone.trim() : '',
    subject: subject ? subject.trim() : 'Customer Inquiry',
    message: message.trim(),
    status: 'new',
    createdAt: new Date().toISOString()
  };

  const messages = db.get('contactMessages') || [];
  messages.unshift(newMessage);
  db.set('contactMessages', messages);

  return res.status(201).json({
    message: 'Thank you for reaching out to Pawan Mobile Repairing Center! Our team will get back to you shortly.',
    id: newMessage.id
  });
});

// GET /api/contact (Admin list)
router.get('/', requireAdmin, (req: Request, res: Response) => {
  const messages = db.get('contactMessages') || [];
  return res.json({ messages });
});

// PUT /api/contact/:id (Admin reply/update status)
router.put('/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, adminReply } = req.body;

  const messages = db.get('contactMessages') || [];
  const index = messages.findIndex(m => m.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Message not found' });
  }

  messages[index] = {
    ...messages[index],
    status: status || messages[index].status,
    adminReply: adminReply !== undefined ? adminReply : messages[index].adminReply
  };

  db.set('contactMessages', messages);
  return res.json({ message: 'Inquiry updated', contact: messages[index] });
});

export default router;
