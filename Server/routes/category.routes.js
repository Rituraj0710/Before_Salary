import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import LoanCategory from '../models/LoanCategory.model.js';
import Loan from '../models/Loan.model.js';

const router = express.Router();

function admin(req, res) {
  if (req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Admin only' });
    return false;
  }
  return true;
}

// Create
router.post('/', protect, async (req, res) => {
  if (!admin(req, res)) return;
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name required' });
    const cat = await LoanCategory.create({ name, description });
    res.status(201).json({ success: true, data: cat });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// List (optional counts)
// REMOVE 'protect' middleware here to allow public fetching of categories
router.get('/', async (req, res) => {
  try {
    const withCounts = req.query.withCounts === '1' || req.query.withCounts === 'true';
    const cats = await LoanCategory.find().sort({ name: 1 });
    if (withCounts) {
      const ids = cats.map(c => c._id);
      const counts = await Loan.aggregate([
        { $match: { category: { $in: ids } } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);
      const map = counts.reduce((a, c) => (a[c._id.toString()] = c.count, a), {});
      const data = cats.map(c => ({
        ...c.toObject(),
        loanCount: map[c._id.toString()] || 0
      }));
      return res.json({ success: true, count: data.length, data });
    }
    res.json({ success: true, count: cats.length, data: cats });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Single
router.get('/:id', protect, async (req, res) => {
  try {
    const cat = await LoanCategory.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: cat });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Update
router.put('/:id', protect, async (req, res) => {
  if (!admin(req, res)) return;
  try {
    const { name, description, active } = req.body;
    const cat = await LoanCategory.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Not found' });
    if (name) cat.name = name;
    if (description !== undefined) cat.description = description;
    if (active !== undefined) cat.active = active;
    await cat.save();
    res.json({ success: true, data: cat });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Delete (prevent if loans exist)
router.delete('/:id', protect, async (req, res) => {
  if (!admin(req, res)) return;
  try {
    const cat = await LoanCategory.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Not found' });
    const linked = await Loan.countDocuments({ category: cat._id });
    if (linked > 0) {
      return res.status(400).json({ success: false, message: 'Category has linked loans' });
    }
    await cat.deleteOne();
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// List loans in a category
router.get('/:id/loans', protect, async (req, res) => {
  try {
    const cat = await LoanCategory.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
    const loans = await Loan.find({ category: cat._id })
      .select('name type interestRate minLoanAmount maxLoanAmount minTenure maxTenure active')
      .sort({ createdAt: -1 });
    res.json({ success: true, category: { id: cat._id, name: cat.name }, count: loans.length, data: loans });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Create loan under category
router.post('/:id/loans', protect, async (req, res) => {
  if (!admin(req, res)) return;
  try {
    const cat = await LoanCategory.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
    const {
      name,
      description,
      type,
      interestRateMin,
      interestRateMax,
      interestRateDefault,
      minLoanAmount,
      maxLoanAmount,
      minTenure,
      maxTenure
    } = req.body;

    if (!name) return res.status(400).json({ success: false, message: 'Loan name required' });

    const interestRate = {
      min: Number(interestRateMin) || 0,
      max: Number(interestRateMax) || Number(interestRateMin) || 0,
      default: Number(interestRateDefault) || Number(interestRateMin) || 0
    };

    const loan = await Loan.create({
      name,
      description,
      type,
      interestRate,
      minLoanAmount: Number(minLoanAmount) || 0,
      maxLoanAmount: Number(maxLoanAmount) || 0,
      minTenure: Number(minTenure) || 0,
      maxTenure: Number(maxTenure) || 0,
      category: cat._id
    });

    res.status(201).json({ success: true, data: loan });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;
