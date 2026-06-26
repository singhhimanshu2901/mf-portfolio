import axios from "axios";

const API =
  "http://localhost:5000/api/nifty";

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