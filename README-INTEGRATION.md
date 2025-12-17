# Genesis Studio - Integration Guide

## Overview

Genesis Studio is a comprehensive real-time monitoring and analytics dashboard for AI API usage, providing deep insights into metrics such as costs, performance, and model distribution.

## Quick Start

### Installation

```bash
npm install react recharts lucide-react tailwindcss
```

### Setup

1. Copy the files to your project:
   - `MonitoringDashboard.tsx` → components directory
   - `metricsCollector.ts` → utils directory
   - `APIInterceptor.ts` → utils directory

2. Import and use in your app:

```tsx
import { MonitoringDashboard } from '@/components/MonitoringDashboard';
import { MetricsCollector } from '@/utils/metricsCollector';
import { APIInterceptor } from '@/utils/APIInterceptor';

export default function App() {
  return <MonitoringDashboard />;
}
```

### Enable API Monitoring

```tsx
const collector = new MetricsCollector();
const interceptor = new APIInterceptor(collector);
interceptor.interceptFetch(); // Start monitoring all fetch requests
```

## Core Components

### MonitoringDashboard
React component that displays real-time metrics:
- Total Requests
- Total Cost
- Average Latency
- Error Rate
- Uptime
- Model Distribution
- Cost Breakdown

### MetricsCollector
Utility class for collecting and analyzing API metrics:
- `recordMetric(metric)` - Record a new metric
- `getMetrics(minutes)` - Get metrics from last N minutes
- `getCostMetrics()` - Get cost analysis
- `getAverageLatency(minutes)` - Calculate average latency
- `getErrorRate(minutes)` - Calculate error rate percentage
- `getThroughput(minutes)` - Calculate requests per hour

### APIInterceptor
Automatically monitors all Fetch API calls:
- `interceptFetch()` - Start monitoring
- `disableInterception()` - Stop monitoring
- Extracts token usage, latency, and error information
- Records metrics to MetricsCollector

## Configuration

### Customize Monitored URLs

Modify the `shouldMonitor()` method in `APIInterceptor.ts`:

```typescript
private shouldMonitor(url: string): boolean {
  // Monitor your API endpoints
  if (url.includes('your-api.com')) return true;
  
  // Skip monitoring certain patterns
  const skipPatterns = ['localhost', 'analytics'];
  return !skipPatterns.some(pattern => url.includes(pattern));
}
```

### Update Model Recognition

Modify the `extractModelId()` method:

```typescript
private extractModelId(url: string): string {
  if (url.includes('your-model')) return 'YourModel';
  return 'unknown';
}
```

## API Metrics Structure

```typescript
interface APIMetric {
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
```

## Cost Analytics Structure

```typescript
interface CostMetrics {
  dailyCost: number;
  weeklyCost: number;
  monthlyCost: number;
  estimatedMonthlyTotal: number;
  costPerModel: { [key: string]: number };
}
```

## Features

✅ Real-time API monitoring
✅ Automatic request interception
✅ Cost tracking and analysis
✅ Performance metrics visualization
✅ Error tracking and reporting
✅ Model distribution analysis
✅ Time range filtering (1h, 24h, 7d, 30d)
✅ Responsive design with glassmorphism UI

## Performance Considerations

- Maximum 1000 metrics stored in memory (configurable)
- 6-second cache for cost calculations
- Non-blocking metric recording
- Minimal overhead on API calls

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern browsers with Fetch API support

## License

MIT

## Support

For issues or questions, please refer to the main project documentation or create an issue on GitHub.
