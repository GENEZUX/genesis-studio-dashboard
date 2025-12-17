// Genesis Studio Metrics Collector
// Real-time monitoring & analytics for AI API usage

export interface APIMetric {
  timestamp: number;
  modelName: string;
  endpoint: string;
  inputTokens: number;
  outputTokens: number;
  latency: number;
  cost: number;
  success: boolean;
  errorMessage?: string;
}

export interface CostMetrics {
  dailyCost: number;
  weeklyCost: number;
  monthlyCost: number;
  estimatedMonthlyTotal: number;
  costPerModel: { [key: string]: number };
}

export class MetricsCollector {
  private metrics: APIMetric[] = [];
  private readonly MAX_METRICS = 1000;
  private costCache: CostMetrics | null = null;
  private lastCacheUpdate = 0;

  recordMetric(metric: APIMetric) {
    this.metrics.push(metric);
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }
    this.invalidateCache();
  }

  getMetrics(minutes: number = 60): APIMetric[] {
    const cutoff = Date.now() - minutes * 60 * 1000;
    return this.metrics.filter(m => m.timestamp > cutoff);
  }

  getCostMetrics(): CostMetrics {
    if (this.costCache && Date.now() - this.lastCacheUpdate < 6000) {
      return this.costCache;
    }

    const now = Date.now();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();
    const weekAgo = todayTime - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = todayTime - 30 * 24 * 60 * 60 * 1000;

    const dailyCost = this.metrics.filter(m => m.timestamp > todayTime).reduce((sum, m) => sum + m.cost, 0);
    const weeklyCost = this.metrics.filter(m => m.timestamp > weekAgo).reduce((sum, m) => sum + m.cost, 0);
    const monthlyCost = this.metrics.filter(m => m.timestamp > monthAgo).reduce((sum, m) => sum + m.cost, 0);

    const costPerModel: { [key: string]: number } = {};
    this.metrics.forEach(m => {
      costPerModel[m.modelName] = (costPerModel[m.modelName] || 0) + m.cost;
    });

    this.costCache = {
      dailyCost,
      weeklyCost,
      monthlyCost,
      estimatedMonthlyTotal: (dailyCost / 30),
      costPerModel
    };
    this.lastCacheUpdate = now;
    return this.costCache;
  }

  getAverageLatency(minutes: number = 60): number {
    const recentMetrics = this.getMetrics(minutes);
    if (recentMetrics.length === 0) return 0;
    const total = recentMetrics.reduce((sum, m) => sum + m.latency, 0);
    return total / recentMetrics.length;
  }

  getErrorRate(minutes: number = 60): number {
    const recentMetrics = this.getMetrics(minutes);
    if (recentMetrics.length === 0) return 0;
    const errors = recentMetrics.filter(m => !m.success).length;
    return (errors / recentMetrics.length) * 100;
  }

  getThroughput(minutes: number = 60): number {
    const recentMetrics = this.getMetrics(minutes);
    return recentMetrics.length / (minutes / 60);
  }

  private invalidateCache() {
    this.costCache = null;
  }
}
