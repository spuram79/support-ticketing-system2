"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.getProfile = exports.register = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        const user = await db_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, jwtSecret, { expiresIn: '7d' });
        return res.json({
            success: true,
            token,
            user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Login failed' });
    }
};
exports.login = login;
const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        const existingUser = await db_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const user = await db_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phone,
            },
        });
        return res.status(201).json({
            success: true,
            user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Registration failed' });
    }
};
exports.register = register;
const getProfile = async (req, res) => {
    try {
        const user = await db_1.prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, status: true },
        });
        return res.json({ success: true, data: user });
    }
    catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({ error: 'Failed to get profile' });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, phone } = req.body;
        const user = await db_1.prisma.user.update({
            where: { id: req.user.id },
            data: { firstName, lastName, phone },
        });
        return res.json({ success: true, data: user });
    }
    catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({ error: 'Failed to update profile' });
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await db_1.prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const isValid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
        await db_1.prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });
        return res.json({ success: true, message: 'Password changed successfully' });
    }
    catch (error) {
        console.error('Change password error:', error);
        return res.status(500).json({ error: 'Failed to change password' });
    }
};
exports.changePassword = changePassword;
