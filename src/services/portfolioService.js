import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  doc,
  setDoc,
  getDoc
} from "firebase/firestore";

import { db } from "../firebase/firebase";
import { getNav } from "./navService";
import { calculateXIRR } from "../utils/xirr";

// ======================================
// Helpers
// ======================================

const round = value =>

  Number(

    Number(
      value || 0
    ).toFixed(2)

  );

const calculateInvestmentAge = date => {

  if (!date) {

    return "--";

  }

  const start =
    new Date(date);

  const today =
    new Date();

  const totalMonths =

    (

      today.getFullYear() -

      start.getFullYear()

    ) * 12 +

    (

      today.getMonth() -

      start.getMonth()

    );

  const years =
    Math.floor(
      totalMonths / 12
    );

  const months =
    totalMonths % 12;

  if (years <= 0) {

    return `${months} Months`;

  }

  return `${years} Years ${months} Months`;

};

const createHolding =
  transaction => ({

    fundName:
      transaction.fundName,

    schemeCode:
      transaction.schemeCode,

    category:
      transaction.category,

    invested: 0,

    units: 0,

    averageBuyNav: 0,

    currentNav: 0,

    navDate: null,

    currentValue: 0,

    profit: 0,

    returnPercent: 0,

    xirr: 0,

    firstInvestmentDate:
      transaction.date,

    lastInvestmentDate:
      transaction.date,

    investmentAge: "--",

    transactionCount: 0

  });

// ======================================
// Save Investment
// ======================================

export const saveInvestment =
  async investmentData => {

    await addDoc(

      collection(
        db,
        "transactions"
      ),

      {

        ...investmentData,

        amount:
          Number(
            investmentData.amount
          ),

        units:
          Number(
            investmentData.units
          ),

        createdAt:
          serverTimestamp()

      }

    );

    await updatePortfolioSummary(

      investmentData.uid

    );

};
// ======================================
// Get Investments
// ======================================

export const getInvestments =
  async uid => {

    const q =
      query(

        collection(
          db,
          "transactions"
        ),

        where(
          "uid",
          "==",
          uid
        )

      );

    const snapshot =
      await getDocs(q);

    const transactions =

      snapshot.docs.map(doc => ({

        id:
          doc.id,

        ...doc.data(),

        amount:
          round(
            doc.data().amount
          ),

        units:
          round(
            doc.data().units
          )

      }));

    transactions.sort(

      (a, b) =>

        new Date(a.date) -

        new Date(b.date)

    );

    return transactions;

};

// ======================================
// Portfolio Holdings
// ======================================

export const getPortfolioHoldings =
  async uid => {

    const transactions =
      await getInvestments(uid);

    if (

      !transactions.length

    ) {

      return [];

    }

    const holdingsMap = {};

    // ===============================
    // Merge Transactions
    // ===============================

    for (const txn of transactions) {

      const key =
        String(
          txn.schemeCode
        );

      if (

        !holdingsMap[key]

      ) {

        holdingsMap[key] =

          createHolding(
            txn
          );

      }

      const holding =
        holdingsMap[key];

      holding.transactionCount++;

      holding.invested +=
        Number(
          txn.amount
        );

      holding.units +=
        Number(
          txn.units
        );

      holding.lastInvestmentDate =
        txn.date;

      holding.averageBuyNav =

        holding.units > 0

          ? round(

              holding.invested /

              holding.units

            )

          : 0;

    }

    const holdings =
      Object.values(
        holdingsMap
      );

    // ===============================
    // Fetch NAV Parallel
    // ===============================

    const navResponses =
      await Promise.all(

        holdings.map(

          holding =>

            getNav(
              holding.schemeCode
            )

        )

      );
          // ===============================
    // Final Calculations
    // ===============================

    return holdings.map(

      (

        holding,

        index

      ) => {

        const navData =

          navResponses[index] ||

          {};

        const currentNav =
          round(

            navData.nav

          );

        const currentValue =
          round(

            holding.units *

            currentNav

          );

        const profit =
          round(

            currentValue -

            holding.invested

          );

        const returnPercent =

          holding.invested > 0

            ? round(

                (

                  profit /

                  holding.invested

                ) * 100

              )

            : 0;

        const xirr =
          calculateXIRR(

            holding.invested,

            currentValue,

            holding.firstInvestmentDate

          );

        const investmentAge =
          calculateInvestmentAge(

            holding.firstInvestmentDate

          );

        return {

          ...holding,

          invested:
            round(
              holding.invested
            ),

          units:
            round(
              holding.units
            ),

          averageBuyNav:
            round(
              holding.averageBuyNav
            ),

          currentNav,

          navDate:

            navData.date ||

            null,

          currentValue,

          profit,

          returnPercent,

          xirr,

          investmentAge,

          wealthMultiplier:

            holding.invested > 0

              ? round(

                  currentValue /

                  holding.invested

                )

              : 0

        };

      }

    );

};

// ======================================
// Get Single Holding
// ======================================

