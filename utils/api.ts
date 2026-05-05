
import { GoogleGenAI } from "@google/genai";

/**
 * Retries an asynchronous function with exponential backoff on specific errors.
 * @param fn The asynchronous function to retry.
 * @param maxRetries The maximum number of retries.
 * @param initialDelayMs The initial delay in milliseconds before the first retry.
 * @returns The result of the function if successful.
 * @throws The original error if all retries are exhausted or a non-retryable error occurs.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000 // 1 second
): Promise<T> {
  let attempts = 0;
  while (attempts <= maxRetries) {
    try {
      return await fn();
    } catch (error) {
      // Check if it's a rate limit or resource exhausted error
      const isRateLimitError = (error instanceof Error && error.message.includes('429')) ||
                               (error as any)?.error?.code === 429 ||
                               (error as any)?.error?.status === 'RESOURCE_EXHAUSTED';

      if (isRateLimitError && attempts < maxRetries) {
        attempts++;
        const delay = initialDelayMs * Math.pow(2, attempts - 1) + Math.random() * 500; // Exponential backoff + jitter
        console.warn(`Rate limit exceeded or resource exhausted. Retrying in ${delay.toFixed(0)}ms (attempt ${attempts}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // Re-throw if retries exhausted or a different type of error
        throw error;
      }
    }
  }
  // This line should technically be unreachable if maxRetries is honored,
  // but included for type safety and clarity.
  throw new Error("Maximum retries exhausted.");
}
