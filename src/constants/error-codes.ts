const prefix = (code: number) => `Error (${code}): `;
const suffix =
  ' For additional information, please run the tool with the "--debug" flag';

const codes = {
  // general
  100: prefix(100) + "Oops, something went wrong" + suffix,
  // player
  201: prefix(201) + "Something went wrong with the player" + suffix,
};

export default codes;
