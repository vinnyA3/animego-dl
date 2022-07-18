import { prompt } from "enquirer";
import { bindActionCreators } from "redux";

import ScreenNavigator from "@navigation/screen";
import { actionCreators as cliActionCreators } from "@state/cli/actions";

import locales from "./locales";

export type SelectResultsParams = {
  searchResults: string[];
};

export const createSelectResultsParams = ({
  searchResults = [],
}: {
  searchResults: string[];
}): SelectResultsParams => ({ searchResults });

const selectResultPrompt = (choices: string[]) => [
  {
    type: "autocomplete",
    choices,
    ...locales.prompt,
  },
];

class SelectResults extends ScreenNavigator {
  private params: SelectResultsParams = { searchResults: [] };
  private boundedActionCreators: any;

  constructor(params: SelectResultsParams) {
    super();

    this.params = params;
    this.boundedActionCreators = bindActionCreators(
      cliActionCreators,
      this.store.dispatch
    );

    this.render();
  }

  private async prompt(choices: string[]) {
    const selected = await prompt(selectResultPrompt(choices)).then(
      (res: { chosenTitle?: string }) => res.chosenTitle
    );

    return selected || "";
  }

  render = async () => {
    const selectedTitle = await this.prompt(this.params.searchResults);
    this.boundedActionCreators.setSelectedTitle(selectedTitle);
    console.log(selectedTitle);
  };
}

export default SelectResults;
