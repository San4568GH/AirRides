import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Payment Log Schema
 * Tracks all payment attempts for recovery and monitoring
 */
const paymentLogSchema = new Schema({
  razorpay_payment_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  razorpay_order_id: {
    type: String,
    required: true,
    index: true
  },
  razorpay_signature: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  flightId: {
    type: Schema.Types.ObjectId,
    ref: 'Flight',
    required: true
  },
  bookingDetails: {
    flightNumber: String,
    from: String,
    to: String,
    departureTime: Date,
    arrivalTime: Date,
    airline: String,
    price: Number,
    passengers: Number
  },
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSED', 'FAILED'],
    default: 'PENDING',
    index: true
  },
  bookingId: {
    type: String,
    index: true
  },
  attempts: {
    type: Number,
    default: 1
  },
  errorMessage: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  processedAt: Date,
  failedAt: Date,
  recoveredFromFailure: {
    type: Boolean,
    default: false
  }
});

// Compound index for efficient orphaned payment queries
paymentLogSchema.index({ status: 1, createdAt: 1, attempts: 1 });

// TTL index - auto-delete logs after 90 days
paymentLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const PaymentLog = mongoose.model('PaymentLog', paymentLogSchema);
