import { prompt } from "enquirer";
import { bindActionCreators } from "redux";

import { store } from "src/index";

import { Gogoanime } from "@providers/index";

import Screens from "@constants/screens";

import Navigator from "@navigation/navigator";
import { cliActionCreators } from "@navigation/actions";
import { createSelectResultsParams } from "@navigation/screens/select-result";

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

class Search {
  private boundedActionCreators: any;

  constructor() {
    this.boundedActionCreators = bindActionCreators(
      cliActionCreators,
      store.dispatch
    );

    this.render();
  }

  private async prompt() {
    const { inputAnimeName }: { inputAnimeName: string } = await prompt(
      inputAnimePrompt
    );

    return inputAnimeName;
  }

  render = async () => {
    const inputAnimeName = await this.prompt();
    const results = await searchAnime(inputAnimeName);

    this.boundedActionCreators.setInputAnimeName(inputAnimeName);

    Navigator.navigate(
      Screens.SelectResults,
      createSelectResultsParams({
        searchResults: results,
      })
    );
  };
}

export default Search;
