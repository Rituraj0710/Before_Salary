import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  type: {
    type: String,
    enum: ['Personal', 'Business', 'Home', 'Vehicle', 'Education'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  features: [{
    title: String,
    description: String
  }],
  benefits: [{
    title: String,
    description: String
  }],
  eligibilityCriteria: {
    minAge: { type: Number, default: 18 },
    maxAge: { type: Number, default: 65 },
    minIncome: { type: Number, default: 25000 },
    minCreditScore: { type: Number, default: 600 },
    employmentType: [String], // ['Salaried', 'Self-Employed', 'Business']
    otherCriteria: [String]
  },
  requiredDocuments: [{
    name: String,
    description: String,
    required: { type: Boolean, default: true }
  }],
  repaymentOptions: [{
    tenure: Number, // in months
    interestRate: Number, // annual percentage
    emi: Number // example EMI
  }],
  interestRate: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    default: { type: Number, required: true }
  },
  minLoanAmount: {
    type: Number,
    required: true
  },
  maxLoanAmount: {
    type: Number,
    required: true
  },
  minTenure: {
    type: Number, // in months
    required: true
  },
  maxTenure: {
    type: Number, // in months
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('Loan', loanSchema);


