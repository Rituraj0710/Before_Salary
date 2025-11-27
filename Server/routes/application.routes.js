import express from 'express';
import Application from '../models/Application.model.js';
import { protect } from '../middleware/auth.middleware.js';
import { uploadMultiple } from '../utils/upload.js';
import { sendEmail } from '../utils/sendEmail.js';
import mongoose from 'mongoose';
import Loan from '../models/Loan.model.js';

const router = express.Router();

// @route   POST /api/applications
// @desc    Create new loan application
// @access  Private
router.post('/', protect, uploadMultiple, async (req, res) => {
  try {
    const files = req.files || {};
    const applicationData = req.body;

    // Parse JSON fields if they're strings
    ['personalInfo','address','employmentInfo','loanDetails','dynamicFields'].forEach(f => {
      if (typeof applicationData[f] === 'string') {
        try { applicationData[f] = JSON.parse(applicationData[f]); } catch { /* ignore */ }
      }
    });

    // Accept loanId or loanProductId
    const loanId = applicationData.loanId || applicationData.loanProductId;
    if (!loanId || !mongoose.Types.ObjectId.isValid(loanId)) {
      return res.status(400).json({ success: false, message: 'Valid loanId required' });
    }

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    // Normalize loanDetails field names from frontend:
    // principal -> loanAmount, tenureMonths -> loanTenure
    const ld = applicationData.loanDetails || {};
    const loanAmount = Number(ld.loanAmount ?? ld.principal);
    const loanTenure = Number(ld.loanTenure ?? ld.tenureMonths);
    if (!Number.isFinite(loanAmount) || loanAmount <= 0) {
      return res.status(400).json({ success: false, message: 'loanAmount invalid' });
    }
    if (!Number.isFinite(loanTenure) || loanTenure <= 0) {
      return res.status(400).json({ success: false, message: 'loanTenure invalid' });
    }

    const annualRate = loan.interestRate?.default ?? loan.interestRate?.min ?? 0;
    const monthlyRate = annualRate / 100 / 12;
    const emi = monthlyRate > 0
      ? Math.round(
          (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTenure)) /
          (Math.pow(1 + monthlyRate, loanTenure) - 1)
        )
      : 0;

    // Prepare documents array
    const documents = [];
    const pushGroup = (arr, type) => {
      (arr || []).forEach(file => {
        documents.push({
          type,
          name: file.originalname,
          url: `/uploads/${file.filename}`,
          status: 'Pending'
        });
      });
    };
    pushGroup(files.idProof, 'ID');
    pushGroup(files.addressProof, 'Address');
    pushGroup(files.incomeProof, 'Income');
    pushGroup(files.bankStatement, 'Bank Statement');
    pushGroup(files.otherDocuments, 'Other');

    // Handle dynamic fields
    const dynamicFields = applicationData.dynamicFields || {};
    
    // Create application
    const application = await Application.create({
      userId: req.user._id,
      loanId: loan._id,
      loanType: loan.type,
      personalInfo: applicationData.personalInfo,
      address: applicationData.address,
      employmentInfo: applicationData.employmentInfo,
      loanDetails: {
        loanAmount,
        loanTenure,
        interestRate: annualRate,
        emi
      },
      documents,
      dynamicFields: dynamicFields,
      status: 'Submitted'
    });

    // Send confirmation email (fix signature)
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#333;">Loan Application Submitted</h2>
        <p style="color:#666;">Dear ${applicationData.personalInfo?.fullName || 'Applicant'},</p>
        <p style="color:#666;">Your loan application has been submitted successfully.</p>
        <p style="color:#666;"><strong>Application Number:</strong> ${application.applicationNumber}</p>
        <p style="color:#666;"><strong>Loan Type:</strong> ${loan.type}</p>
        <p style="color:#666;"><strong>Loan Amount:</strong> ₹${loanAmount.toLocaleString()}</p>
        <p style="color:#666;">We will review your application and get back to you soon.</p>
      </div>`;
    await sendEmail({
      to: applicationData.personalInfo?.email,
      subject: 'Loan Application Submitted',
      html: emailHtml,
      text: 'Your loan application has been submitted.'
    });

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   GET /api/applications
// @desc    Get user's applications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = { userId: req.user._id };
    
    // If admin, get all applications
    if (req.user.role === 'admin') {
      query = {};
    }

    const applications = await Application.find(query)
      .populate('loanId', 'name type category')
      .populate({ path: 'loanId', populate: { path: 'category', select: 'name slug active' } })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   GET /api/applications/:id
// @desc    Get single application
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({ path: 'loanId', populate: { path: 'category', select: 'name slug active' } })
      .populate('userId', 'name email phone')
      .populate('approvedBy', 'name');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user has access
    if (req.user.role !== 'admin' && application.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   PUT /api/applications/:id
// @desc    Update application
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Only user can update their own draft application, or admin can update any
    if (req.user.role !== 'admin' && 
        (application.userId.toString() !== req.user._id.toString() || application.status !== 'Draft')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedApplication
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   POST /api/applications/:id/approve
// @desc    Approve application (Admin only)
// @access  Private/Admin
router.post('/:id/approve', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const application = await Application.findById(req.params.id)
      .populate('userId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    application.status = 'Approved';
    application.approvedAt = new Date();
    application.approvedBy = req.user._id;
    await application.save();

    // Send approval email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #28a745;">Loan Application Approved!</h2>
        <p style="color: #666;">Dear ${application.personalInfo.fullName},</p>
        <p style="color: #666;">Congratulations! Your loan application has been approved.</p>
        <p style="color: #666;"><strong>Application Number:</strong> ${application.applicationNumber}</p>
        <p style="color: #666;"><strong>Loan Amount:</strong> ₹${application.loanDetails.loanAmount.toLocaleString()}</p>
        <p style="color: #666;">Our team will contact you shortly to proceed with the disbursement.</p>
      </div>
    `;

    await sendEmail(
      application.userId.email,
      'Loan Application Approved',
      emailHtml
    );

    res.json({
      success: true,
      message: 'Application approved successfully',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   POST /api/applications/:id/reject
// @desc    Reject application (Admin only)
// @access  Private/Admin
router.post('/:id/reject', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const { rejectionReason } = req.body;
    const application = await Application.findById(req.params.id)
      .populate('userId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    application.status = 'Rejected';
    application.rejectedAt = new Date();
    application.rejectionReason = rejectionReason || 'Application did not meet eligibility criteria';
    await application.save();

    // Send rejection email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc3545;">Loan Application Status</h2>
        <p style="color: #666;">Dear ${application.personalInfo.fullName},</p>
        <p style="color: #666;">We regret to inform you that your loan application has been rejected.</p>
        <p style="color: #666;"><strong>Application Number:</strong> ${application.applicationNumber}</p>
        <p style="color: #666;"><strong>Reason:</strong> ${application.rejectionReason}</p>
        <p style="color: #666;">Please feel free to contact us if you have any questions.</p>
      </div>
    `;

    await sendEmail(
      application.userId.email,
      'Loan Application Status',
      emailHtml
    );

    res.json({
      success: true,
      message: 'Application rejected',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// Validation helper
function validateObjectId(id, field) {
  if (!id) throw new Error(`${field} is required`);
  if (id === '') throw new Error(`${field} cannot be empty string`);
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error(`${field} is not a valid ObjectId`);
  return id;
}

export default router;



