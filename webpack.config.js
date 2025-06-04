const path = require("path");
const TerserPlugin = require('terser-webpack-plugin');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
// const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

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
  plugins: [
    // new BundleAnalyzerPlugin(),
    // new MonacoWebpackPlugin({})
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      })
    ],
    moduleIds: "named",
    chunkIds: "named",
    concatenateModules: true,
    // https://webpack.js.org/plugins/split-chunks-plugin/#optimizationsplitchunks
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          name: "vendors",
          reuseExistingChunk: true,
          enforce: true,
        }
      }
    }
  }
};
