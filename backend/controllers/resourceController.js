const Resource = require('../models/Resource');

// @desc    Get all resources
// @route   GET /api/resources
// @access  Private
exports.getResources = async (req, res) => {
    try {
        let query = {};

        // Filter by type
        if (req.query.type) {
            query.type = req.query.type;
        }

        // Filter by department
        if (req.query.department) {
            query.department = req.query.department;
        }

        // Filter by availability
        if (req.query.isAvailable !== undefined) {
            query.isAvailable = req.query.isAvailable === 'true';
        }

        const resources = await Resource.find(query);

        res.status(200).json({
            success: true,
            count: resources.length,
            data: resources,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Private
exports.getResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found',
            });
        }

        res.status(200).json({
            success: true,
            data: resource,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Create new resource
// @route   POST /api/resources
// @access  Private/Admin/Department
exports.createResource = async (req, res) => {
    try {
        const resource = await Resource.create(req.body);

        res.status(201).json({
            success: true,
            data: resource,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private/Admin/Department
exports.updateResource = async (req, res) => {
    try {
        const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found',
            });
        }

        res.status(200).json({
            success: true,
            data: resource,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private/Admin
exports.deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findByIdAndDelete(req.params.id);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Resource deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
