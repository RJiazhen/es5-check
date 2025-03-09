const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ES5CheckPlugin = require('./scripts/es5-check-plugin');

module.exports = {
  mode: 'development', // 使用开发模式，不会进行代码压缩
  entry: './src/index.js', // 入口文件
  output: {
    path: path.resolve(__dirname, 'dist'), // 输出目录
    filename: 'bundle.js', // 输出文件名
    clean: true, // 每次构建前清理输出目录
  },
  // 添加优化配置，禁用代码压缩和混淆
  optimization: {
    minimize: false, // 禁用代码压缩
    concatenateModules: false, // 禁用模块合并
    // 禁用其他优化
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
  },
  module: {
    rules: [
      {
        test: /\.js$/, // 匹配 .js 文件
        exclude: /node_modules/, // 排除 node_modules 目录
        use: {
          loader: 'babel-loader', // 使用 babel-loader
          options: {
            // 可以在这里配置 Babel，但我们已经有了 .babelrc.json
            compact: false, // 禁用 Babel 压缩
            minified: false, // 禁用 Babel 最小化
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html', // HTML 模板文件
      filename: 'index.html', // 输出的 HTML 文件名
      minify: false, // 禁用 HTML 压缩
    }),
    new ES5CheckPlugin(),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'), // 静态文件目录
    },
    compress: false, // 禁用 gzip 压缩
    port: 9000, // 开发服务器端口
    hot: true, // 启用热模块替换
  },
  // 添加源码映射，便于调试
  devtool: 'source-map',
};
