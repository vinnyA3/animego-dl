import { prompt } from "enquirer";

import { Gogoanime } from "../../../providers";

import Navigator from "../../navigator";

import { createSelectResultsParams } from "../select-result";

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
    name: "inputAnimeName",
    message: "Please type the name of your desired anime",
  },
];

class Search {
  constructor() {
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

    Navigator.navigate(
      "SelectResults",
      createSelectResultsParams({
        searchResults: results,
      })
    );
  };
}

export default Search;
