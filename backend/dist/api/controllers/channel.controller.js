"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePhone = exports.handleWhatsApp = exports.handleSMS = exports.handleEmail = exports.getChannels = void 0;
const prisma_js_1 = require("../../config/prisma.js");
// @desc    Get all channels
// @route   GET /api/v1/channels
// @access  Private
const getChannels = async (req, res) => {
    const channels = await prisma_js_1.prisma.channel.findMany();
    res.status(200).json({ success: true, data: channels });
};
exports.getChannels = getChannels;
// @desc    Handle incoming email
// @route   POST /api/v1/channels/email
// @access  Public (with webhook secret)
const handleEmail = async (req, res) => {
    const { from, subject, body, messageId } = req.body;
    // Check for duplicate
    const existing = await prisma_js_1.prisma.ticket.findFirst({
        where: { channelId: messageId },
    });
    if (existing) {
        return res.status(200).json({ success: true, message: 'Duplicate ticket ignored' });
    }
    // Create ticket
    const ticket = await prisma_js_1.prisma.ticket.create({
        data: {
            subject,
            description: body,
            source: 'EMAIL',
            channelId: messageId,
            creator: {
                connectOrCreate: {
                    where: { email: from },
                    create: { email: from, role: 'CUSTOMER' },
                },
            },
        },
    });
    res.status(201).json({ success: true, data: ticket });
};
exports.handleEmail = handleEmail;
// @desc    Handle incoming SMS
// @route   POST /api/v1/channels/sms
// @access  Public
const handleSMS = async (req, res) => {
    const { from, message } = req.body;
    const ticket = await prisma_js_1.prisma.ticket.create({
        data: {
            subject: 'SMS Ticket',
            description: message,
            source: 'SMS',
            creator: {
                connectOrCreate: {
                    where: { phone: from },
                    create: { phone: from, role: 'CUSTOMER' },
                },
            },
        },
    });
    res.status(201).json({ success: true, data: ticket });
};
exports.handleSMS = handleSMS;
// @desc    Handle WhatsApp message
// @route   POST /api/v1/channels/whatsapp
// @access  Public
const handleWhatsApp = async (req, res) => {
    const { from, text } = req.body;
    const ticket = await prisma_js_1.prisma.ticket.create({
        data: {
            subject: 'WhatsApp Ticket',
            description: text,
            source: 'WHATSAPP',
            creator: {
                connectOrCreate: {
                    where: { phone: from },
                    create: { phone: from, role: 'CUSTOMER' },
                },
            },
        },
    });
    res.status(201).json({ success: true, data: ticket });
};
exports.handleWhatsApp = handleWhatsApp;
// @desc    Handle phone call
// @route   POST /api/v1/channels/phone
// @access  Public
const handlePhone = async (req, res) => {
    const { from, callSid, transcription } = req.body;
    const ticket = await prisma_js_1.prisma.ticket.create({
        data: {
            subject: 'Phone Call Ticket',
            description: transcription || 'Phone call received',
            source: 'PHONE',
            channelId: callSid,
            creator: {
                connectOrCreate: {
                    where: { phone: from },
                    create: { phone: from, role: 'CUSTOMER' },
                },
            },
        },
    });
    res.status(201).json({ success: true, data: ticket });
};
exports.handlePhone = handlePhone;
