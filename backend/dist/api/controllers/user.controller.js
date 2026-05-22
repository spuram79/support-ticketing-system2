"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserStatus = exports.deleteUser = exports.updateUser = exports.getUser = exports.getUsers = void 0;
const prisma_js_1 = require("../../config/prisma.js");
// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private
const getUsers = async (req, res) => {
    const { page = 1, limit = 20, role, status } = req.query;
    const skip = (page - 1) * limit;
    const where = {};
    if (role)
        where.role = role;
    if (status)
        where.status = status;
    const users = await prisma_js_1.prisma.user.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            status: true,
            lastLoginAt: true,
            createdAt: true,
        },
    });
    const total = await prisma_js_1.prisma.user.count({ where });
    res.status(200).json({
        success: true,
        count: users.length,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
        data: users,
    });
};
exports.getUsers = getUsers;
// @desc    Get user by ID
// @route   GET /api/v1/users/:id
// @access  Private
const getUser = async (req, res) => {
    const user = await prisma_js_1.prisma.user.findUnique({
        where: { id: req.params.id },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            status: true,
            lastLoginAt: true,
            createdAt: true,
        },
    });
    if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
};
exports.getUser = getUser;
// @desc    Update user
// @route   PATCH /api/v1/users/:id
// @access  Private
const updateUser = async (req, res) => {
    const { firstName, lastName, phone, role, status } = req.body;
    const user = await prisma_js_1.prisma.user.update({
        where: { id: req.params.id },
        data: { firstName, lastName, phone, role, status },
    });
    res.status(200).json({
        success: true,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            role: user.role,
            status: user.status,
        },
    });
};
exports.updateUser = updateUser;
// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private
const deleteUser = async (req, res) => {
    await prisma_js_1.prisma.user.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true, message: 'User deleted' });
};
exports.deleteUser = deleteUser;
// @desc    Update user status
// @route   PATCH /api/v1/users/:id/status
// @access  Private
const updateUserStatus = async (req, res) => {
    const { status } = req.body;
    const user = await prisma_js_1.prisma.user.update({
        where: { id: req.params.id },
        data: { status },
    });
    res.status(200).json({ success: true, data: user });
};
exports.updateUserStatus = updateUserStatus;
