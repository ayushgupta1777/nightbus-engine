/**
 * Matching Config & Helper Utilities for Rental Matching Engine
 */

const getMatchingConfig = () => {
  const minFillRatio = parseFloat(process.env.MATCHING_MIN_FILL_RATIO) || 0.60;
  const minCapacityRatio = parseFloat(process.env.MATCHING_MIN_CAPACITY_RATIO) || 0.85;
  const priceTolerancePct = parseFloat(process.env.MATCHING_PRICE_TOLERANCE_PCT) || 0.15;

  return {
    minFillRatio,
    minCapacityRatio,
    priceTolerancePct
  };
};

/**
 * Calculate min & max capacity bounds for a given passenger count (peopleCount)
 */
const getCapacityBounds = (peopleCount) => {
  const count = Math.max(1, Number(peopleCount) || 1);
  const { minFillRatio, minCapacityRatio } = getMatchingConfig();

  const minCap = Math.max(1, Math.floor(count * minCapacityRatio));
  const maxCap = Math.floor(count / minFillRatio);

  return { minCap, maxCap };
};

/**
 * Calculate price bounds with tolerance for a given budget range
 */
const getPriceBounds = (budgetMin, budgetMax) => {
  const min = Math.max(0, Number(budgetMin) || 0);
  const max = Math.max(min, Number(budgetMax) || min);
  const { priceTolerancePct } = getMatchingConfig();

  const minTol = Math.max(0, Math.round(min * (1 - priceTolerancePct)));
  const maxTol = Math.round(max * (1 + priceTolerancePct));

  return { minTol, maxTol };
};

/**
 * Check if owner price range [priceMin, priceMax] overlaps with customer budget [budgetMin, budgetMax] (with tolerance)
 */
const isPriceOverlapping = (priceMin, priceMax, budgetMin, budgetMax) => {
  const { minTol: budgetMinTol, maxTol: budgetMaxTol } = getPriceBounds(budgetMin, budgetMax);
  const pMin = Number(priceMin) || 0;
  const pMax = Number(priceMax) || pMin;

  return pMin <= budgetMaxTol && pMax >= budgetMinTol;
};

/**
 * Check if vehicle capacity is compatible with peopleCount under 60:40 rule
 */
const isCapacityCompatible = (capacity, peopleCount) => {
  const { minCap, maxCap } = getCapacityBounds(peopleCount);
  const cap = Number(capacity) || 0;
  return cap >= minCap && cap <= maxCap;
};

module.exports = {
  getMatchingConfig,
  getCapacityBounds,
  getPriceBounds,
  isPriceOverlapping,
  isCapacityCompatible
};