export const getHoldingBySchemeCode =
  async (

    uid,

    schemeCode

  ) => {

    const holdings =
      await getPortfolioHoldings(
        uid
      );

    return (

      holdings.find(

        item =>

          String(

            item.schemeCode

          ) ===

          String(

            schemeCode

          )

      ) ||

      null

    );

};

// ======================================
// Get Fund Transactions
// ======================================

export const getFundTransactions =
  async (

    uid,

    schemeCode

  ) => {

    const transactions =
      await getInvestments(
        uid
      );

    return transactions.filter(

      txn =>

        String(
          txn.schemeCode
        ) ===

        String(
          schemeCode
        )

    );

};
// ======================================
// Update Portfolio Summary
// ======================================

export const updatePortfolioSummary =
  async uid => {

    const holdings =
      await getPortfolioHoldings(
        uid
      );

    if (!holdings.length) {

      await setDoc(

        doc(
          db,
          "portfolio_summary",
          uid
        ),

        {

          totalInvested: 0,

          currentValue: 0,

          profitLoss: 0,

          returnPercent: 0,

          equityValue: 0,

          debtValue: 0,

          liquidValue: 0,

          equityPercent: 0,

          debtPercent: 0,

          liquidPercent: 0,

          fundCount: 0,

          updatedAt:
            Date.now()

        }

      );

      return;

    }

    const totalInvested =
      round(

        holdings.reduce(

          (sum, item) =>

            sum +

            item.invested,

          0

        )

      );

    const currentValue =
      round(

        holdings.reduce(

          (sum, item) =>

            sum +

            item.currentValue,

          0

        )

      );

    const profitLoss =
      round(

        currentValue -

        totalInvested

      );

    const returnPercent =

      totalInvested > 0

        ? round(

            (

              profitLoss /

              totalInvested

            ) * 100

          )

        : 0;

    const equityValue =
      round(

        holdings

          .filter(item =>

            item.category

              ?.toLowerCase()

              .includes("equity")

          )

          .reduce(

            (sum, item) =>

              sum +

              item.currentValue,

            0

          )

      );

    const debtValue =
      round(

        holdings

          .filter(item =>

            item.category

              ?.toLowerCase()

              .includes("debt")

          )

          .reduce(

            (sum, item) =>

              sum +

              item.currentValue,

            0

          )

      );

    const liquidValue =
      round(

        holdings

          .filter(item =>

            item.category

              ?.toLowerCase()

              .includes("liquid")

          )

          .reduce(

            (sum, item) =>

              sum +

              item.currentValue,

            0

          )

      );

    const equityPercent =

      currentValue > 0

        ? round(

            (

              equityValue /

              currentValue

            ) * 100

          )

        : 0;

    const debtPercent =

      currentValue > 0

        ? round(

            (

              debtValue /

              currentValue

            ) * 100

          )

        : 0;

    const liquidPercent =

      currentValue > 0

        ? round(

            (

              liquidValue /

              currentValue

            ) * 100

          )

        : 0;

    await setDoc(

      doc(

        db,

        "portfolio_summary",

        uid

      ),

      {

        totalInvested,

        currentValue,

        profitLoss,

        returnPercent,

        equityValue,

        debtValue,

        liquidValue,

        equityPercent,

        debtPercent,

        liquidPercent,

        fundCount:
          holdings.length,

        updatedAt:
          Date.now()

      }

    );

};

// ======================================
// Get Portfolio Summary
// ======================================

export const getPortfolioSummary =
  async uid => {

    const snapshot =
      await getDoc(

        doc(

          db,

          "portfolio_summary",

          uid

        )

      );

    if (

      snapshot.exists()

    ) {

      return snapshot.data();

    }

    return {

      totalInvested: 0,

      currentValue: 0,

      profitLoss: 0,

      returnPercent: 0,

      equityValue: 0,

      debtValue: 0,

      liquidValue: 0,

      equityPercent: 0,

      debtPercent: 0,

      liquidPercent: 0,

      fundCount: 0,

      updatedAt: 0

    };

};

// ======================================
// Portfolio Stats
// ======================================

export const getPortfolioStats =
  async uid => {

    const holdings =
      await getPortfolioHoldings(
        uid
      );

    if (

      !holdings.length

    ) {

      return {

        bestFund: null,

        worstFund: null,

        totalFunds: 0

      };

    }

    const sorted =
      [...holdings].sort(

        (a, b) =>

          b.returnPercent -

          a.returnPercent

      );

    return {

      bestFund:
        sorted[0],

      worstFund:
        sorted[
          sorted.length - 1
        ],

      totalFunds:
        holdings.length

    };

};

// ======================================
// Refresh Portfolio
// ======================================

export const refreshPortfolio =
  async uid => {

    await updatePortfolioSummary(
      uid
    );

    return await getPortfolioSummary(
      uid
    );

};

// ======================================
// Export
// ======================================

export default {

  saveInvestment,

  getInvestments,

  getPortfolioHoldings,

  getHoldingBySchemeCode,

  getFundTransactions,

  updatePortfolioSummary,

  getPortfolioSummary,

  getPortfolioStats,

  refreshPortfolio

};