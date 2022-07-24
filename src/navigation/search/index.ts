import { prompt as enquirerPrompt } from "enquirer";
import { bindActionCreators } from "redux";

import Screens from "@constants/screens";

import { Gogoanime } from "@providers/index";

import { actionCreators as cliActionCreators } from "@state/cli/actions";

import { withNavigator, NavigatorT } from "@navigation/navigator";
import { createSelectResultsParams } from "@navigation/select-result";

import locales from "./locales";

export type SearchNavigationParams = {
  shouldDownload?: boolean;
};

export const createSearchNavigationParams = ({
  shouldDownload = false,
}: {
  shouldDownload?: boolean;
}): SearchNavigationParams => ({ shouldDownload });

const {
  processing: { searchAnime },
} = Gogoanime;

const inputAnimePrompt = [
  {
    type: "input",
    ...locales.prompt,
  },
];

interface SearchT {
  init: () => this;
}

type SearchExtended = SearchT & NavigatorT;

const Search: SearchExtended = {
  init: function searchInit() {
    if (!this.store) {
      throw new Error(
        "[Search] store is undefined.  Did you initialize the Navigator?"
      );
    }

    const _bounded = bindActionCreators(cliActionCreators, this.store.dispatch);

    const _prompt = async () => {
      const { inputAnimeName }: { inputAnimeName: string } =
        await enquirerPrompt(inputAnimePrompt);

      return inputAnimeName;
    };

    const _render = async () => {
      const inputAnimeName = await _prompt();
      const results = await searchAnime(inputAnimeName);

      _bounded.setInputAnimeName(inputAnimeName);

      if (this.navigate) {
        this.navigate(
          Screens.SelectResults,
          createSelectResultsParams({
            searchResults: results,
          })
        );
      }
    };

    _render().catch(console.error);

    return this;
  },
};

export default withNavigator(Search);
