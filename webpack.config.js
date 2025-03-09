const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ES5CheckPlugin = require('./scripts/es5-check-plugin');

module.exports = {
  mode: 'development', // 使用开发模式，不会进行代码压缩
  entry: {
    main: './src/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'), // 输出目录
    filename: '[name].bundle.js', // 输出文件名使用入口名称
    clean: true, // 每次构建前清理输出目录
    // 添加环境配置，禁用 ES6+ 语法
    environment: {
      // 禁用箭头函数
      arrowFunction: false,
      // 禁用 const/let
      const: false,
      // 禁用解构赋值
      destructuring: false,
      // 禁用动态导入
      dynamicImport: false,
      // 禁用 for...of 循环
      forOf: false,
      // 禁用 ES 模块语法
      module: false,
      // 禁用模板字符串
      templateLiteral: false,
    },
  },
  // 添加优化配置，禁用代码压缩和混淆
  optimization: {
    minimize: false, // 禁用代码压缩
    concatenateModules: false, // 禁用模块合并
    // 禁用其他优化
    removeAvailableModules: false,
    removeEmptyChunks: false,
    // 启用代码分割
    splitChunks: {
      chunks: 'all', // 对所有类型的 chunk 都进行分割
      minSize: 0, // 没有大小限制，确保所有模块都会被分割
      maxInitialRequests: Infinity, // 入口点的最大并行请求数
      maxAsyncRequests: Infinity, // 按需加载时的最大并行请求数
      cacheGroups: {
        // 第三方库分包
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
        },
        // 所有源码中的 JS 文件单独分包（除了入口文件）
        sourceFiles: {
          test: /[\\/]src[\\/](?!index\.js).*\.js$/,
          name(module) {
            // 获取相对于 src 目录的文件路径
            const filename = module.resource
              .replace(/^.*[\\/]src[\\/]/, '')
              .replace(/\.js$/, '');
            return filename; // 使用文件名作为 chunk 名
          },
          priority: 5,
          enforce: true, // 强制创建单独的 chunk
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/, // 匹配 .js 文件
        exclude: [
          /node_modules/, // 排除 node_modules 目录
          path.resolve(__dirname, 'src/skip-babel.js'), // 明确排除 skip-babel.js 文件
        ],
        use: {
          loader: 'babel-loader', // 使用 babel-loader
          options: {
            // 可以在这里配置 Babel，但我们已经有了 .babelrc.json
            compact: false, // 禁用 Babel 压缩
            minified: false, // 禁用 Babel 最小化
            // 添加 Symbol 的 polyfill
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    ie: '9',
                  },
                  useBuiltIns: 'usage',
                  corejs: 3,
                },
              ],
            ],
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
    // 使用 ES5CheckPlugin，检查所有打包产物
    new ES5CheckPlugin({
      failOnError: false,
    }),
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
