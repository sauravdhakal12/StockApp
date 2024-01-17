const allCompanies = require("./all");
const { cdx, rdx, bdx, ndx, mdx } = require("./algorithms");


// API class
class NepseApi {

  // Variables
  prove = {};
  open = "";
  body = {};

  // Headers for each request
  headers = {
    "Authorization": "",
    "Content-Type": "application/json",
    "Host": "nepalstock.com.np",
  };


  // Needed for id payload (body)
  dummyData = [
    147, 117, 239, 143, 157, 312, 161, 612, 512, 804,
    411, 527, 170, 511, 421, 667, 764, 621, 301, 106,
    133, 793, 411, 511, 312, 423, 344, 346, 653, 758,
    342, 222, 236, 811, 711, 611, 122, 447, 128, 199,
    183, 135, 489, 703, 800, 745, 152, 863, 134, 211,
    142, 564, 375, 793, 212, 153, 138, 153, 648, 611,
    151, 649, 318, 143, 117, 756, 119, 141, 717, 113,
    112, 146, 162, 660, 693, 261, 362, 354, 251, 641,
    157, 178, 631, 192, 734, 445, 192, 883, 187, 122,
    591, 731, 852, 384, 565, 596, 451, 772, 624, 691
  ];


  /* 
    Algorithm to generate token for 'Authorization' header.
    Request with invalid value for the header will return with status 401
  */
  generateNewToken = (e) => {
    const n1 = cdx(e.salt1, e.salt2, e.salt3, e.salt4, e.salt5);
    const n2 = rdx(e.salt1, e.salt2, e.salt4, e.salt3, e.salt5);
    const n3 = bdx(e.salt1, e.salt2, e.salt4, e.salt3, e.salt5);
    const n4 = ndx(e.salt1, e.salt2, e.salt4, e.salt3, e.salt5);
    const n5 = mdx(e.salt1, e.salt2, e.salt4, e.salt3, e.salt5);

    const authorizationKey = e.accessToken.slice(0, n1) + e.accessToken.slice(n1 + 1, n2) + e.accessToken.slice(n2 + 1, n3) + e.accessToken.slice(n3 + 1, n4) + e.accessToken.slice(n4 + 1, n5) + e.accessToken.slice(n5 + 1);
    return authorizationKey;
  };


  /* 
    Algorithm to generate new token using refresh token.
  */
  generateFromRefreshToken = (e) => {
    const n1 = cdx(e.salt2, e.salt1, e.salt3, e.salt4, e.salt5);
    const n2 = rdx(e.salt2, e.salt1, e.salt3, e.salt4, e.salt5);
    const n3 = bdx(e.salt2, e.salt1, e.salt4, e.salt3, e.salt5);
    const n4 = ndx(e.salt2, e.salt1, e.salt4, e.salt3, e.salt5);
    const n5 = mdx(e.salt2, e.salt1, e.salt4, e.salt3, e.salt5);

    const authorizationKey = e.refreshToken.slice(0, n1) + e.refreshToken.slice(n1 + 1, n2) + e.refreshToken.slice(n2 + 1, n3) + e.refreshToken.slice(n3 + 1, n4) + e.refreshToken.slice(n4 + 1, n5) + e.refreshToken.slice(n5 + 1);
    return authorizationKey;
  };


  /*
    First time (fetch JWT Token)
  */
  initialize = async () => {

    // Get JWT token + salts
    const res = await fetch("https://nepalstock.com.np/api/authenticate/prove", {

      headers: {
        "Content-Type": "application/json",
        "Host": "nepalstock.com.np",
      },
    });

    // Entire response saved as prove 
    // ** Required to generate new token using refresh token **
    this.prove = await res.json();

    // Salts and JWT used to generate auth token
    this.headers.Authorization = "Salter " + this.generateNewToken(this.prove);

    await this.generateId();
  };


  /*
    Generate ID for request.body
  */
  generateId = async () => {

    // Get market status + an 'id'
    const resId = await fetch("https://www.nepalstock.com.np/api/nots/nepse-data/market-open", {
      headers: this.headers
    });

    // Save it
    this.open = await resId.json();

    // Required for 'id' payload (body)
    const day = new Date().getDate();

    // Get id for payload (body)
    let dummyId = this.dummyData[this.open.id] + this.open.id + 2 * day;

    const body = JSON.stringify({ "id": dummyId });

    this.body = body;
  };


  /*
    Fetch new token using refresh token
  */
  refreshToken = async () => {

    // Modify refresh token
    const tmpToken = this.generateFromRefreshToken(this.prove);

    const refBody = JSON.stringify({ "refreshToken": tmpToken });

    // Fetch new token using refresh token
    const res = await fetch("https://www.nepalstock.com/api/authenticate/refresh-token", {
      method: "POST",
      headers: { ...this.headers, "Content-Length": refBody.length },
      body: refBody,
    });

    // Modify token
    this.prove = await res.json();
    this.headers.Authorization = "Salter " + this.generateNewToken(this.prove);

    await this.generateId();
  };

  /*
    Validate a symbol and return corresponding id
  */
  idFromSymbol = (symbol) => {
    const id = allCompanies[symbol];
    return id;
  };


  /*
    Get detail about each company
  */
  getCompanyInfo = async (symbol) => {

    // Validate symbol and get corresponding id
    const id = this.idFromSymbol(symbol);

    // If invalid, just return
    // TODO: better handeling
    if (!id) {
      console.log("Invalid Symbol");
      return;
    }

    // Get info about company
    const companyInfo = await fetch("https://nepalstock.com.np/api/nots/security/" + id, {
      method: "POST",
      headers: {
        ...this.headers,
        "Content-Length": this.body.length.toString(),
      },
      body: this.body, // the payload
    });

    // If status code is 401, token ans expired. Regen.
    if (companyInfo.status === 401) {
      await this.refreshToken();
      throw "Refresh Error";
    }


    const companyInfoJson = await companyInfo.json();

    return companyInfoJson;

  };
}


// USAGE: getCompanyInfo("Symbol")
module.exports = NepseApi;