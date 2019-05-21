const token = (type, value = null) => ({nextToken}) => {
  let [tok, tokType] = nextToken();
  if (tokType !== type) {
    throw new Error(`Expected ${type} but got ${tokType}!`);
  }

  if (value && tok !== value) {
    throw new Error(`Expected ${value} but got ${tok}!`);
  }

  return tok;
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

  if (canExpect(token(Token.IDENT, 'else'))) {
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
    value: expect(Token.STR)
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

const lambdaForm = ({expect}) => {
  let ident = expect(token(Token.IDENT, 'lambda'));
  expect(Token.RPAREN);

  let args = [];
  while (canExpect(token(Token.IDENT))) {
    if (args.length > 0) expect(token(Token.COMMA));
    let ident = expect(token(Token.IDENT))
    args.push(ident);
  }
  expect(Token.LPAREN);
  let body = expect(expressionForm);
  return {
    type: 'lambda',
    args,
    body
  }
}

const callForm = ({expect, canExpect}) => {
  let func = expect(expressionForm);
  expect(token(Tokens.LPAREN));
  let args = [];
  while (canExpect(token(Token.LPAREN))) {
    if (args.length > 0) expect(token(Token.COMMA));
    args.push(expect(expressionForm));
  }
  return {
    type: 'call',
    func,
    args
  }
}

const assignForm = ({expect}) => {
  let left = expect(token(Token.IDENT));
  expect(token(Token.EQUALS));
  let right = expect(expressionForm);

  return {
    type: 'assign',
    operator: '=',
    left,
    right
  }
}

const binaryForm = ({expect}) => {
  let left = expect(token(Token.IDENT));
  let operator = expect(operator);
  let right = expect(expressionForm)
  return {
    type: 'binary',
    operator,
    left,
    right
  }
}

const progForm = ({expect, canExpect}) => {
  expect(token(Token.RBRACK));
  while (canExpect(token(Token.LBRACK))) {
    args.push(expect(expressionForm));
    expect(token(Token.SEMICOLON));
  }
  expect(token(Token.LBRACK));
}

const expressionForm = ({expectIfCan}) => {
  let precedenceOrder = [
    lambdaForm, conditionalForm, progForm, callForm, assignForm, binaryForm
  ];

  for (let form of precedenceOrder) {
    if (canExpect(form)) return expect(form);
  }
  throw new Error("Cannot parse expression!");
}