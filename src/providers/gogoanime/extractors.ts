import { createCipheriv, createDecipheriv } from "crypto";
import cheerio from "cheerio";

import { USER_AGENT } from "@constants/headers";
import ENV_CONFIG from "@constants/environment";
import utils from "@utils/index";

const {
  general: { safeJSONParse },
  http: { httpGet },
} = utils;

interface CryptInput {
  source: string;
  key: string;
  iv: string;
}

interface RemoteSecrets {
  key: string;
  second_key: string;
  iv: string;
}

const Constants = {
  algorithm: "aes-256-cbc",
};

export const aesEncrypt = ({ source, key, iv }: CryptInput) => {
  const cipher = createCipheriv(Constants.algorithm, key, iv);
  let encryptedKey = "";

  encryptedKey += cipher.update(source, "binary");
  encryptedKey += cipher.final("base64");

  return encryptedKey;
};

export const aesDecrypt = ({ source, key, iv }: CryptInput) => {
  const decipher = createDecipheriv(Constants.algorithm, key, iv);
  let decryptedToken = "";
  // @ts-ignore
  decryptedToken += decipher.update(source, "base64url", "utf-8");
  decryptedToken += decipher.final();

  return decryptedToken;
};

const extractAndDecryptSources = async (url: URL | null) => {
  if (!url) {
    return null;
  }

  const serverPageResponse = await httpGet(url.toString(), {
    headers: { "User-Agent": USER_AGENT },
  });

  const embedId = url.searchParams.get("id");
  const $ = cheerio.load(serverPageResponse);
  const encryptedSource = $("script[data-name='episode']").data().value;
  const parsedSecretResult = safeJSONParse(
    await httpGet(ENV_CONFIG.urls.gogoanime.superSecret)
  );

  if (parsedSecretResult) {
    const {
      key,
      second_key: secondKey,
      iv,
    } = parsedSecretResult as unknown as RemoteSecrets;

    const encId = aesEncrypt({ source: embedId as string, key, iv });
    const decSource = aesDecrypt({
      source: encryptedSource as string,
      key,
      iv,
    });

    const gogoAjax = `${url.protocol}//${url.hostname}/encrypt-ajax.php?id=${encId}&alias=${embedId}&token=${decSource}`;

    const parsedEncryptedSources =
      safeJSONParse(
        await httpGet(gogoAjax, {
          headers: {
            "User-Agent": USER_AGENT,
            "X-Requested-With": "XMLHttpRequest",
          },
        })
      )?.data || {};

    return aesDecrypt({
      source: parsedEncryptedSources as string,
      key: secondKey,
      iv,
    });
  }
};

export default {
  extractAndDecryptSources,
};
