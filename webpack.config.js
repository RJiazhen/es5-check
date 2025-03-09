const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development', // 开发模式，可以切换为 'production'
  entry: './src/index.js', // 入口文件
  output: {
    path: path.resolve(__dirname, 'dist'), // 输出目录
    filename: 'bundle.js', // 输出文件名
    clean: true, // 每次构建前清理输出目录
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
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html', // HTML 模板文件
      filename: 'index.html', // 输出的 HTML 文件名
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'), // 静态文件目录
    },
    compress: true, // 启用 gzip 压缩
    port: 9000, // 开发服务器端口
    hot: true, // 启用热模块替换
  },
};
