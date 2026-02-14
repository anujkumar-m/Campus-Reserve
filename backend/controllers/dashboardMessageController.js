const DashboardMessage = require('../models/DashboardMessage');

// @desc    Get dashboard messages for current user
// @route   GET /api/dashboard-messages
// @access  Private
exports.getMessages = async (req, res) => {
    try {
        let query = { userId: req.user._id };

        // Apply isRead filter if provided
        if (req.query.isRead !== undefined) {
            query.isRead = req.query.isRead === 'true';
        }

        const messages = await DashboardMessage.find(query)
            .populate({
                path: 'bookingId',
                populate: {
                    path: 'resourceId',
                    select: 'name type isMovable managedBy category'
                }
            })
            .sort('-createdAt')
            .limit(50); // Limit to last 50 messages

        // Filter for faculty users - only show fixed resource notifications
        let filteredMessages = messages;
        if (req.user.role === 'faculty') {
            filteredMessages = messages.filter(msg => {
                // Keep messages without bookings (system messages)
                if (!msg.bookingId) return true;

                // Keep only messages for fixed resources (isMovable === false)
                if (msg.bookingId.resourceId) {
                    return msg.bookingId.resourceId.isMovable === false;
                }

                return true;
            });
        }

        res.status(200).json({
            success: true,
            count: filteredMessages.length,
            data: filteredMessages,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get unread message count
// @route   GET /api/dashboard-messages/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
    try {
        // For faculty users, we need to filter by fixed resources
        if (req.user.role === 'faculty') {
            const messages = await DashboardMessage.find({
                userId: req.user._id,
                isRead: false,
            })
                .populate({
                    path: 'bookingId',
                    populate: {
                        path: 'resourceId',
                        select: 'isMovable'
                    }
                });

            // Filter to only fixed resources
            const filteredCount = messages.filter(msg => {
                if (!msg.bookingId) return true;
                if (msg.bookingId.resourceId) {
                    return msg.bookingId.resourceId.isMovable === false;
                }
                return true;
            }).length;

            return res.status(200).json({
                success: true,
                count: filteredCount,
            });
        }

        // For other roles, simple count
        const count = await DashboardMessage.countDocuments({
            userId: req.user._id,
            isRead: false,
        });

        res.status(200).json({
            success: true,
            count,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Mark message as read
// @route   PUT /api/dashboard-messages/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        const message = await DashboardMessage.findById(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found',
            });
        }

        // Check authorization
        if (message.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this message',
            });
        }

        message.isRead = true;
        message.readAt = new Date();
        await message.save();

        res.status(200).json({
            success: true,
            data: message,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Mark all messages as read
// @route   PUT /api/dashboard-messages/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
    try {
        await DashboardMessage.updateMany(
            { userId: req.user._id, isRead: false },
            { isRead: true, readAt: new Date() }
        );

        res.status(200).json({
            success: true,
            message: 'All messages marked as read',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Delete a message
// @route   DELETE /api/dashboard-messages/:id
// @access  Private
exports.deleteMessage = async (req, res) => {
    try {
        const message = await DashboardMessage.findById(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found',
            });
        }

        // Check authorization
        if (message.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this message',
            });
        }

        await message.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Message deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Create dashboard message (internal use)
// @route   Not exposed - used by other controllers
// @access  Internal
exports.createMessage = async (userId, bookingId, message, type = 'info') => {
    try {
        const dashboardMessage = await DashboardMessage.create({
            userId,
            bookingId,
            message,
            type,
        });
        return dashboardMessage;
    } catch (error) {
        console.error('Error creating dashboard message:', error);
        throw error;
    }
};
