"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWebhook = void 0;
const crypto_1 = __importDefault(require("crypto"));
const prisma_js_1 = require("../../config/prisma.js");
// @desc    Handle incoming webhook
// @route   POST /api/v1/webhooks/:id
// @access  Public
const handleWebhook = async (req, res) => {
    const { id: webhookId } = req.params;
    const signature = req.headers['x-webhook-signature'];
    const payload = JSON.stringify(req.body);
    // Get webhook config
    const webhook = await prisma_js_1.prisma.webhook.findUnique({ where: { id: webhookId } });
    if (!webhook || !webhook.isEnabled) {
        return res.status(404).json({ error: 'Webhook not found' });
    }
    // Verify signature if secret exists
    if (webhook.secret) {
        const expectedSignature = crypto_1.default
            .createHmac('sha256', webhook.secret)
            .update(payload)
            .digest('hex');
        if (signature !== expectedSignature) {
            return res.status(401).json({ error: 'Invalid signature' });
        }
    }
    // Store webhook payload
    await prisma_js_1.prisma.webhookLog.create({
        data: {
            webhookId,
            payload: req.body,
        },
    });
    // Emit to socket
    const io = global.io;
    if (io) {
        io.emit('webhookReceived', { webhookId, payload: req.body });
    }
    res.status(200).json({ success: true, message: 'Webhook received' });
};
exports.handleWebhook = handleWebhook;
