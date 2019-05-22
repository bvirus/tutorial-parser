const { InputStream } = require('./InputStream');
const { TokenStream } = require('./TokenStream');
const { Parser } = require('./Parser');
const { parse, assignForm, conditionalForm } = require('./parse');
const { readFileSync } = require('fs');

const prog = readFileSync('./test.prog').toString();


const stream = new InputStream(prog);
const tokens = TokenStream(stream);
const parser = Parser(tokens);
let tree = parse(parser);
console.log(JSON.stringify(tree, null, 2));