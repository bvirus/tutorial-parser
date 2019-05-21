const { InputStream } = require('./InputStream');
const { TokenStream } = require('./TokenStream');
const { readFileSync } = require('fs');

const prog = readFileSync('./test.prog').toString();


const stream = new InputStream(prog);
const tokens = new TokenStream(stream);

while (!stream.eof()) {
  // let [tok, type] = tokens.nextToken();
  console.log(tokens.nextToken());
}