const baseURL = "https://platzi.com/";
const axios = require('axios')

class FetchService {
  constructor() {
    this.baseURL = baseURL;
  }

  async GetData() {
    try {
      const response = await axios.get(this.baseURL);
      return response;
    } catch (error) {
      throw new Error(error);
    }
  }
}

module.exports = new FetchService();
