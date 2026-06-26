import { getInvestments } from "./portfolioService";
import { getNavHistory } from "./navHistoryService";

export const getPortfolioHistory = async (
  uid,
  timeframe = "ALL"
) => {

  const transactions =
    await getInvestments(uid);

  if (!transactions.length)
    return [];

  const sortedTransactions =
    [...transactions].sort(
      (a, b) =>
        new Date(a.date) -
        new Date(b.date)
    );

  // -----------------------------
  // Unique Schemes
  // -----------------------------

  const schemes = [
    ...new Set(
      sortedTransactions.map(
        txn => txn.schemeCode
      )
    )
  ];

  // -----------------------------
  // Load NAV History
  // -----------------------------

  const navHistoryMap = {};

  await Promise.all(

    schemes.map(
      async schemeCode => {

        const history =
          await getNavHistory(
            schemeCode
          );

        navHistoryMap[
          schemeCode
        ] = history;

      }
    )

  );

  // -----------------------------
  // Build NAV Index
  // -----------------------------

  const navIndex = {};

  schemes.forEach(
    schemeCode => {

      navIndex[
        schemeCode
      ] = {};

      navHistoryMap[
        schemeCode
      ].forEach(item => {

        navIndex[
          schemeCode
        ][item.date] =
          Number(
            item.nav
          );

      });

    }
  );

  // -----------------------------
  // Timeline
  // -----------------------------

  const firstDate =
    new Date(
      sortedTransactions[0].date
    );

  const today =
    new Date();

  const timeline = [];

  let current =
    new Date(firstDate);

  while (
    current <= today
  ) {

    timeline.push(
      current
        .toISOString()
        .split("T")[0]
    );

    current.setDate(
      current.getDate() + 1
    );

  }

  // -----------------------------
  // Holdings State
  // -----------------------------

  const holdings = {};

  schemes.forEach(
    schemeCode => {

      holdings[
        schemeCode
      ] = {

        units: 0,
        invested: 0

      };

    }
  );

  const history = [];

    // -----------------------------
  // Transaction Pointer
  // -----------------------------

  let txnIndex = 0;

  let lastNav = {};

  schemes.forEach(
    schemeCode => {

      lastNav[
        schemeCode
      ] = 0;

    }
  );

  // -----------------------------
  // Build Daily History
  // -----------------------------

  for (const date of timeline) {

    // Add all transactions
    // happened till this date

    while (

      txnIndex <
        sortedTransactions.length &&

      sortedTransactions[
        txnIndex
      ].date <= date

    ) {

      const txn =
        sortedTransactions[
          txnIndex
        ];

      holdings[
        txn.schemeCode
      ].units +=
        Number(
          txn.units
        );

      holdings[
        txn.schemeCode
      ].invested +=
        Number(
          txn.amount
        );

      txnIndex++;

    }

    let invested = 0;

    let portfolio = 0;

    // -----------------------------
    // Calculate Current Value
    // -----------------------------

    for (const schemeCode of schemes) {

      const navToday =
        navIndex[
          schemeCode
        ][date];

      if (
        navToday != null
      ) {

        lastNav[
          schemeCode
        ] = navToday;

      }

      if (
        lastNav[
          schemeCode
        ] === 0
      ) {

        continue;

      }

      invested +=
        holdings[
          schemeCode
        ].invested;

      portfolio +=

        holdings[
          schemeCode
        ].units *

        lastNav[
          schemeCode
        ];

    }

    if (
      invested === 0
    ) {

      continue;

    }

    history.push({

      date,

      invested,

      portfolio:
        Number(
          portfolio.toFixed(
            2
          )
        ),

      profit:
        Number(
          (
            portfolio -
            invested
          ).toFixed(2)
        ),

      returnPercent:
        Number(
          (
            (
              (
                portfolio -
                invested
              ) /

              invested

            ) *

            100

          ).toFixed(2)
        )

    });

  }

    // -----------------------------
  // Timeframe Filter
  // -----------------------------

  const daysMap = {

    "1D": 1,
    "1W": 7,
    "1M": 30,
    "6M": 180,
    "1Y": 365,
    "ALL": Infinity

  };

  const limit =
    daysMap[timeframe] ??
    Infinity;

  let finalHistory =
    history;

  if (
    limit !== Infinity
  ) {

    const cutoff =
      new Date();

    cutoff.setDate(
      cutoff.getDate() -
      limit
    );

    finalHistory =
      history.filter(
        item =>
          new Date(item.date) >=
          cutoff
      );

  }

  // -----------------------------
  // Remove Duplicate Values
  // -----------------------------

  finalHistory =
    finalHistory.filter(
      (
        item,
        index
      ) => {

        if (
          index === 0
        )
          return true;

        return (

          item.portfolio !==
            finalHistory[
              index - 1
            ].portfolio ||

          item.invested !==
            finalHistory[
              index - 1
            ].invested

        );

      }
    );

  // -----------------------------
  // Last Value Sync
  // -----------------------------

  if (
    finalHistory.length >
    1
  ) {

    const last =
      finalHistory[
        finalHistory.length - 1
      ];

    last.portfolio =
      Number(
        last.portfolio.toFixed(
          2
        )
      );

    last.profit =
      Number(
        (
          last.portfolio -
          last.invested
        ).toFixed(2)
      );

    last.returnPercent =
      Number(
        (
          (
            last.profit /
            last.invested
          ) *
          100
        ).toFixed(2)
      );

  }

  return finalHistory;

};