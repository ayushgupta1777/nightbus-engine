const { 
  getMatchingConfig, 
  getCapacityBounds, 
  getPriceBounds, 
  isPriceOverlapping, 
  isCapacityCompatible 
} = require('../../utils/matchingHelpers');

describe('Flexible Rental Matching Logic Unit Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Capacity Bounds & Compatibility (60:40 Rule)', () => {
    it('should compute correct capacity bounds for 7 passengers', () => {
      const { minCap, maxCap } = getCapacityBounds(7);
      expect(minCap).toBe(5); // 7 * 0.85 = 5.95 -> floor = 5
      expect(maxCap).toBe(11); // 7 / 0.60 = 11.66 -> floor = 11

      expect(isCapacityCompatible(7, 7)).toBe(true);
      expect(isCapacityCompatible(9, 7)).toBe(true);
      expect(isCapacityCompatible(10, 7)).toBe(true);
      expect(isCapacityCompatible(11, 7)).toBe(true);

      // Exceeds max bounds (excessively large vehicle)
      expect(isCapacityCompatible(14, 7)).toBe(false);
      expect(isCapacityCompatible(50, 7)).toBe(false);
    });

    it('should compute correct capacity bounds for 11 passengers', () => {
      const { minCap, maxCap } = getCapacityBounds(11);
      expect(minCap).toBe(9); // 11 * 0.85 = 9.35 -> floor = 9
      expect(maxCap).toBe(18); // 11 / 0.60 = 18.33 -> floor = 18

      expect(isCapacityCompatible(11, 11)).toBe(true);
      expect(isCapacityCompatible(14, 11)).toBe(true);
      expect(isCapacityCompatible(17, 11)).toBe(true);
      expect(isCapacityCompatible(18, 11)).toBe(true);

      expect(isCapacityCompatible(50, 11)).toBe(false);
    });

    it('should compute correct capacity bounds for 45 passengers', () => {
      const { minCap, maxCap } = getCapacityBounds(45);
      expect(minCap).toBe(38);
      expect(maxCap).toBe(75);

      expect(isCapacityCompatible(45, 45)).toBe(true);
      expect(isCapacityCompatible(50, 45)).toBe(true);
      expect(isCapacityCompatible(55, 45)).toBe(true);
    });

    it('should respect custom MATCHING_MIN_FILL_RATIO env variable', () => {
      process.env.MATCHING_MIN_FILL_RATIO = '0.50'; // 50% fill ratio threshold
      const { maxCap } = getCapacityBounds(7);
      expect(maxCap).toBe(14); // 7 / 0.50 = 14
      expect(isCapacityCompatible(14, 7)).toBe(true);
    });
  });

  describe('Amount Range Overlap & Price Tolerance', () => {
    it('should match overlapping price ranges (₹8,000–₹12,000 vs ₹10,000)', () => {
      expect(isPriceOverlapping(10000, 10000, 8000, 12000)).toBe(true);
    });

    it('should match overlapping price ranges (₹15,000–₹18,000 vs ₹16,000)', () => {
      expect(isPriceOverlapping(16000, 16000, 15000, 18000)).toBe(true);
    });

    it('should reject non-overlapping out-of-budget prices (₹8,000–₹12,000 vs ₹20,000)', () => {
      expect(isPriceOverlapping(20000, 20000, 8000, 12000)).toBe(false);
    });

    it('should match within tolerance buffer (₹8,000–₹12,000 vs ₹13,000 with 15% tolerance)', () => {
      // 12000 * 1.15 = 13800 -> 13000 is within 13800
      expect(isPriceOverlapping(13000, 13000, 8000, 12000)).toBe(true);
    });

    it('should respect custom MATCHING_PRICE_TOLERANCE_PCT env variable', () => {
      process.env.MATCHING_PRICE_TOLERANCE_PCT = '0.05'; // 5% strict tolerance
      // 12000 * 1.05 = 12600 -> 13000 should now be rejected
      expect(isPriceOverlapping(13000, 13000, 8000, 12000)).toBe(false);
    });
  });
});
