const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  devServer: {
    port: 8081,
    static: {
      directory: path.join(__dirname, "./"),
    },
  },
  plugins: [
    new CopyPlugin({
      patterns: ["./index.html", "./styles.css"],
    }),
  ],
};
