const EOF = Symbol();

function stream(advance) {
  let current = null
  const peek = () => current = advance();
  const next = () => {
    if (current === null) return advance();
    else return current;
  }
  return { peek, next, eof: () => !!peek() }
}

const PUNC      = Symbol.for("PUNC");
const IDENT     = Symbol.for("IDENT");
const OPERATOR  = Symbol.for("OPERATOR");
const STR       = Symbol.for("STR");
const KEYWORD   = Symbol.for("KEYWORD");
const BOOL      = Symbol.for("BOOL");

const makeToken = (value, type) => ({value, type});

function charStream(s, pos = 0) {
  let current = null
  const eof =  () => pos >= s.length
  const peek = () => {
    return s[pos] || EOF;
  }
  const next = () => {
    return s[pos++] || EOF;
  }
  return { peek, next, eof }
}
const isWhitespace  = (str) => " \n\r".indexOf(str) >= 0;
const isPunc        = (str) => `</>="`.indexOf(str)  >= 0
const isOperator    = (str) => `=`.indexOf(str)     >= 0;
const isIdentStart  = (str) => /[\$a-z_]/i.test(str);
const isIdent       = (str) => isIdentStart(str) || /[0-9\-]/i.test(str);

function readString(s) {
  let str = '';
  let char;
  while (!s.eof() && s.peek() !== '"') {
    char = s.next();
    str += char;
    if (char === '\\') {
      str += s.next();
    }
  }
  if (s.eof()) throw new Error(`Failed to read string (unbalanced quotes)`);
  s.next();
  return str;
}

function tokenStream(s) {
  let eof = false;
  let current = null;
  function next() {
    if (current) {
      let x = current;
      current = null;
      return x;
    }
    let char = s.peek();
    if (char === EOF) { eof = true; return makeToken(null, EOF); }
    while (!s.eof() && isWhitespace(char)) {
      s.next();
      char = s.peek();
    }

    if (char === '"') { s.next(); return makeToken(readString(s), STR); }
    else if (isPunc(char)) { 
      s.next(); 
      if (char === '/' && /[<>]/.test(s.peek())) char += s.next();
      if (s.peek() === '/' && /[<>]/.test(char)) char += s.next();
      return makeToken(char, PUNC) 
    } 
    // else if (isOperator(char)) { s.next(); return makeToken(char, OPEARTOR) }
    else if (isIdentStart(char)) {
      let ident = "";
      // read keyword or ident
      while (!s.eof() && isIdent(s.peek())) {
        ident += s.next();
      }
      if (ident === "true") return makeToken(true, BOOL);
      else if (ident === "false") return makeToken(false, BOOL);
      else return makeToken(ident, IDENT);
    } else return makeToken(null, EOF);
  }

  function peek() {
    if (!current) current = next();
    return current;
  }

  return { next, peek, eof: () => eof }
}

function parse(s) {
  let { type, value } = s.next();
  if (type === PUNC && value === "<") {
    return parseTag(s);
  } else {
    throw new Error("XML only no strings");
  }
}

function parseTag(s) {
  if (s.peek().type !== IDENT) throw new Error(`${s.peek().value} is not a valid identifier`);

  let ident = s.next().value;
  let args = {};
  while (s.peek().type !== PUNC) {
    let key = s.next().value;
    let value = true;
    if (s.peek() && s.peek().value === '=') {
      s.next()
      value = s.next().value; 
    }
    args[key] = value;
  }
  let children = [];
  if (s.peek().value === '/>') {
    s.next();
  } else {
    s.next();
    while (s.peek().value !== '</')  {
      children.push(parse(s));
    }
    s.next();
    let { name, type } = s.next();
    if (name !== ident && type !== IDENT) throw new Error();
    s.next();
  } 
  return {
    type: 'tag',
    name: ident,
    args,
    children
  }

}

let s = tokenStream(
          charStream(
            require('fs').readFileSync('./test.html').toString()));
let char;
// while (!s.eof()) console.log(s.next())
let tree = parse(s);

const entry = Symbol();
function compile(tree) {
  let ids = 1;
  function rewriteBlocks(tree) {
    let $args = {}
    if(tree.args) {
      let keys = Object.keys(tree.args)
      for (let key of keys) {
        if (key.startsWith("$")) {
          $args[key.slice(1)] = tree.args[key];
          delete tree.args[key];
        }
      }
    }
    tree.children = tree.children.map(child => rewriteBlocks(child));
    return {
      type: 'tag',
      name: 'block',
      args: $args,
      children: [tree]
    }
  }

  function blockFunction(tree) {
    let children = '[]';
    if (tree.children) {
      children = tree.children.reduce((prev, x) => prev + `${js(x)}, `, '[').slice(0,-2) + ']';
    }
    
    return `registerBlock(${tree.id}, function (props) {
      let children = ${children};
      return children;
    });`
  }

  function js(tree) {
    if (tree.type === 'ref') {
      return `blocks[${tree.id}](props)`;
    } else {
      let children = [];
      if (tree.children) children = tree.children.map(x => js(x));
      return `createElement(${tree.name}, ${JSON.stringify(tree.args)}, [
        ${JSON.stringify(children)}
      ])`
    }
  }

  function hoistBlocks(blocks, tree) {
    if (tree.type === 'tag' && tree.name === 'block') {
      tree.id = ids++;
      blocks[tree.id] = tree;
    }

    if (tree.children) {
      let newChildren = [];
      for (let i = 0; i < tree.children.length; i++) {
        hoistBlocks(blocks, tree.children[i]);

        if (tree.children[i].name === 'block') {
          newChildren.push({ type: 'ref', id: tree.children[i].id });
        } else newChildren.push(tree.children[i]);
      }
      tree.children = newChildren;
    }
  }
  rewriteBlocks(tree);
  let blocks = [];
  hoistBlocks(blocks, tree);
  blocks[0] = { type: 'block', id: 0, children: [tree]};
  for (let b = 0; b < blocks.length; b++)
    blocks[b] = blockFunction(blocks[b]);
  return blocks;
  // return blocks.map((block) => blockFunction(block));
}

let x = compile(tree);
console.log(x[0])
module.exports = { blocks: x, entry };