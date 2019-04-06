const vscode = require("vscode");

const {
  isInToken,
  isAfterToken,
  isBeforeToken,
  toVSCodeRange
} = require("./tokens-utils");
const tokenizer = require("./tokenizer");

const ignoredTokens = ["(", ")", "{", "}", "[", "]", ";", ".", "=", "=>", ":"];
const ignoreCommas = true;

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("token-navigation.nextToken", function() {
      const editor = vscode.window.activeTextEditor;
      const text = editor.document.getText();
      const tokens = tokenizer(text);
      const cursorPosition = editor.selection.active;

      const nextTokenRange = nextToken(
        tokens,
        cursorPosition,
        editor.selection
      );

      if (nextTokenRange == null) {
        return;
      }

      editor.selection = new vscode.Selection(
        nextTokenRange.start.line,
        nextTokenRange.start.character,
        nextTokenRange.end.line,
        nextTokenRange.end.character
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "token-navigation.previousToken",
      function() {
        const editor = vscode.window.activeTextEditor;
        const text = editor.document.getText();
        const tokens = tokenizer(text);
        const cursorPosition = editor.selection.active;

        const previousTokenRange = previousToken(
          tokens,
          cursorPosition,
          editor.selection
        );

        if (previousToken == null) {
          return;
        }

        editor.selection = new vscode.Selection(
          previousTokenRange.start.line,
          previousTokenRange.start.character,
          previousTokenRange.end.line,
          previousTokenRange.end.character
        );
      }
    )
  );
}

function deactivate() {}

function nextToken(tokens, cursorPosition, selectedRange) {
  const { line, character } = cursorPosition;
  const isInside = isInToken({ line, character });
  const isBefore = isBeforeToken({ line, character });
  const isAfter = isAfterToken({ line, character });

  for (let i = 0; i < tokens.length - 1; i++) {
    const token = tokens[i];
    const nextToken = tokens[i + 1];

    if (isInside(token)) {
      const nextValidToken = nextNotIgnoredToken(tokens, i, selectedRange);
      if (!nextValidToken) {
        return;
      }
      return toVSCodeRange(nextValidToken.loc);
    }

    if (isAfter(token) && isBefore(nextToken)) {
      const nextValidToken = nextNotIgnoredToken(tokens, i + 1, selectedRange);
      if (!nextValidToken) {
        return;
      }
      return toVSCodeRange(nextValidToken.loc);
    }
  }
}

function previousToken(tokens, cursorPosition, selectedRange) {
  const { line, character } = cursorPosition;
  const isInside = isInToken({ line, character });
  const isBefore = isBeforeToken({ line, character });
  const isAfter = isAfterToken({ line, character });

  for (let i = 1; i < tokens.length; i++) {
    const previousToken = tokens[i - 1];
    const token = tokens[i];

    if (isInside(token)) {
      const previousValidToken = previousNotIgnoredToken(
        tokens,
        i,
        selectedRange
      );
      if (!previousValidToken) {
        return;
      }
      return toVSCodeRange(previousValidToken.loc);
    }

    if (isBefore(token) && isAfter(previousToken)) {
      const previousValidToken = previousNotIgnoredToken(
        tokens,
        i - 1,
        selectedRange
      );
      if (!previousValidToken) {
        return;
      }
      return toVSCodeRange(previousValidToken.loc);
    }
  }
}

function nextNotIgnoredToken(tokens, index, selectedRange) {
  for (let i = index; i < tokens.length; i++) {
    const token = tokens[i];
    if (shouldIgnore(token, selectedRange)) {
      continue;
    }
    return token;
  }
}

function previousNotIgnoredToken(tokens, index, selectedRange) {
  for (let i = index; i >= 0; i--) {
    const token = tokens[i];
    if (shouldIgnore(token, selectedRange)) {
      continue;
    }
    return token;
  }
}

function shouldIgnore(token, selectedRange) {
  if (!token) {
    return true;
  }
  if (ignoredTokens.indexOf(token.type.label) > -1) {
    return true;
  } else if (ignoreCommas && token.type.label === ",") {
    return true;
  }

  const vscodeRange = toVSCodeRange(token.loc);
  return selectedRange.contains(vscodeRange);
}

module.exports = {
  activate,
  deactivate
};
