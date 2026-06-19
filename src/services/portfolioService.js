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

export const saveInvestment = async (
  investmentData
) => {

  await addDoc(
    collection(db, "transactions"),
    {
      ...investmentData,
      createdAt: serverTimestamp()
    }
  );

  await updatePortfolioSummary(
    investmentData.uid
  );
};

export const getInvestments = async (
  uid
) => {

  const q = query(
    collection(db, "transactions"),
    where("uid", "==", uid)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const getPortfolioHoldings =
  async (uid) => {

    const transactions =
      await getInvestments(uid);

    const holdings = {};

    for (const txn of transactions) {

      const key =
        txn.schemeCode;

      if (!holdings[key]) {

        holdings[key] = {
          fundName:
            txn.fundName,

          schemeCode:
            txn.schemeCode,

          category:
            txn.category,

          invested: 0,
          units: 0
        };
      }

      holdings[key].invested +=
        Number(
          txn.amount || 0
        );

      holdings[key].units +=
        Number(
          txn.units || 0
        );
    }

    const holdingArray =
      Object.values(
        holdings
      );

    return await Promise.all(

      holdingArray.map(
        async (
          holding
        ) => {

          const navData =
            await getNav(
              holding.schemeCode
            );

          const currentNav =
            Number(
              navData.nav || 0
            );

          const currentValue =
            holding.units *
            currentNav;

          const profit =
            currentValue -
            holding.invested;

          const returnPercent =
            holding.invested > 0
              ? (
                  profit /
                  holding.invested
                ) * 100
              : 0;

          return {
            ...holding,
            currentNav,
            currentValue,
            profit,
            returnPercent
          };
        }
      )
    );
  };

export const updatePortfolioSummary =
  async (uid) => {

    const holdings =
      await getPortfolioHoldings(
        uid
      );

    const totalInvested =
      holdings.reduce(
        (
          sum,
          item
        ) =>
          sum +
          item.invested,
        0
      );

    const currentValue =
      holdings.reduce(
        (
          sum,
          item
        ) =>
          sum +
          item.currentValue,
        0
      );

    const profitLoss =
      currentValue -
      totalInvested;

    const returnPercent =
      totalInvested > 0
        ? (
            profitLoss /
            totalInvested
          ) * 100
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
        updatedAt:
          Date.now()
      }
    );
  };

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
      returnPercent: 0
    };
  };