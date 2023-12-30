const customCors = ({
  maxAge = 0,
  origin = "*",
  methods = "GET,POST",
  allowHeaders = "Content-Type",
  status = 204,
  withCredentials = false
}) => {

  const helper = (req, res, next) => {
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Methods", methods);
      res.setHeader("Access-Control-Allow-Headers", allowHeaders);
      res.setHeader("Access-Control-Allow-Origin", origin);
      maxAge !== 0 ? res.setHeader("Access-Control-Max-Age", maxAge) : maxAge;
      withCredentials !== false ? res.setHeader("Access-Control-Allow-Credentials", withCredentials) : withCredentials;

      return res.sendStatus(status);
    }
    else if (req.method === "POST") {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    next();
  };

  return helper;
};

module.exports = customCors;