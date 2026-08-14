import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RitualOnboardingModal } from '../../components/RitualOnboardingModal';
import { DEFAULT_SETTINGS } from '../storage';

describe('RitualOnboardingModal Component', () => {
  it('renders Step 1 with archetypes and allows selecting archetypes through to completion', async () => {
    const handleComplete = vi.fn();
    const handleClose = vi.fn();

    render(
      <RitualOnboardingModal
        isOpen={true}
        onClose={handleClose}
        settings={DEFAULT_SETTINGS}
        onCompleteOnboarding={handleComplete}
      />
    );

    expect(screen.getByText(/Focus Ritual Setup/i)).toBeInTheDocument();
    expect(screen.getAllByText('Builder').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Creator').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Scientist').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Strategist').length).toBeGreaterThanOrEqual(1);

    // Click Creator archetype card
    fireEvent.click(screen.getAllByText('Creator')[0]);

    // Move to Step 2
    fireEvent.click(screen.getByText(/Continue/i));
    expect(await screen.findByText(/Circadian Resonance/i)).toBeInTheDocument();

    // Click Morning Prime preset
    const morningPrime = await screen.findByText(/Morning Prime/i);
    fireEvent.click(morningPrime);

    // Move to Step 3
    fireEvent.click(screen.getByText(/Continue/i));
    expect(await screen.findByText(/Seal your Focus Passport/i)).toBeInTheDocument();
    expect(await screen.findByText(/Ultradian Archetype Pass/i)).toBeInTheDocument();

    // Click Seal Ritual & Begin
    const sealBtn = await screen.findByText(/Seal Ritual & Begin/i);
    fireEvent.click(sealBtn);

    await waitFor(() => {
      expect(handleComplete).toHaveBeenCalledTimes(1);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});
