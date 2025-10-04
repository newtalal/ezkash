export interface CycleDates {
  startDate: Date;
  endDate: Date;
}

/**
 * Calculate the current spending cycle based on salary deposit date
 * @param salaryDate - Day of month when salary is deposited (1-31)
 * @returns Object with startDate and endDate of the current cycle
 */
export const getCurrentCycle = (salaryDate: number): CycleDates => {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  let startDate: Date;
  let endDate: Date;

  if (currentDay >= salaryDate) {
    // We're in the current month's cycle
    startDate = new Date(currentYear, currentMonth, salaryDate);
    endDate = new Date(currentYear, currentMonth + 1, salaryDate - 1, 23, 59, 59);
  } else {
    // We're still in the previous month's cycle
    startDate = new Date(currentYear, currentMonth - 1, salaryDate);
    endDate = new Date(currentYear, currentMonth, salaryDate - 1, 23, 59, 59);
  }

  return { startDate, endDate };
};

/**
 * Calculate days remaining in the current cycle
 */
export const getDaysRemainingInCycle = (salaryDate: number): number => {
  const { endDate } = getCurrentCycle(salaryDate);
  const today = new Date();
  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

/**
 * Calculate days elapsed in the current cycle
 */
export const getDaysElapsedInCycle = (salaryDate: number): number => {
  const { startDate } = getCurrentCycle(salaryDate);
  const today = new Date();
  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};