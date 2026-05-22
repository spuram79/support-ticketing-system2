import { prisma } from '../db';

export const generateTicketNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await prisma.ticket.count({
    where: {
      ticketNumber: {
        startsWith: `TKT-${year}-`,
      },
    },
  });

  const sequence = count + 1;
  return `TKT-${year}-${sequence.toString().padStart(6, '0')}`;
};