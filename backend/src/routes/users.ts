import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

// Get all users (for assignment dropdowns)
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, firstName: true, lastName: true, role: true, status: true },
    });
    return res.json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, status: true },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user
router.patch('/:id', async (req, res) => {
  try {
    const { firstName, lastName, phone, role, status } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { firstName, lastName, phone, role, status },
    });
    return res.json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user' });
  }
});

export default router;