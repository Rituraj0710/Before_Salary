import express from 'express';
import Loan from '../models/Loan.model.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   GET /api/loans
// @desc    Get all active loans
// @access  Public
router.get('/', async (req, res) => {
  try {
    const loans = await Loan.find({ isActive: true }).sort({ order: 1 });
    res.json({
      success: true,
      count: loans.length,
      data: loans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   GET /api/loans/:slug
// @desc    Get loan by slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const loan = await Loan.findOne({ slug: req.params.slug, isActive: true });
    
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    res.json({
      success: true,
      data: loan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   GET /api/loans/type/:type
// @desc    Get loans by type
// @access  Public
router.get('/type/:type', async (req, res) => {
  try {
    const loans = await Loan.find({ 
      type: req.params.type, 
      isActive: true 
    }).sort({ order: 1 });

    res.json({
      success: true,
      count: loans.length,
      data: loans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// Admin routes below - require authentication and admin role
// @route   POST /api/loans
// @desc    Create new loan
// @access  Private/Admin
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create loans'
      });
    }

    const loan = await Loan.create(req.body);
    res.status(201).json({
      success: true,
      data: loan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   PUT /api/loans/:id
// @desc    Update loan
// @access  Private/Admin
router.put('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update loans'
      });
    }

    const loan = await Loan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    res.json({
      success: true,
      data: loan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   DELETE /api/loans/:id
// @desc    Delete loan
// @access  Private/Admin
router.delete('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete loans'
      });
    }

    const loan = await Loan.findByIdAndDelete(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    res.json({
      success: true,
      message: 'Loan deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

export default router;



