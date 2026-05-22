"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTicketNumber = void 0;
const db_1 = require("../db");
const generateTicketNumber = async () => {
    const year = new Date().getFullYear();
    const count = await db_1.prisma.ticket.count({
        where: {
            ticketNumber: {
                startsWith: `TKT-${year}-`,
            },
        },
    });
    const sequence = count + 1;
    return `TKT-${year}-${sequence.toString().padStart(6, '0')}`;
};
exports.generateTicketNumber = generateTicketNumber;
