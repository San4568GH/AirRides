/**
 * Payment Monitoring Service
 * Tracks payment reliability metrics for 99.9% uptime claim
 */

import { PaymentLog } from '../schemas/PaymentLogSchema.js';

class PaymentMonitor {
  constructor() {
    this.metrics = {
      totalAttempts: 0,
      successful: 0,
      failed: 0,
      recovered: 0,
      averageProcessingTime: 0,
      uptime: 0
    };
    
    this.startTime = Date.now();
    this.updateInterval = null;
  }

  /**
   * Start monitoring with periodic metric updates
   */
  startMonitoring(intervalMs = 60000) { // Update every minute
    console.log('📊 Payment monitoring started');
    
    this.updateMetrics();
    this.updateInterval = setInterval(() => {
      this.updateMetrics();
    }, intervalMs);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      console.log('📊 Payment monitoring stopped');
    }
  }

  /**
   * Update current metrics from database
   */
  async updateMetrics() {
    try {
      const stats = await PaymentLog.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgTime: {
              $avg: {
                $cond: [
                  { $eq: ['$status', 'PROCESSED'] },
                  { $subtract: ['$processedAt', '$createdAt'] },
                  null
                ]
              }
            }
          }
        }
      ]);

      const total = stats.reduce((sum, s) => sum + s.count, 0);
      const processed = stats.find(s => s._id === 'PROCESSED')?.count || 0;
      const failed = stats.find(s => s._id === 'FAILED')?.count || 0;
      const avgTime = stats.find(s => s._id === 'PROCESSED')?.avgTime || 0;

      // Count recovered payments
      const recovered = await PaymentLog.countDocuments({ 
        status: 'PROCESSED',
        recoveredFromFailure: true 
      });

      this.metrics.totalAttempts = total;
      this.metrics.successful = processed;
      this.metrics.failed = failed;
      this.metrics.recovered = recovered;
      this.metrics.averageProcessingTime = avgTime;
      this.metrics.uptime = this.calculateUptime();

    } catch (error) {
      console.error('Error updating payment metrics:', error);
    }
  }

  /**
   * Calculate success rate percentage
   */
  getSuccessRate() {
    if (this.metrics.totalAttempts === 0) return 100;
    return ((this.metrics.successful / this.metrics.totalAttempts) * 100).toFixed(3);
  }

  /**
   * Calculate uptime (payments processed without manual intervention)
   */
  calculateUptime() {
    const total = this.metrics.totalAttempts;
    if (total === 0) return 100;
    
    // Uptime = (successful on first attempt + recovered) / total
    const reliable = this.metrics.successful;
    return ((reliable / total) * 100).toFixed(3);
  }

  /**
   * Get comprehensive metrics report
   */
  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.getSuccessRate(),
      reliability: this.calculateUptime(),
      averageProcessingTimeMs: Math.round(this.metrics.averageProcessingTime),
      uptimeHours: ((Date.now() - this.startTime) / (1000 * 60 * 60)).toFixed(2)
    };
  }

  /**
   * Check if system meets 99.9% reliability threshold
   */
  meetsReliabilityThreshold() {
    const uptime = parseFloat(this.calculateUptime());
    return uptime >= 99.9;
  }

  /**
   * Log current metrics to console
   */
  logMetrics() {
    const metrics = this.getMetrics();
    console.log('\n📊 Payment Reliability Metrics:');
    console.log(`   Total Attempts: ${metrics.totalAttempts}`);
    console.log(`   Successful: ${metrics.successful}`);
    console.log(`   Failed: ${metrics.failed}`);
    console.log(`   Recovered: ${metrics.recovered}`);
    console.log(`   Success Rate: ${metrics.successRate}%`);
    console.log(`   Reliability: ${metrics.reliability}%`);
    console.log(`   Avg Processing Time: ${metrics.averageProcessingTimeMs}ms`);
    console.log(`   System Uptime: ${metrics.uptimeHours}h`);
    console.log(`   99.9% Threshold: ${this.meetsReliabilityThreshold() ? '✅ MET' : '❌ NOT MET'}\n`);
  }

  /**
   * Get alerts for degraded performance
   */
  getAlerts() {
    const alerts = [];
    const metrics = this.getMetrics();

    if (parseFloat(metrics.reliability) < 99.9) {
      alerts.push({
        severity: 'HIGH',
        message: `Reliability below threshold: ${metrics.reliability}% (target: 99.9%)`
      });
    }

    if (parseFloat(metrics.successRate) < 95) {
      alerts.push({
        severity: 'CRITICAL',
        message: `Success rate critically low: ${metrics.successRate}%`
      });
    }

    if (metrics.averageProcessingTimeMs > 5000) {
      alerts.push({
        severity: 'MEDIUM',
        message: `High processing time: ${metrics.averageProcessingTimeMs}ms`
      });
    }

    const pendingCount = this.metrics.totalAttempts - this.metrics.successful - this.metrics.failed;
    if (pendingCount > 10) {
      alerts.push({
        severity: 'MEDIUM',
        message: `${pendingCount} payments pending recovery`
      });
    }

    return alerts;
  }
}

// Singleton instance
const paymentMonitor = new PaymentMonitor();

export default paymentMonitor;
