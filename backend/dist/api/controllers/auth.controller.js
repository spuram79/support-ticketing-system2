"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.changePassword = exports.updateProfile = exports.getProfile = exports.register = exports.login = void 0;
const prisma_js_1 = require("../../config/prisma.js");
const password_js_1 = require("../../utils/password.js");
const jwt_js_1 = require("../../utils/jwt.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const uuid_1 = require("uuid");
// @desc    Authenticate user & get token
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new errorHandler_js_1.AppError('Please provide email and password', 400);
    }
    const user = await prisma_js_1.prisma.user.findUnique({ where: { email } });
    if (!user || !(await (0, password_js_1.comparePassword)(password, user.password))) {
        throw new errorHandler_js_1.AppError('Invalid credentials', 401);
    }
    // Update last login
    await prisma_js_1.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
    });
    const token = (0, jwt_js_1.generateToken)({
        id: user.id,
        email: user.email,
        role: user.role,
    });
    res.status(200).json({
        success: true,
        token,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        },
    });
};
exports.login = login;
// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res) => {
    const { email, password, firstName, lastName, phone } = req.body;
    if (!email || !password) {
        throw new errorHandler_js_1.AppError('Please provide email and password', 400);
    }
    const existingUser = await prisma_js_1.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new errorHandler_js_1.AppError('User already exists', 409);
    }
    const hashedPassword = await (0, password_js_1.hashPassword)(password);
    const user = await prisma_js_1.prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phone,
        },
    });
    const token = (0, jwt_js_1.generateToken)({
        id: user.id,
        email: user.email,
        role: user.role,
    });
    res.status(201).json({
        success: true,
        token,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        },
    });
};
exports.register = register;
// @desc    Get current user profile
// @route   GET /api/v1/auth/me
// @access  Private
const getProfile = async (req, res) => {
    const user = await prisma_js_1.prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            status: true,
            createdAt: true,
        },
    });
    res.status(200).json({ success: true, user });
};
exports.getProfile = getProfile;
// @desc    Update user profile
// @route   PATCH /api/v1/auth/me
// @access  Private
const updateProfile = async (req, res) => {
    const { firstName, lastName, phone, avatar } = req.body;
    const user = await prisma_js_1.prisma.user.update({
        where: { id: req.user.id },
        data: { firstName, lastName, phone, avatar },
    });
    res.status(200).json({
        success: true,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            avatar: user.avatar,
        },
    });
};
exports.updateProfile = updateProfile;
// @desc    Change password
// @route   POST /api/v1/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        throw new errorHandler_js_1.AppError('Please provide current and new password', 400);
    }
    const user = await prisma_js_1.prisma.user.findUnique({ where: { id: req.user.id } });
    if (!(await (0, password_js_1.comparePassword)(currentPassword, user.password))) {
        throw new errorHandler_js_1.AppError('Current password is incorrect', 401);
    }
    const hashedPassword = await (0, password_js_1.hashPassword)(newPassword);
    await prisma_js_1.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
    });
    res.status(200).json({ success: true, message: 'Password changed successfully' });
};
exports.changePassword = changePassword;
// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await prisma_js_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        // Don't reveal if user exists
        return res.status(200).json({
            success: true,
            message: 'If the email exists, a reset link will be sent',
        });
    }
    const resetToken = (0, uuid_1.v4)();
    await prisma_js_1.prisma.user.update({
        where: { id: user.id },
        data: { password: await (0, password_js_1.hashPassword)(resetToken) },
    });
    // In production, send email with reset link
    res.status(200).json({
        success: true,
        message: 'If the email exists, a reset link will be sent',
    });
};
exports.forgotPassword = forgotPassword;
// @desc    Reset password
// @route   PATCH /api/v1/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    // In production, verify token from database
    res.status(200).json({ success: true, message: 'Password reset successfully' });
};
exports.resetPassword = resetPassword;
