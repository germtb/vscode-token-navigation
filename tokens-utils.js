const { Range, Position } = require("vscode");

const isInToken = ({ line, character }) => token =>
  token.loc.start.line <= line &&
  token.loc.start.character <= character &&
  token.loc.end.line >= line &&
  token.loc.end.character >= character;

const isAfterToken = ({ line, character }) => token =>
  token.loc.end.line < line ||
  (token.loc.end.line === line && token.loc.end.character < character);

const isBeforeToken = ({ line, character }) => token =>
  token.loc.start.line > line ||
  (token.loc.start.line === line && token.loc.start.character > character);

const toBabelPoint = atomPoint => {
  return {
    line: atomPoint.row + 1,
    character: atomPoint.character
  };
};

const toVSCodeRange = ({ start, end }) => {
  return new Range(
    new Position(start.line, start.character),
    new Position(end.line, end.character)
  );
};

module.exports = {
  isInToken,
  isAfterToken,
  isBeforeToken,
  toBabelPoint,
  toVSCodeRange
};
