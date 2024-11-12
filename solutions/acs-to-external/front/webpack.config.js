const Dotenv = require("dotenv-webpack");

module.exports = {
  devServer: {
    allowedHosts: "auto",
    client: {
      overlay: true,
    },
  },
  entry: "./client.js",
  output: {
    filename: "bundle.js",
  },
  plugins: [new Dotenv()],
  devtool: "inline-source-map",
  mode: "development",
};
