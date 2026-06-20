export const calculateXIRR = (
  invested,
  currentValue,
  startDate
) => {

  if (
    !invested ||
    !currentValue ||
    !startDate
  ) {
    return 0;
  }

  const years =
    (new Date() - new Date(startDate)) /
    (1000 * 60 * 60 * 24 * 365);

  if (years <= 0) {
    return 0;
  }

  const xirr =
    (
      Math.pow(
        currentValue / invested,
        1 / years
      ) - 1
    ) * 100;

  return Number(
    xirr.toFixed(2)
  );
};