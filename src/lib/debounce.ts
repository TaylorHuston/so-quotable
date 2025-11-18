/**
 * Creates a debounced function that delays invoking func until after
 * delay milliseconds have elapsed since the last time it was invoked.
 *
 * The debounced function comes with a `cancel` method to cancel delayed
 * invocations and a `flush` method to immediately invoke them.
 *
 * @param func - The function to debounce
 * @param delay - The number of milliseconds to delay
 * @returns A debounced version of the function with cancel and flush methods
 *
 * @example
 * const debouncedSave = debounce((value: string) => {
 *   console.log('Saving:', value);
 * }, 300);
 *
 * // Will only save once after user stops typing for 300ms
 * input.addEventListener('input', (e) => {
 *   debouncedSave(e.target.value);
 * });
 *
 * // Cancel pending invocation
 * debouncedSave.cancel();
 *
 * // Immediately invoke pending invocation
 * debouncedSave.flush();
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
} {
  let timeoutId: NodeJS.Timeout | number | null = null;
  let lastArgs: Parameters<T> | null = null;

  const cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId as number);
      timeoutId = null;
      lastArgs = null;
    }
  };

  const flush = () => {
    if (timeoutId !== null && lastArgs !== null) {
      const args = lastArgs;
      cancel();
      func(...args);
    }
  };

  const debounced = (...args: Parameters<T>) => {
    lastArgs = args;
    
    if (timeoutId !== null) {
      clearTimeout(timeoutId as number);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      func(...lastArgs!);
      lastArgs = null;
    }, delay);
  };

  debounced.cancel = cancel;
  debounced.flush = flush;

  return debounced;
}
