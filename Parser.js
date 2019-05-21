function Parser(getToken, pos = 0, depth = 0) {
  let parser = {
    nextToken() {
      return getToken(pos++)
    },
    expect(f) {
      return f(parser);
    },
    canExpect(f, ) {
      let p = Parser(getToken, pos);
      try {
        p.expect(f);
        return true;
      } catch (e) {
        // console.log(e)
        return false;
      }
    }
  }

  return parser;
}

module.exports = { Parser };