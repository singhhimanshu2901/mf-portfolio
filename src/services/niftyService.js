import axios from "axios";

const API =
  import.meta.env.VITE_API_URL +
  "/api/nifty";

export const getNiftyData =
  async (period = "1mo") => {

    const response =
      await axios.get(API, {
        params: {
          period
        }
      });

    return response.data;

  };