// Genesis Studio - API Interceptor for Real-time Monitoring
// Automatically monitors all Fetch and XMLHttpRequest API calls

import { MetricsCollector, APIMetric } from './metricsCollector';

export class APIInterceptor {
  private metricsCollector: MetricsCollector;
  private isIntercepting = false;
  private originalFetch: typeof fetch;
  private monitoredEndpoints = new Set<string>();

  constructor(metricsCollector: MetricsCollector) {
    this.metricsCollector = metricsCollector;
    this.originalFetch = window.fetch.bind(window);
  }

  // Enable monitoring for Fetch API
  interceptFetch(): void {
    if (this.isIntercepting) return;
    this.isIntercepting = true;

    window.fetch = (async (...args: any[]) => {
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
      const method = args[1]?.method || 'GET';

      // Skip monitoring self URLs
      if (!this.shouldMonitor(url)) {
        return this.originalFetch(...args);
      }

      const startTime = performance.now();
      const startTimestamp = new Date().toISOString();

      try {
        const response = await this.originalFetch(...args);
        const endTime = performance.now();
        const clonedResponse = response.clone();

        // Extract metadata from response
        const contentType = response.headers.get('content-type') || '';
        const modelId = this.extractModelId(url);

        let metric: Partial<APIMetric> = {
          timestamp: Date.now(),
          modelName: modelId,
          endpoint: url,
          latency: endTime - startTime,
          inputTokens: 0,
          outputTokens: 0,
          success: response.ok
        };

        // Parse JSON response if available
        if (contentType.includes('application/json')) {
          try {
            const data = await clonedResponse.json();

            // Extract tokens from API response
            if (data.usage) {
              metric.inputTokens = data.usage.prompt_tokens || 0;
              metric.outputTokens = data.usage.completion_tokens || 0;
            }

            // Extract model from response
            if (data.model) {
              metric.modelName = data.model;
            }

            // Check for errors
            if (data.error) {
              metric.success = false;
              metric.errorMessage = data.error.message || 'Unknown error';
            }
          } catch (parseError) {
            // Response is not JSON, continue
          }
        }

        // Record metric
        if (metric.latency && metric.latency > 0) {
          await this.metricsCollector.recordMetric({
            timestamp: Date.now(),
            modelName: metric.modelName || 'unknown',
            endpoint: metric.endpoint || url,
            latency: metric.latency,
            inputTokens: metric.inputTokens || 0,
            outputTokens: metric.outputTokens || 0,
            success: metric.success || false,
            cost: 0 // Calculated by metricsCollector
          });
        }

        // Return cloned response so caller gets original
        const responseBody = await clonedResponse.text();
        return new Response(responseBody, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      } catch (error) {
        const endTime = performance.now();

        // Record failed request
        await this.metricsCollector.recordMetric({
          timestamp: Date.now(),
          modelName: this.extractModelId(url),
          endpoint: url,
          latency: endTime - startTime,
          inputTokens: 0,
          outputTokens: 0,
          success: false,
          cost: 0,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });

        // Re-throw the error
        throw error;
      }
    }) as typeof fetch;
  }

  // Disable monitoring
  disableInterception(): void {
    if (this.isIntercepting) {
      window.fetch = this.originalFetch;
      this.isIntercepting = false;
    }
  }

  // Determine if URL should be monitored
  private shouldMonitor(url: string): boolean {
    // Monitor API calls
    if (url.includes('/api/') || url.includes('api.')) {
      return true;
    }

    // Skip monitoring internal URLs
    const skipPatterns = ['localhost:3000', 'github.com', 'gist.github.com'];
    return !skipPatterns.some(pattern => url.includes(pattern));
  }

  // Extract model ID from URL or response
  private extractModelId(url: string): string {
    if (url.includes('gpt-4')) return 'GPT-4';
    if (url.includes('claude')) return 'Claude';
    if (url.includes('gemini')) return 'Gemini';
    if (url.includes('mistral')) return 'Mistral';
    return 'unknown';
  }

  // Get list of monitored endpoints
  getMonitoredEndpoints(): string[] {
    return Array.from(this.monitoredEndpoints);
  }
}

// Usage example:
// const collector = new MetricsCollector();
// const interceptor = new APIInterceptor(collector);
// interceptor.interceptFetch(); // Start monitoring
// interceptor.disableInterception(); // Stop monitoring
