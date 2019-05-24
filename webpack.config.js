const path = require('path');

module.exports = {
    "module": {
        rules: [
            {
              test: /\.js$/,
              exclude: /node_modules/,
              use: {
                loader: "babel-loader"
              }
            }
          ]
    },
    mode: "development",
    "entry": ["./demo.js"],
    "output": {
        "filename": "./dist.js",
        path: path.resolve(__dirname, 'webpack')
    }
}