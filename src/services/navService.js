import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import { db } from "../firebase/firebase";

export const loadFunds = async () => {
  const response = await fetch("/funds.json");
  return await response.json();
};

const CACHE_DURATION =
  1000 * 60 * 60 * 12; // 12 Hours

export const getNav = async (schemeCode) => {

  try {

    const cacheRef = doc(
      db,
      "nav_cache",
      String(schemeCode)
    );

    const cacheSnap =
      await getDoc(cacheRef);

    if (cacheSnap.exists()) {

      const cacheData =
        cacheSnap.data();

      const age =
        Date.now() -
        cacheData.updatedAt;

      if (age < CACHE_DURATION) {

        return {
          nav: cacheData.nav
        };
      }
    }

    const response = await fetch(
      `https://api.mfapi.in/mf/${schemeCode}`
    );

    const data =
      await response.json();

    const latestNav =
      parseFloat(
        data.data[0].nav
      );

    await setDoc(
      cacheRef,
      {
        nav: latestNav,
        updatedAt: Date.now()
      }
    );

    return {
      nav: latestNav
    };

  } catch (error) {

    console.error(error);

    return {
      nav: 0
    };
  }
};