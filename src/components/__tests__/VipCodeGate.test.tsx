import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { VipCodeGate } from '../VipCodeGate';
import * as vipUtils from '../../utils/vipAccess';

// Mock the utility functions
vi.mock('../../utils/vipAccess', async () => {
  const actual = await vi.importActual<typeof import('../../utils/vipAccess')>('../../utils/vipAccess');
  return {
    ...actual,
    getVipState: vi.fn(() => ({
      isUnlocked: false,
      failedAttempts: 0,
      isLockedOut: false,
      remainingAttempts: 2,
    })),
    validateVipCode: vi.fn(),
  };
});

describe('VipCodeGate Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dual unlock options', () => {
    render(<VipCodeGate featureName="AI Recommendations" />);

    expect(screen.getByText('Option 1: Sign In or Register')).toBeInTheDocument();
    expect(screen.getByText('Option 2: Enter Creator VIP Passcode')).toBeInTheDocument();
  });

  it('should show lockout status when locked out', () => {
    vi.mocked(vipUtils.getVipState).mockReturnValue({
      isUnlocked: false,
      failedAttempts: 2,
      isLockedOut: true,
      remainingAttempts: 0,
    });

    render(<VipCodeGate />);

    expect(screen.getByText('🔒 Entry Locked (2/2 Failed)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Entry stopped (2/2 failed tries)')).toBeDisabled();
  });

  it('should call onUnlocked when validation succeeds', async () => {
    const mockOnUnlocked = vi.fn();
    vi.mocked(vipUtils.getVipState).mockReturnValue({
      isUnlocked: false,
      failedAttempts: 0,
      isLockedOut: false,
      remainingAttempts: 2,
    });
    vi.mocked(vipUtils.validateVipCode).mockResolvedValue({
      success: true,
      token: 'test-secure-token',
      expiresAt: Date.now() + 86400000,
      message: '✨ Creator VIP Code verified!',
    });

    render(<VipCodeGate onUnlocked={mockOnUnlocked} />);

    const input = screen.getByPlaceholderText('Enter 5-digit numeric code (e.g. 12345)...');
    const button = screen.getByText('Verify VIP Code');

    fireEvent.change(input, { target: { value: '12345' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOnUnlocked).toHaveBeenCalled();
    });
  });
});
