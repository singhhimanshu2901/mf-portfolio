export const calculateFDValue = (
  amount,
  investmentDate,
  annualRate = 7
) => {

  const startDate =
    new Date(investmentDate);

  const today =
    new Date();

  const years =
    (today - startDate) /
    (1000 * 60 * 60 * 24 * 365);

  const fdValue =
    amount *
    Math.pow(
      1 + annualRate / 100,
      years
    );

  return fdValue;
};

export const calculatePortfolioFDValue =
  (transactions, annualRate = 7) => {

    let totalFDValue = 0;

    for (const txn of transactions) {

      totalFDValue +=
        calculateFDValue(
          Number(txn.amount),
          txn.date,
          annualRate
        );
    }

    return totalFDValue;
  };