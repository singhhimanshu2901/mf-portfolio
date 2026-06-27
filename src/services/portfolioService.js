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

// =======================================
// Save Investment
// =======================================

export const saveInvestment =
  async (investmentData) => {

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

// =======================================
// Get Investments
// =======================================

export const getInvestments =
  async (uid) => {

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
          Number(
            doc.data().amount || 0
          ),

        units:
          Number(
            doc.data().units || 0
          )

      }));

    transactions.sort(

      (a, b) =>

        new Date(a.date) -
        new Date(b.date)

    );

    return transactions;

  };

// =======================================
// Helpers
// =======================================

const round = value =>

  Number(

    Number(value || 0)

      .toFixed(2)

  );

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

    totalPurchaseAmount: 0,

    totalPurchaseUnits: 0,

    averageBuyNav: 0,

    currentNav: 0,

    navDate: null,

    currentValue: 0,

    profit: 0,

    returnPercent: 0,

    absoluteReturn: 0,

    transactionCount: 0,

    firstInvestmentDate:
      transaction.date,

    lastInvestmentDate:
      transaction.date

  });

const updateHolding =
  (holding, transaction) => {

    const amount =
      Number(
        transaction.amount || 0
      );

    const units =
      Number(
        transaction.units || 0
      );

    holding.transactionCount++;

    holding.invested +=
      amount;

    holding.units +=
      units;

    holding.totalPurchaseAmount +=
      amount;

    holding.totalPurchaseUnits +=
      units;

    holding.lastInvestmentDate =
      transaction.date;

    return holding;

  };
  // =======================================
// Portfolio Holdings Engine
// =======================================

export const getPortfolioHoldings =
  async (uid) => {

    const transactions =
      await getInvestments(uid);

    if (!transactions.length) {

      return [];

    }

    const holdingsMap =
      {};

    // ==========================
    // Merge Transactions
    // ==========================

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

      updateHolding(

        holdingsMap[key],

        txn

      );

    }

    const holdings =
      Object.values(
        holdingsMap
      );

    // ==========================
    // Fetch NAV Parallel
    // ==========================

    const navResponses =
      await Promise.all(

        holdings.map(

          holding =>

            getNav(

              holding.schemeCode

            )

        )

      );

    // ==========================
    // Final Calculation
    // ==========================

    return holdings.map(

      (
        holding,
        index
      ) => {

        const navData =

          navResponses[
            index
          ] || {};

        const currentNav =
          round(

            navData.nav

          );

        const currentValue =
          round(

            holding.units *

            currentNav

          );

        const averageBuyNav =

          holding.totalPurchaseUnits >

          0

            ? round(

                holding.totalPurchaseAmount /

                holding.totalPurchaseUnits

              )

            : 0;

        const profit =
          round(

            currentValue -

            holding.invested

          );

        const returnPercent =

          holding.invested >

          0

            ? round(

                (
                  profit /

                  holding.invested
                ) * 100

              )

            : 0;

        const absoluteReturn =

          round(
            profit
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

          averageBuyNav,

          currentNav,

          navDate:

            navData.date ||

            null,

          currentValue,

          profit,

          absoluteReturn,

          returnPercent

        };

      }

    );

  };
  // =======================================
// Update Portfolio Summary
// =======================================

export const updatePortfolioSummary =
  async (uid) => {

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

    // ==========================
    // Totals
    // ==========================

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

    // ==========================
    // Allocation
    // ==========================

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

    // ==========================
    // Save Summary
    // ==========================

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
  // =======================================
// Get Portfolio Summary
// =======================================

export const getPortfolioSummary =
  async (uid) => {

    const summaryRef =
      doc(
        db,
        "portfolio_summary",
        uid
      );

    const snapshot =
      await getDoc(
        summaryRef
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

// =======================================
// Get Single Holding
// =======================================

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

      ) || null

    );

  };

// =======================================
// Get Transactions By Scheme
// =======================================

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

// =======================================
// Portfolio Statistics
// =======================================

export const getPortfolioStats =
  async (uid) => {

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
  // =======================================
// Refresh Portfolio
// =======================================

export const refreshPortfolio =
  async (uid) => {

    await updatePortfolioSummary(
      uid
    );

    return await getPortfolioSummary(
      uid
    );

  };

// =======================================
// Utility Functions
// =======================================

export const formatHolding =
  holding => ({

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

    currentNav:
      round(
        holding.currentNav
      ),

    currentValue:
      round(
        holding.currentValue
      ),

    profit:
      round(
        holding.profit
      ),

    absoluteReturn:
      round(
        holding.absoluteReturn
      ),

    returnPercent:
      round(
        holding.returnPercent
      )

  });

// =======================================
// Category Summary
// =======================================

export const getCategorySummary =
  async (uid) => {

    const holdings =
      await getPortfolioHoldings(
        uid
      );

    return {

      equity:

        holdings.filter(item =>

          item.category

            ?.toLowerCase()

            .includes("equity")

        ),

      debt:

        holdings.filter(item =>

          item.category

            ?.toLowerCase()

            .includes("debt")

        ),

      liquid:

        holdings.filter(item =>

          item.category

            ?.toLowerCase()

            .includes("liquid")

        )

    };

  };

// =======================================
// Export
// =======================================

export default {

  saveInvestment,

  getInvestments,

  getPortfolioHoldings,

  updatePortfolioSummary,

  getPortfolioSummary,

  getHoldingBySchemeCode,

  getFundTransactions,

  getPortfolioStats,

  getCategorySummary,

  refreshPortfolio

};