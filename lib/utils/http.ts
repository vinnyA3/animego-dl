import * as https from "https";
import * as http from "http";

interface ResponseHeadersWithLocation extends http.IncomingHttpHeaders {
  location: string;
}

type Protocols = "http" | "https";
type ClientType = typeof http | typeof https;
type EmptyOptions = Record<string, unknown>;

const Clients: { [k in Protocols]: ClientType } = {
  http,
  https,
};

const RedirectCodesMap: { [k in string]: number } = {
  "301": 301,
  "302": 302,
};

const noop = () => {};

const chooseClient = (url: string): ClientType => {
  const reProtocolMatch = /(https?):\/\//gi;
  const matchResult = url.match(reProtocolMatch) || [];
  let protocolScheme: Protocols = "https";

  if (matchResult.length) {
    protocolScheme = (matchResult[0].split(":")[0] ||
      protocolScheme) as Protocols;
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
  options: http.RequestOptions | EmptyOptions
) => {
  const client = chooseClient(url) as unknown as ClientType;

  client
    .get(url, options, (res) => {
      const redirectCode =
        res.statusCode != null && RedirectCodesMap[res.statusCode];

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
  options: http.RequestOptions | EmptyOptions
) => {
  const client = chooseClient(url) as unknown as ClientType;

  client
    .get(url, options, (res) => {
      const redirectCode =
        res.statusCode != null && RedirectCodesMap[res.statusCode];

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
