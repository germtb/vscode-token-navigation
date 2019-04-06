module.exports = text => {
  const tokens = [];
  let match;
  const lines = text.split("\n");
  lines.forEach((line, lineNumber) => {
    const tokenRegex = /(("|'|`)([^"'`])*\2)|([^\s,\[\]\(\)\:{}=\.;]+|,|\[|\]|\(|\)|\:|{|}|=\>|=|\.|;)/g;
    while ((match = tokenRegex.exec(line))) {
      if (!match) {
        break;
      }
      tokens.push({
        type: {
          label: match[0]
        },
        loc: {
          start: {
            line: lineNumber,
            character: match.index
          },
          end: {
            line: lineNumber,
            character: match.index + match[0].length
          }
        }
      });
    }
  });

  return tokens;
};
