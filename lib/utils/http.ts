import * as https from "https";
import * as http from "http";

interface ResponseHeadersWithLocation extends http.IncomingHttpHeaders {
  location: string;
}

type ClientProtocols = "http" | "https";
type ClientTypeOf = typeof http | typeof https;

const Clients: { [k in ClientProtocols]: ClientTypeOf } = {
  http,
  https,
};

const noop = () => {};

const chooseClient = (url: string): ClientTypeOf => {
  const reProtocolMatch = /(https?):\/\//gi;
  const matchResult = url.match(reProtocolMatch) || [];
  let protocolScheme: ClientProtocols = "https";

  if (matchResult.length) {
    protocolScheme = (matchResult[0].split(":")[0] ||
      protocolScheme) as ClientProtocols;
  }

  return Clients[protocolScheme];
};

const getOriginHeadersWithLocation = (
  url: string,
  resolve: (
    value:
      | ResponseHeadersWithLocation
      | PromiseLike<ResponseHeadersWithLocation>
  ) => void,
  reject: (reason?: string | undefined) => void,
  options: http.RequestOptions | {}
) => {
  const client = chooseClient(url) as unknown as typeof http;

  client
    .get(url, options, (res) => {
      const redirectCode =
        res.statusCode != null &&
        (res.statusCode === 301 || res.statusCode === 302);

      if (redirectCode) {
        return getOriginHeadersWithLocation(
          res.headers.location || "",
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

const get = (
  url: string,
  resolve: (value: string | PromiseLike<string>) => void,
  reject: (reason?: string | undefined) => void,
  options: http.RequestOptions | {}
) => {
  const client = chooseClient(url) as unknown as typeof http;

  client
    .get(url, options, (res) => {
      const redirectCode =
        res.statusCode != null &&
        (res.statusCode === 301 || res.statusCode === 302);

      if (redirectCode) {
        return get(res.headers.location || "", resolve, reject, options);
      }

      let data = "";

      res.on("data", (chunk: BufferSource) => (data += chunk));
      res.on("end", () => resolve(data));
    })
    .on("error", reject);
};

export default {
  getOriginHeadersWithLocation: function getOrigin(url: string, options = {}) {
    return new Promise<ResponseHeadersWithLocation>((resolve, reject) =>
      getOriginHeadersWithLocation(url, resolve, reject, options)
    );
  },
  httpGet: function httpGet(url: string, options = {}) {
    return new Promise<string>((resolve, reject) =>
      get(url, resolve, reject, options)
    );
  },
};
