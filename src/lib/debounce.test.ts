import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from './debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should delay function execution until after delay period', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 300);

      debounced('test');
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(299);
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('test');
    });

    it('should pass correct arguments to debounced function', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 300);

      debounced('arg1', 'arg2', 'arg3');
      vi.advanceTimersByTime(300);

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });

    it('should handle functions with no arguments', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 300);

      debounced();
      vi.advanceTimersByTime(300);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should handle functions with complex argument types', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 300);

      const obj = { key: 'value' };
      const arr = [1, 2, 3];
      debounced(obj, arr, 42, 'string');
      vi.advanceTimersByTime(300);

      expect(fn).toHaveBeenCalledWith(obj, arr, 42, 'string');
    });
  });

  describe('Cancellation on Rapid Invocations', () => {
    it('should cancel previous invocation when called again before delay', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 300);

      debounced('first');
      vi.advanceTimersByTime(100);

      debounced('second');
      vi.advanceTimersByTime(100);

      debounced('third');
      vi.advanceTimersByTime(300);

      // Should only call once with the last value
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('third');
    });

    it('should reduce re-renders during rapid typing (performance test)', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 300);

      // Simulate typing 12 characters (one every 50ms)
      for (let i = 0; i < 12; i++) {
        debounced(`password${i}`);
        vi.advanceTimersByTime(50);
      }

      // After last keystroke, wait for debounce delay
      vi.advanceTimersByTime(300);

      // Should only invoke once instead of 12 times (91.7% reduction)
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('password11');
    });

    it('should allow multiple invocations if delay period elapses', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 300);

      debounced('first');
      vi.advanceTimersByTime(300);

      debounced('second');
      vi.advanceTimersByTime(300);

      debounced('third');
      vi.advanceTimersByTime(300);

      expect(fn).toHaveBeenCalledTimes(3);
      expect(fn).toHaveBeenNthCalledWith(1, 'first');
      expect(fn).toHaveBeenNthCalledWith(2, 'second');
      expect(fn).toHaveBeenNthCalledWith(3, 'third');
    });
  });

  describe('Cancel Method', () => {
    it('should cancel pending invocation', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 300);

      debounced('test');
      vi.advanceTimersByTime(100);

      debounced.cancel();
      vi.advanceTimersByTime(300);

      expect(fn).not.toHaveBeenCalled();
    });

    it('should do nothing if no pending invocation', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 300);

      // Cancel without any pending invocation
      expect(() => debounced.cancel()).not.toThrow();
    });

    it('should allow new invocations after cancel', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 300);

      debounced('first');
      debounced.cancel();

      debounced('second');
      vi.advanceTimersByTime(300);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('second');
    });
  });

  describe('Flush Method', () => {
    it('should immediately invoke pending invocation', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 300);

      debounced('test');
      vi.advanceTimersByTime(100);

      debounced.flush();

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('test');
    });

    it('should do nothing if no pending invocation', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 300);

      expect(() => debounced.flush()).not.toThrow();
      expect(fn).not.toHaveBeenCalled();
    });

    it('should prevent pending invocation from executing after flush', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 300);

      debounced('test');
      debounced.flush();

      vi.advanceTimersByTime(300);

      // Should only be called once (from flush), not twice
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle 0ms delay', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 0);

      debounced('test');
      vi.advanceTimersByTime(0);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('test');
    });

    it('should handle very large delay', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 10000);

      debounced('test');
      vi.advanceTimersByTime(9999);
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid cancel and invoke cycles', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 300);

      debounced('first');
      debounced.cancel();
      debounced('second');
      debounced.cancel();
      debounced('third');
      vi.advanceTimersByTime(300);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('third');
    });

    it('should handle rapid flush and invoke cycles', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 300);

      debounced('first');
      debounced.flush();
      debounced('second');
      debounced.flush();
      debounced('third');
      vi.advanceTimersByTime(300);

      expect(fn).toHaveBeenCalledTimes(3);
      expect(fn).toHaveBeenNthCalledWith(1, 'first');
      expect(fn).toHaveBeenNthCalledWith(2, 'second');
      expect(fn).toHaveBeenNthCalledWith(3, 'third');
    });
  });

  describe('Memory Leak Prevention', () => {
    it('should clean up timeout on cancel', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 300);

      debounced('test');
      debounced.cancel();

      // Advancing time shouldn't cause any execution
      vi.advanceTimersByTime(1000);
      expect(fn).not.toHaveBeenCalled();
    });

    it('should clean up references after execution', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 300);

      const largeObject = { data: new Array(1000).fill('x') };
      debounced(largeObject);
      vi.advanceTimersByTime(300);

      // After execution, internal references should be cleared
      // (We can't directly test this, but we verify no memory leaks by
      // ensuring subsequent calls work correctly)
      debounced('new-value');
      vi.advanceTimersByTime(300);

      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).toHaveBeenNthCalledWith(2, 'new-value');
    });
  });

  describe('Type Safety', () => {
    it('should preserve function return type (void)', () => {
      const fn = vi.fn((x: number) => x * 2);
      const debounced = debounce(fn, 300);

      // Should return void, not the function's return value
      const result = debounced(5);
      expect(result).toBeUndefined();

      vi.advanceTimersByTime(300);
      expect(fn).toHaveBeenCalledWith(5);
    });

    it('should enforce argument types', () => {
      const fn = vi.fn((x: number, y: string) => `${x}-${y}`);
      const debounced = debounce(fn, 300);

      // TypeScript should enforce these types (runtime test for verification)
      debounced(42, 'test');
      vi.advanceTimersByTime(300);

      expect(fn).toHaveBeenCalledWith(42, 'test');
    });
  });
});
