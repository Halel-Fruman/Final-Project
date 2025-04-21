export function getActiveDiscount(discounts) {
    const now = new Date();
    return discounts?.find(({ startDate, endDate }) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return start <= now && now <= end;
    });
  }
