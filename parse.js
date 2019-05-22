/**
 * 
 */
const reserved = ["lambda", "if", "else", "then"]
const { ParseError } = require('./Parser');
const { Token } = require('./TokenStream');
 
const token = (type, value = null) => (parser) => {
  let [tok, tokType] = parser.nextToken();

  if (tokType !== type) {
    throw new ParseError(`Expected ${type.toString()} but got ${tokType.toString()}, with value ${tok}!`);
  }

  if (value && tok !== value) {
    throw new ParseError(`Expected ${value.toString()} but got ${tok.toString()}!`);
  }

  return tok;
}

const booleanForm = ({expect, canExpect}) => {
  let val;
  if (canExpect(token(Token.IDENT, 'true'))) {
    expect(token(Token.IDENT));
    val = true;
  } else {
    expect(token(Token.IDENT, 'false'));
    val = false;
  }

  return {
    type: 'bool',
    value: val
  }
}

const conditionalForm = ({expect, canExpect}) => {
  expect(token(Token.IDENT, 'if'));
  let cond = expect(expressionForm);
  
  expect(token(Token.IDENT, 'then'));
  let then = expect(expressionForm);

  let ret = {
    type: 'if',
    cond,
    then
  };

  const elseTok = token(Token.IDENT, "else");
  if (canExpect(elseTok)) {
    expect(elseTok);
    ret.else = expect(expressionForm);
  }

  return ret;
}


const numberForm = ({expect}) => {
  return {
    type: 'number',
    value: expect(token(Token.NUM))
  }
}

const stringForm = ({expect}) => {
  return {
    type: 'string',
    value: expect(token(Token.STR))
  }
}

const identForm = ({expect}) => {
  let ident = expect(token(Token.IDENT));

  if (reserved.indexOf(ident) !== -1)
    throw new Error(`${ident} is a reserved keyword!`);
  
    return {
    type: 'ident',
    value: ident
  }
}

const lambdaForm = ({expect, canExpect}) => {
  const comma = token(Token.COMMA);

  let ident = expect(token(Token.IDENT, 'lambda'));
  expect(token(Token.RPAREN));

  let args = [];
  while (canExpect(identForm)) {
    let ident = expect(identForm);
    args.push(ident);
    if (canExpect(comma)) expect(comma);
  }
  expect(token(Token.LPAREN));
  let body = expect(expressionForm);
  return {
    type: 'lambda',
    args,
    body
  }
}

const callForm = ({expect, canExpect}) => {  
  let func = expect(identForm);
  expect(token(Token.RPAREN));

  let args = [];
  while (!canExpect(token(Token.LPAREN))) {
    args.push(expect(expressionForm));
    if (canExpect(token(Token.COMMA))) expect(token(Token.COMMA));
  }
  expect(token(Token.LPAREN));
  return {
    type: 'call',
    func,
    args
  }
}

const assignForm = ({expect}) => {
  let left = expect(token(Token.IDENT));
  expect(token(Token.OPERATOR, "="));
  let right = expect(expressionForm);

  return {
    type: 'assign',
    operator: '=',
    left,
    right
  }
}

const binaryForm = ({expect, canExpect}) => {
  let left;
  if (canExpect(numberForm)) left = expect(numberForm);
  else left = expect(identForm);
  let operator = expect(token(Token.OPERATOR));
  let right = expect(expressionForm)
  return {
    type: 'binary',
    operator,
    left,
    right
  }
}

const expressionSequence = ({expect, canExpect}) => {
  let prog = [];
  
  while (canExpect(expressionForm)) {
    prog.push(expect(expressionForm));
    expect(token(Token.SEMICOLON));
  }
  
  return prog;
}

const progForm = ({expect, canExpect}) => {
  expect(token(Token.RBRACK));
  const prog = expect(expressionSequence);
  expect(token(Token.LBRACK));

  return {
    type: 'prog',
    prog
  }
}


// to enable this syntax:
// test()(x)
// I need to extend callForm
const expressionForm = (parser) => {
  const {expect, canExpect} = parser;
  let precedenceOrder = [
    // lambdaForm, conditionalForm, progForm, callForm, assignForm, binaryForm,
    // identForm, numberForm, stringForm
    progForm, lambdaForm, 
    callForm, binaryForm, assignForm, 
    conditionalForm, numberForm, stringForm, booleanForm, identForm
  ];

  for (let form of precedenceOrder) {
    // console.log(`trying ${form.name}`);
    if (canExpect(form)) {
      // console.log(`using ${form.name}`)
      return expect(form);
    } else {
      // console.log(`not ${form.name}, because ${parser.lastError}`)
    }
  }
  // console.log(parser.lastError)
  throw new ParseError("Cannot parse expression!");
}

module.exports = {
  expressionForm, progForm, expressionSequence, 
  binaryForm, assignForm, callForm, lambdaForm, 
  identForm, stringForm, numberForm, conditionalForm
}

module.exports.parse = function({expect}) {
  return {
    type: 'prog',
    prog: expect(expressionSequence)
  }
}