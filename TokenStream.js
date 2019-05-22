const { isWhitespace } = require('./InputStream');


let specialSymbols = {}
let Token = {}
let operators = {};

function addToken(name, str) {
  const sym = Symbol(name);
  Token[name] = sym;
  if (str) specialSymbols[str] = name;
  return sym;
}

addToken("OPERATOR")
function addOperators(...ops) {
  ops.forEach(op => {
    operators[op] = true;
    specialSymbols[op] = Token.OPERATOR
  });
}

addOperators("+", "-", "*", "/", "=")

let numChars = '0123456789.';

addToken("IDENT")
addToken("RPAREN", "(")
addToken("LPAREN", ")")
addToken("RBRACK", "{")
addToken("LBRACK", "}")
addToken("SEMICOLON", ";")
addToken("COMMA", ",")
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

// add line number knowledge here
function advance(input, buffer) {
  if (input.eof()) buffer.push(['', Token.EOF]);
  let char = input.peek();
  if (char === '"') {
    buffer.push([readString(input), Token.STR]);
  } else if (numChars.indexOf(char) >= 0) {
    buffer.push([readNumber(input), Token.NUM]);
  } else if(operators[char]) {
    buffer.push([input.next(), Token.OPERATOR]);
  } else if (specialSymbols[char]) {
    buffer.push([input.next(), Token[specialSymbols[char]]]);
  } else if (isWhitespace(char)) {
    input.next();
    return advance(input, buffer);
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
  
  return {
    getToken(pos) {
      while (buffer.length <= pos && !input.eof()) advance(input, buffer);
      if (buffer.length <= pos) return ['', Token.EOF];
      else return buffer[pos];
    }
  }
}

module.exports = {
  specialSymbols, Token, TokenStream
}