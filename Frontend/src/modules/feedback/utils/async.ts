export const withRetry = async <T>(
  operation: () => Promise<T>,
  retries = 2,
  delayMs = 350
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }

    await new Promise((resolve) => window.setTimeout(resolve, delayMs));
    return withRetry(operation, retries - 1, delayMs * 2);
  }
};
