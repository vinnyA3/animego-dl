import { prompt } from "enquirer";
import { bindActionCreators } from "redux";

import { withNavigator } from "@navigation/navigator";
import { Screen } from "@navigation/types";

import { actionCreators as cliActionCreators } from "@state/cli/actions";

import locales from "./locales";

export type SelectResultsParams = {
  params: { searchResults: string[] };
};

export const createSelectResultsParams = ({
  searchResults = [],
}: {
  searchResults: string[];
}): SelectResultsParams => ({ params: { searchResults } });

const selectResultPrompt = (choices: string[]) => [
  {
    type: "autocomplete",
    choices,
    ...locales.prompt,
  },
];

const SelectResults = {
  init: function selectResultsInit(params: SelectResultsParams) {
    const _bounded = bindActionCreators(cliActionCreators, this.store.dispatch);
    const _prompt = async (choices: string[]) => {
      const selected = await prompt(selectResultPrompt(choices)).then(
        (res: { chosenTitle?: string }) => res.chosenTitle
      );

      return selected || "";
    };

    const _render = async () => {
      const selectedTitle = await _prompt(params?.params.searchResults);
      _bounded.setSelectedTitle(selectedTitle);
      console.log(selectedTitle);
    };

    _render().catch(console.error);

    return this;
  },
} as Screen;

export default withNavigator(SelectResults);
