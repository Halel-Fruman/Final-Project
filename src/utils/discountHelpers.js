/**
 * @function getActiveDiscount
 * @description Returns the first valid discount for now:
 *              1) product-level discount (highest priority)
 *              2) fallback to global promo (if in date-range)
 * @param {Array}  discounts      – product-level discounts
 * @param {Object} [globalPromo]  – promo from useGlobalPromo()
 * @returns {Object|null} active discount object or null
 */
export function getActiveDiscount(discounts = [], globalPromo) {
  const now = Date.now();

  // product-specific discount
  const product = discounts.find(({ startDate, endDate }) => {
    return new Date(startDate) <= now && now <= new Date(endDate);
  });
  if (product) return product;

  // global promo (if supplied + within range + active flag)
  if (
    globalPromo &&
    globalPromo.isActive &&
    new Date(globalPromo.start) <= now &&
    now <= new Date(globalPromo.end)
  ) {
    return globalPromo;
  }

  return null; // no discount right now
}
