import { Router } from 'express';
import * as ticketController from '../controllers/tickets';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', ticketController.getTickets);
router.get('/stats', ticketController.getTicketStats);
router.get('/:id', ticketController.getTicketById);

// Protected routes (authentication required)
router.post('/', authenticate, ticketController.createTicket);
router.patch('/:id', authenticate, ticketController.updateTicket);
router.delete('/:id', authenticate, ticketController.deleteTicket);

export default router;