import { prompt } from "enquirer";

// import Providers from "../../../providers";
// import Navigator from "../../navigator";

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
    name: "chosenTitle",
    message: "Select a title to Stream",
    initial: 1,
    choices,
  },
];

class SelectResults {
  private params: SelectResultsParams = { searchResults: [] };

  constructor(params: SelectResultsParams) {
    this.params = params;
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
    console.log(selectedTitle);
  };
}

export default SelectResults;
