const { isWhitespace } = require('./InputStream');

let specialSymbols = {}
let Token = {}

function addToken(name, str) {
  const sym = Symbol(name);
  Token[name] = sym;
  if (str) specialSymbols[str] = name;
  return
}

let numChars = '0123456789.';

addToken("IDENT")
addToken("LPAREN", "(")
addToken("RPAREN", ")")
addToken("LBRACK", "{")
addToken("RBRACK", "}")
addToken("SEMICOLON", ";")
addToken("PLUSSIGN", "+")
addToken("COMMA", ",")
addToken("EQUALS", "=")
addToken("QUOTE", '"')
addToken("STR")
addToken("NUM")
addToken("EOF")

function readString(input) {
  let str = '';
  let char = input.next();
  while ((char = input.next()) !== '"') {
    if (char === '\\') {
      str += input.next();
    } else str += char;
  }
  return str;
}

function readNumber(input) {
  let str = '';
  while (numChars.indexOf(input.peek()) !== -1) {
    str += input.next();
  }
  return parseFloat(str)
}

function advance(input, buffer) {
  if (input.eof()) buffer.push(['', Token.EOF]);
  let char = input.peek();
  if (char === '"') {
    buffer.push([readString(input), Token.STR]);
  } else if (numChars.indexOf(char) >= 0) {
    buffer.push([readNumber(input), Token.NUM]);
  } else if (specialSymbols[char]) {
    buffer.push([input.next(), Token[specialSymbols[char]]]);
  } else if (isWhitespace(char)) {
    input.next();
    return advance();
  } else {
    let identBuf = input.next();
    while (!input.eof() 
              && !isWhitespace(input.peek())
              && !specialSymbols[input.peek()]) {
      identBuf += input.next();
    }
    buffer.push([identBuf, Token.IDENT]);
  }
}

function TokenStream(input) {
  let buffer = [];
  
  return function getToken(pos) {
    while (buffer.length <= pos) advance(input, buffer);
    return buffer[pos];
  }
}

module.exports = {
  specialSymbols, Token, TokenStream
}