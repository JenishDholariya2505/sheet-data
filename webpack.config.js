const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    content: "./public/content.js",
    background: "./public/background.js",
    index: "./src/index.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".js", ".jsx"],
    fallback: {
      url: require.resolve("url/"),
      https: require.resolve("https-browserify"),
      querystring: require.resolve("querystring-es3"),
      stream: require.resolve("stream-browserify"),
      fs: false,
      http: false,
      os: require.resolve("os-browserify/browser"),
      crypto: require.resolve("crypto-browserify"),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$|jsx/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      filename: "index.html",
    }),
    new CopyPlugin({
      patterns: [
        // { from: "./public", to: "." }, // Copy everything from public to dist
        // { from: "./public" },
        { from: "./public/manifest.json", to: "manifest.json" },
        { from: "./public/logo192.png", to: "logo192.png" },
        // { from: "./public/background.js", to: "background.js" },
        // { from: "./public/content.js", to: "content.js" },
      ],
    }),
  ],
};
