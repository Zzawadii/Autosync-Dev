const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Example protected routes for bookings

// User can view their own bookings
router.get('/my-bookings', protect, (req, res) => {
    res.json({
        success: true,
        message: 'Get user bookings',
        userId: req.user.id
    });
});

// User can create booking
router.post('/', protect, (req, res) => {
    res.json({
        success: true,
        message: 'Create booking',
        userId: req.user.id
    });
});

// Admin only - view all bookings
router.get('/all', protect, authorize('admin'), (req, res) => {
    res.json({
        success: true,
        message: 'Get all bookings (admin only)'
    });
});

// Admin only - manage routes
router.post('/routes', protect, authorize('admin'), (req, res) => {
    res.json({
        success: true,
        message: 'Create route (admin only)'
    });
});

module.exports = router;
