const https = require("https");
const http = require("http");

const REDIRECT_STATUS_CODES = Object.freeze({
  301: 301,
  302: 302,
});

const noop = () => {};

const chooseClient = (url) => {
  const reProtocolMatch = /(https?):\/\//gi;
  const protocolScheme = url.match(reProtocolMatch)[0].split(":")[0];
  return protocolScheme === "http" ? http : https;
};

const getOriginHeadersWithLocation = (url, resolve, reject, options) => {
  const client = chooseClient(url);

  client
    .get(url, options, (res) => {
      if (REDIRECT_STATUS_CODES[res.statusCode]) {
        return getOriginHeadersWithLocation(
          res.headers.location,
          resolve,
          reject,
          options
        );
      }

      ["data", "end"].forEach((event) => res.off(event, noop));
      resolve({ ...res.headers, location: url });
    })
    .on("error", reject);
};

const get = (url, resolve, reject, options) => {
  const client = chooseClient(url);

  client
    .get(url, options, (res) => {
      if (REDIRECT_STATUS_CODES[res.statusCode]) {
        return get(res.headers.location, resolve, reject, options);
      }

      let data = "";

      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    })
    .on("error", reject);
};

module.exports = {
  getOriginHeadersWithLocation: function getOrigin(url, options = {}) {
    return new Promise((resolve, reject) =>
      getOriginHeadersWithLocation(url, resolve, reject, options)
    );
  },
  httpGet: function httpGet(url, options = {}) {
    return new Promise((resolve, reject) => get(url, resolve, reject, options));
  },
};
