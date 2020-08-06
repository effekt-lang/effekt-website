const path = require("path");
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {

  mode: "production",
  watch: false,

  // mode: "development",
  // watch: true,

  entry: {
    app: "./src/index.ts",
		"editor.worker": 'monaco-editor/esm/vs/editor/editor.worker.js'
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  output: {
    globalObject: "self",
    filename: "[name].bundle.js",
    chunkFilename: "[name].chunk.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/dist/"
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.ttf$/,
        use: ['file-loader']
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
    namedModules: true,
    concatenateModules: true,
  }
};