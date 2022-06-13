const BaseDefault = {
  urls: {
    gogoanime: {
      root: "https://gogoanime.gg",
      encryptAjaxEndpoint: "https://gogoplay.io/encrypt-ajax.php",
      // TODO: refactor to use own extracted keys .. in the meantime, thanks @justfoolingaround!
      superSecret:
        "https://raw.githubusercontent.com/justfoolingaround/animdl-provider-benchmarks/master/api/gogoanime.json",
    },
  },
};

export default (function deriveEnvironmentConfig(/* CURRENT_ENV */) {
  return {
    ...BaseDefault,
  };
})();
