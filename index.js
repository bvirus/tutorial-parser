const { InputStream } = require('./InputStream');
const { TokenStream } = require('./TokenStream');
const { Parser } = require('./Parser');
const { parse } = require('./parse');
const { readFileSync } = require('fs');

const prog = readFileSync('./test.prog').toString();


const stream = new InputStream(prog);
const getToken = TokenStream(stream);
const parser = Parser(getToken);
console.log(parse(parser));