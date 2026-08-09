import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validateVipCode, getVipState, clearVipState } from '../vipAccess';

// Mock fetch globally
global.fetch = vi.fn();

describe('VIP Access Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('getVipState', () => {
    it('should return default state when localStorage is empty', () => {
      const state = getVipState();

      expect(state.isUnlocked).toBe(false);
      expect(state.failedAttempts).toBe(0);
      expect(state.isLockedOut).toBe(false);
      expect(state.remainingAttempts).toBe(2);
    });

    it('should parse stored unlocked state correctly', () => {
      localStorage.setItem('ultradian_vip_unlocked_v1', 'true');

      const state = getVipState();

      expect(state.isUnlocked).toBe(true);
      expect(state.remainingAttempts).toBe(2);
    });

    it('should calculate lock status after failed attempts', () => {
      localStorage.setItem('ultradian_vip_failed_attempts_v1', '2');
      localStorage.setItem('ultradian_vip_locked_out_v1', 'true');

      const state = getVipState();

      expect(state.isUnlocked).toBe(false);
      expect(state.failedAttempts).toBe(2);
      expect(state.isLockedOut).toBe(true);
      expect(state.remainingAttempts).toBe(0);
    });
  });

  describe('validateVipCode', () => {
    it('should successfully validate correct code via server API', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            success: true,
            token: 'test-secure-token-123',
            expiresAt: Date.now() + 86400000,
          }),
      };
      (fetch as any).mockResolvedValue(mockResponse);

      const result = await validateVipCode('12345');

      expect(result.success).toBe(true);
      expect(result.token).toBe('test-secure-token-123');
      expect(fetch).toHaveBeenCalledWith(
        '/api/vip/validate',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ code: '12345' }),
        })
      );

      const updatedState = getVipState();
      expect(updatedState.isUnlocked).toBe(true);
    });

    it('should handle invalid code response from server API', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: () =>
          Promise.resolve({
            error: 'Invalid VIP code',
            remainingAttempts: 1,
          }),
      };
      (fetch as any).mockResolvedValue(mockResponse);

      const result = await validateVipCode('invalid-code');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid VIP code');

      const updatedState = getVipState();
      expect(updatedState.failedAttempts).toBe(1);
      expect(updatedState.isLockedOut).toBe(false);
    });

    it('should enforce lockout on reaching maximum failed attempts', async () => {
      localStorage.setItem('ultradian_vip_failed_attempts_v1', '1');

      const mockResponse = {
        ok: false,
        status: 401,
        json: () =>
          Promise.resolve({
            error: 'Invalid VIP code',
            remainingAttempts: 0,
          }),
      };
      (fetch as any).mockResolvedValue(mockResponse);

      const result = await validateVipCode('wrong-code-2');

      expect(result.success).toBe(false);
      expect(result.isLockedOut).toBe(true);

      const updatedState = getVipState();
      expect(updatedState.isLockedOut).toBe(true);
    });

    it('should handle server rate limiting (429 Too Many Requests)', async () => {
      const mockResponse = {
        ok: false,
        status: 429,
        json: () =>
          Promise.resolve({
            error: 'Too many attempts. Please try again later.',
            retryAfter: 3600,
          }),
      };
      (fetch as any).mockResolvedValue(mockResponse);

      const result = await validateVipCode('12345');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Too many attempts');
    });

    it('should handle network connection errors gracefully', async () => {
      (fetch as any).mockRejectedValue(new Error('Network error'));

      const result = await validateVipCode('12345');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network connection failure');
    });
  });

  describe('clearVipState', () => {
    it('should clear stored localStorage items', () => {
      localStorage.setItem('ultradian_vip_unlocked_v1', 'true');
      localStorage.setItem('ultradian_vip_failed_attempts_v1', '1');

      clearVipState();

      const state = getVipState();
      expect(state.isUnlocked).toBe(false);
      expect(state.failedAttempts).toBe(0);
    });
  });
});
