import { Token, TokenStream } from './TokenStream';

let reserved = ["lambda", "if", "else", "then"]

function makeIdent(ident) {
  return {
    type: 'ident',
    name: ident
  }
}

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
  }

  expectPeek(...types, i = 0) {
    const [tok, tokType] = this.tokens.peek(i);
    if (!(tokType in types))
      throw new Error(`expected one of ${types.toString()} but got ${tokType.toString()}`);
    else return [tok, tokType];
  }

  expect(...types) {
    const [tok, tokType] = this.tokens.nextToken();
    if (!(tokType in types))
      throw new Error(`expected one of ${types.toString()} but got ${tokType.toString()}`);
    else return [tok, tokType];
  }

  getNumber() {
    let [num,] = this.expect(Token.NUM);
    return {
      type: 'number',
      value: num
    }
  }

  getString() {
    let [str,] = this.expect(Token.STR);
    return {
      type: 'string',
      value: str
    }
  }

  getIdent() {
    let [ident,] = this.expect(Token.IDENT);
    if (reserved.indexOf(ident) !== -1)
      throw new Error(`${ident} is a reserved keyword!`);
    return {
      type: 'ident',
      value: ident
    }
  }

  getLambda() {
    let [ident,] = this.expect(Token.IDENT);
    if (ident !== 'lambda') 
      throw new Error(`Excepted keyword 'lambda', got ${ident}`);
    this.expect(Token.RPAREN);
    let args = [];
    while (this.tokens.peek()[1] === Token.IDENT) {
      if (args.length > 0) this.expect(Token.COMMA);
      let [ident,] = this.tokens.nextToken();
      args.push(ident);
    }
    this.expect(Token.LPAREN);
    let body = this.getExpression();
    return {
      type: 'lambda',
      args,
      body
    }
  }

  getCall() {
    let func = this.getExpression();
    this.expect(Tokens.LPAREN);
    let args = [];
    while (this.tokens.peek()[1] !== Token.LPAREN) {
      if (args.length > 0) this.expect(Token.COMMA);
      args.push(this.getExpression());
    }
    return {
      type: 'call',
      func,
      args
    }
  }

  getConditional() {
    let [ifKeyword,] = this.expect(Token.IDENT);
    if (ifKeyword.toLowerCase() !== 'if')
      throw new Error('expected keyword "if"');
    
    let cond = this.getExpression();
    let [thenKeyword,] = this.expect(Token.IDENT);
    if (thenKeyword.toLowerCase() !== 'then')
      throw new Error('expected keyword "then"');

    let then = this.getExpression();

    let ret = {
      type: 'if',
      cond,
      then
    };

    let [elseKeyword,elseType] = this.tokens.peek();
    if (elseType === Token.IDENT && elseKeyword.toLowerCase() === 'else') {
      this.tokens.next();
      ret.else = this.getExpression();
    }

    return ret;
  }

  getAssign() {
    let left = this.getIdent();
    this.expect(Token.EQUALS);
    let right = this.getExpression();

    return {
      type: 'assign',
      operator: '=',
      left,
      right
    }
  }

  getBinary() {
    let left = this.getIdent();
    let [operator,] = this.tokens.next();
    let right = this.getExpression();
    return {
      type: 'binary',
      operator,
      left,
      right
    }
  }

  getProg() {
    this.expect(Token.RBRACK);
    while (this.tokens.peek()[1] !== Token.LBRACK) {
      args.push(this.getExpression());
      this.expect(Token.SEMICOLON);
    }
    this.expect(Token.LBRACK)
  }

  getExpression() {
    let [ident,identType] = this.expect(Token.IDENT);
    let [next,type] = this.tokens.peek(1);
    if (ident === "if") return this.getIf();
    if (ident === "lambda") return this.getLambda();

    if (type === Token.RPAREN) {
      return this.getCall();
    } else if (next in '+-/*=') {
      return this.getBinary();
    }
  }
}