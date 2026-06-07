// lib/rateLimit.ts
interface RateLimitConfig {
    interval: number;
    uniqueTokenPerInterval: number;
  }
  
  interface RateLimitStore {
    [key: string]: number[];
  }
  
  const rateLimit = (config: RateLimitConfig) => {
    const store: RateLimitStore = {};
  
    return {
      check: (key: string, limit: number, type: string): Promise<void> => {
        return new Promise((resolve, reject) => {
          const now = Date.now();
          
          if (!store[`${type}:${key}`]) {
            store[`${type}:${key}`] = [];
          }
          
          const timestamps = store[`${type}:${key}`];
          const windowStart = now - config.interval;
          
          // Remove old timestamps
          while (timestamps.length && timestamps[0] < windowStart) {
            timestamps.shift();
          }
          
          // Check if limit is exceeded
          if (timestamps.length >= limit) {
            reject(new Error('Rate limit exceeded'));
          } else {
            timestamps.push(now);
            resolve();
          }
        });
      }
    };
  };
  
  export default rateLimit;