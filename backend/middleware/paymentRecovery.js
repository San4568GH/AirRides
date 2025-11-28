/**
 * Payment Recovery Middleware
 * Ensures failed payment-booking flows can be recovered
 */

import { PaymentLog } from '../schemas/PaymentLogSchema.js';
import UserSchema from '../schemas/UserSchema.js';
import Flight from '../schemas/FlightSchema.js';
import { generateUniqueBookingId } from '../utils/bookingUtils.js';

/**
 * Log payment attempt for recovery purposes
 */
export const logPaymentAttempt = async (paymentData) => {
  try {
    await PaymentLog.create({
      razorpay_payment_id: paymentData.razorpay_payment_id,
      razorpay_order_id: paymentData.razorpay_order_id,
      razorpay_signature: paymentData.razorpay_signature,
      userId: paymentData.userId,
      flightId: paymentData.flightId,
      bookingDetails: paymentData.bookingDetails,
      status: 'PENDING',
      attempts: 1,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Failed to log payment attempt:', error);
    // Don't throw - logging failure shouldn't stop payment
  }
};

/**
 * Mark payment as successfully processed
 */
export const markPaymentProcessed = async (razorpay_payment_id, bookingId) => {
  try {
    await PaymentLog.findOneAndUpdate(
      { razorpay_payment_id },
      { 
        status: 'PROCESSED',
        bookingId: bookingId,
        processedAt: new Date()
      }
    );
  } catch (error) {
    console.error('Failed to mark payment as processed:', error);
  }
};

/**
 * Mark payment as failed
 */
export const markPaymentFailed = async (razorpay_payment_id, errorMessage) => {
  try {
    await PaymentLog.findOneAndUpdate(
      { razorpay_payment_id },
      { 
        status: 'FAILED',
        errorMessage: errorMessage,
        failedAt: new Date(),
        $inc: { attempts: 1 }
      }
    );
  } catch (error) {
    console.error('Failed to mark payment as failed:', error);
  }
};

/**
 * Recover orphaned payments (payment verified but booking not created)
 * Run this as a background job every 5 minutes
 */
export const recoverOrphanedPayments = async () => {
  try {
    // Find payments that are PENDING for more than 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const orphanedPayments = await PaymentLog.find({
      status: 'PENDING',
      createdAt: { $lt: fiveMinutesAgo },
      attempts: { $lt: 3 } // Max 3 retry attempts
    });

    console.log(`Found ${orphanedPayments.length} orphaned payments to recover`);

    for (const payment of orphanedPayments) {
      try {
        // Check if booking already exists (might have been created but log not updated)
        const user = await UserSchema.findById(payment.userId);
        const existingBooking = user?.bookedFlights?.find(
          b => b.paymentDetails?.razorpay_payment_id === payment.razorpay_payment_id
        );

        if (existingBooking) {
          // Booking exists, just update log
          await markPaymentProcessed(payment.razorpay_payment_id, existingBooking.bookingId);
          console.log(`✓ Recovered orphaned payment log: ${payment.razorpay_payment_id}`);
          continue;
        }

        // Booking doesn't exist - create it
        const bookingId = generateUniqueBookingId();
        const booking = {
          bookingId,
          ...payment.bookingDetails,
          paymentDetails: {
            razorpay_payment_id: payment.razorpay_payment_id,
            razorpay_order_id: payment.razorpay_order_id,
            razorpay_signature: payment.razorpay_signature
          },
          bookingDate: payment.createdAt,
          status: 'CONFIRMED',
          recoveredFromFailure: true
        };

        user.bookedFlights.push(booking);
        await user.save();

        // Update flight seats
        await Flight.findByIdAndUpdate(payment.flightId, {
          $inc: { seatsAvailable: -payment.bookingDetails.passengers }
        });

        await markPaymentProcessed(payment.razorpay_payment_id, bookingId);

        console.log(`✓ Successfully recovered orphaned payment: ${payment.razorpay_payment_id} → ${bookingId}`);
      } catch (error) {
        console.error(`Failed to recover payment ${payment.razorpay_payment_id}:`, error);
        await markPaymentFailed(payment.razorpay_payment_id, error.message);
      }
    }

    return orphanedPayments.length;
  } catch (error) {
    console.error('Error in recoverOrphanedPayments:', error);
    return 0;
  }
};

/**
 * Get payment recovery statistics
 */
export const getPaymentStats = async () => {
  try {
    const stats = await PaymentLog.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = stats.reduce((sum, s) => sum + s.count, 0);
    const processed = stats.find(s => s._id === 'PROCESSED')?.count || 0;
    const pending = stats.find(s => s._id === 'PENDING')?.count || 0;
    const failed = stats.find(s => s._id === 'FAILED')?.count || 0;

    return {
      total,
      processed,
      pending,
      failed,
      successRate: total > 0 ? ((processed / total) * 100).toFixed(2) : 0
    };
  } catch (error) {
    console.error('Error getting payment stats:', error);
    return null;
  }
};
