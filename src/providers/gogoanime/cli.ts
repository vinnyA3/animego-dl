export enum ResultAction {
  Download = "DOWNLOAD",
  Stream = "STREAM",
}

// enquirer cli prompts
export const inputAnimePrompt = [
  {
    type: "input",
    name: "inputAnimeName",
    message: "Please type the name of your desired anime",
  },
];

export const trySearchAgainPrompt = {
  type: "confirm",
  name: "shouldSearchAgain",
  message: "Oo nyo, could not find your anime! Would you like to try again?",
};

export const selectResultPrompt = (
  choices: string[],
  action: string = ResultAction.Stream
) => [
  {
    type: "autocomplete",
    name: "chosenTitle",
    message: `Select a title to ${action?.toLowerCase()}`,
    initial: 1,
    choices,
  },
];

export const selectEpisodeFromRangePrompt = [
  {
    type: "numeral",
    name: "selectedEpisode",
    message: "Please select an episode number from any range",
  },
];

export const selectRangePrompt = (choices: string[]) => [
  {
    type: "select",
    name: "selectedEpisode",
    message: "Select a title to download or stream",
    initial: 0,
    choices,
  },
];
