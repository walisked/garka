import mongoose from 'mongoose';

const commissionConfigSchema = new mongoose.Schema({
  platformPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 10
  },
  adminPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 5
  },
  agentPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 40
  },
  dealInitiatorPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 45
  },
  minimumVerificationFee: {
    type: Number,
    required: true,
    min: 0,
    default: 5000
  },
  dynamicPricing: {
    enabled: Boolean,
    factors: [{
      name: String,
      weight: Number
    }]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  effectiveFrom: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Get active commission configuration
commissionConfigSchema.statics.getActiveConfig = async function() {
  return await this.findOne({ isActive: true }).sort({ effectiveFrom: -1 });
};

// Calculate commissions for a transaction
commissionConfigSchema.methods.calculateCommissions = function(totalAmount) {
  const platformFee = (this.platformPercentage / 100) * totalAmount;
  const adminFee = (this.adminPercentage / 100) * totalAmount;
  const agentFee = (this.agentPercentage / 100) * totalAmount;
  const dealInitiatorFee = (this.dealInitiatorPercentage / 100) * totalAmount;
  
  return {
    platformFee,
    adminFee,
    agentFee,
    dealInitiatorFee,
    totalFees: platformFee + adminFee + agentFee + dealInitiatorFee,
    netAmount: totalAmount - (platformFee + adminFee + agentFee + dealInitiatorFee)
  };
};

export default mongoose.model('CommissionConfig', commissionConfigSchema);
