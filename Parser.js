class ParseError extends Error {
  constructor(...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ParseError);
    }

    this.name = 'ParseError';
    // Custom debugging information
    // TODO: Put line and column number here
  }
}

function Parser(tokens, pos = 0, depth = 0) {
  let parser = {
    nextToken() {
      return tokens.getToken(pos++)
    },
    lastError: null,
    expect(f) {
      return f(parser);
    },
    canExpect(f) {
      let p = Parser(tokens, pos);
      try {
        p.expect(f);
        return true;
      } catch (e) {
        parser.lastError = e;
        return false;
      }
    }
  }

  return parser;
}

module.exports = { Parser, ParseError };