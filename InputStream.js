module.exports.InputStream = class InputStream {
  constructor(src) {
    this.src = src;
    this.pos = 0;
    this.line = 0;
    this.col = 1;
  }
  peek() {
    return this.src[this.pos];
  }
  eof() {
    return !(this.pos < this.src.length);
  }
  next() {
    let char = this.src[this.pos++];
    if (char === '\n') {
      this.line++;
      this.col = 1;
    } else this.col++;
    return char;
  }
}

module.exports.isWhitespace = (char) => ` \n\r`.indexOf(char) >= 0;