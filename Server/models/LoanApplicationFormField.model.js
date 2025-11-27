import mongoose from 'mongoose';

const loanApplicationFormFieldSchema = new mongoose.Schema({
  loanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Text', 'Number', 'Email', 'Phone', 'Date', 'Textarea', 'Select', 'Checkbox', 'Radio'],
    default: 'Text',
    required: true
  },
  width: {
    type: String,
    enum: ['full', 'half', 'third', 'quarter'],
    default: 'full'
  },
  required: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    trim: true
  },
  label: {
    type: String,
    trim: true
  },
  options: [{
    type: String,
    trim: true
  }], // For Select, Radio types
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
loanApplicationFormFieldSchema.index({ loanId: 1, order: 1 });

export default mongoose.model('LoanApplicationFormField', loanApplicationFormFieldSchema);

