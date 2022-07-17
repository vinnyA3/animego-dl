import { prompt } from "enquirer";

// import Providers from "../../../providers";
// import Navigator from "../../navigator";

export type SelectResultsParams = {
  searchResults?: string[];
};

export const createSelectResultsParams = ({
  searchResults = [],
}: {
  searchResults?: string[];
}): SelectResultsParams => ({ searchResults });

class SelectResults {
  private params?: SelectResultsParams;

  constructor(params?: SelectResultsParams) {
    this.params = params;
    this.render();
  }

  private async prompt(choices?: string[]) {
    const selected = await prompt([
      {
        type: "autocomplete",
        name: "chosenTitle",
        message: "Select a title to stream",
        initial: 1,
        choices,
      },
    ]).then((res: { chosenTitle?: string }) => res.chosenTitle || "");

    return selected;
  }

  render = async () => {
    const selectedTitle = await this.prompt(this.params?.searchResults);
    console.log(selectedTitle);
  };
}

export default SelectResults;
