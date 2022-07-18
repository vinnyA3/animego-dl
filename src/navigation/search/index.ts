import { prompt } from "enquirer";
import { bindActionCreators } from "redux";

import Screens from "@constants/screens";

import { Gogoanime } from "@providers/index";

import { actionCreators as cliActionCreators } from "@state/cli/actions";

import Navigator from "@navigation/navigator";
import ScreenNavigator from "@navigation/screen";
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

class Search extends ScreenNavigator {
  private boundedActionCreators: any;

  constructor() {
    super();

    this.boundedActionCreators = bindActionCreators(
      cliActionCreators,
      this.store.dispatch
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
