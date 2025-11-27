import express from 'express';
import Eligibility from '../models/Eligibility.model.js';

const router = express.Router();

// @route   POST /api/eligibility
// @desc    Submit eligibility check form
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      email,
      loanId,
      pancard,
      dob,
      gender,
      personalEmail,
      employmentType,
      companyName,
      nextSalaryDate,
      netMonthlyIncome,
      pinCode,
      state,
      city
    } = req.body;

    // Validate required fields
    if (!email || !pancard || !dob || !gender || !personalEmail || !employmentType || !netMonthlyIncome || !pinCode) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields'
      });
    }

    // Validate employment type specific fields
    if (employmentType === 'SALARIED' && (!companyName || !nextSalaryDate)) {
      return res.status(400).json({
        success: false,
        message: 'Company name and next salary date are required for salaried employees'
      });
    }

    // Create eligibility record
    const eligibility = await Eligibility.create({
      email: email.toLowerCase().trim(),
      loanId: loanId || null,
      pancard: pancard.toUpperCase().trim(),
      dob: new Date(dob),
      gender,
      personalEmail: personalEmail.toLowerCase().trim(),
      employmentType,
      companyName: companyName?.trim() || null,
      nextSalaryDate: nextSalaryDate ? new Date(nextSalaryDate) : null,
      netMonthlyIncome: Number(netMonthlyIncome),
      pinCode: pinCode.trim(),
      state: state?.trim() || null,
      city: city?.trim() || null,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Eligibility check submitted successfully',
      data: eligibility
    });
  } catch (error) {
    console.error('Error submitting eligibility:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   GET /api/eligibility
// @desc    Get all eligibility checks (admin only)
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, email, loanId } = req.query;
    const query = {};

    if (email) {
      query.email = email.toLowerCase().trim();
    }
    if (loanId) {
      query.loanId = loanId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const eligibilities = await Eligibility.find(query)
      .populate('loanId', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Eligibility.countDocuments(query);

    res.json({
      success: true,
      data: eligibilities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   GET /api/eligibility/:id
// @desc    Get single eligibility check
// @access  Private/Admin
router.get('/:id', async (req, res) => {
  try {
    const eligibility = await Eligibility.findById(req.params.id)
      .populate('loanId', 'name slug');

    if (!eligibility) {
      return res.status(404).json({
        success: false,
        message: 'Eligibility check not found'
      });
    }

    res.json({
      success: true,
      data: eligibility
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

export default router;

