const customCors = ({
  maxAge = 0,
  origin = "*",
  methods = "GET,POST",
  allowHeaders = [],
  status = 204,
  withCredentials = false
}) => {

  const helper = (req, res, next) => {

    // TODO: Group same setHeaders outside any block 

    // Preflight request
    if (req.method === "OPTIONS") {
      const reqHeaders = req.headers;

      // Allow all headers
      for (const [key, value] of Object.entries(reqHeaders)) {
        if (key.toUpperCase() === "ACCESS-CONTROL-REQUEST-HEADERS") {
          allowHeaders.push(value);
        }
      }

      res.setHeader("Access-Control-Allow-Methods", methods);
      res.setHeader("Access-Control-Allow-Headers", allowHeaders.toString());
      res.setHeader("Access-Control-Allow-Origin", origin);

      maxAge !== 0 ? res.setHeader("Access-Control-Max-Age", maxAge) : maxAge;
      withCredentials ? res.setHeader("Access-Control-Allow-Credentials", withCredentials) : withCredentials;

      return res.sendStatus(status);
    }

    // Maybe just use else
    else if (req.method === "POST" || req.method === "GET") {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    next();
  };

  return helper;
};

module.exports = customCors;