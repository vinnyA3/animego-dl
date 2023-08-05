const BaseDefault = {
  urls: {
    gogoanime: {
      root: "https://gogoanime.gg",
      encryptAjaxEndpoint: "https://gogoplay.io/encrypt-ajax.php",
    },
  },
};

export default (function deriveEnvironmentConfig(/* CURRENT_ENV */) {
  return {
    ...BaseDefault,
  };
})();
