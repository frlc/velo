import { describe, it, expect } from 'vitest';
import { calculateTotalPrice, calculateInstallment, formatPrice, CarConfiguration } from './configuratorStore';

describe('configuratorStore utilities', () => {
  describe('calculateTotalPrice', () => {
    it('should calculate the base price for default configuration', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'aero',
        optionals: [],
      };
      // Base price is 40000
      expect(calculateTotalPrice(config)).toBe(40000);
    });

    it('should add sport wheels price correctly', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'sport',
        optionals: [],
      };
      // Base price is 40000 + 2000 (sport)
      expect(calculateTotalPrice(config)).toBe(42000);
    });

    it('should add optionals prices correctly', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'aero',
        optionals: ['precision-park', 'flux-capacitor'],
      };
      // Base price is 40000 + 5500 + 5000
      expect(calculateTotalPrice(config)).toBe(50500);
    });

    it('should calculate price with both sport wheels and optionals', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'sport',
        optionals: ['flux-capacitor'],
      };
      // Base price is 40000 + 2000 (sport) + 5000 (flux)
      expect(calculateTotalPrice(config)).toBe(47000);
    });
  });

  describe('calculateInstallment', () => {
    it('should calculate the correct installment for 12x with 2% monthly interest', () => {
      const total = 40000;
      // Formula: (total * 0.02 * Math.pow(1.02, 12)) / (Math.pow(1.02, 12) - 1)
      // 40000 * 0.02 * 1.26824179456 / 0.26824179456 ≈ 3782.387
      expect(calculateInstallment(total)).toBe(3782.38);
    });
  });

  describe('formatPrice', () => {
    it('should format numbers to BRL currency string', () => {
      const formatted = formatPrice(40000);
      // Use regex to ignore the type of space (normal or non-breaking) used by different Node versions
      expect(formatted).toMatch(/R\$\s?40\.000,00/);
    });
  });
});
