module.exports = {
  parser: '@babel/eslint-parser', // 使用 Babel 解析器
  parserOptions: {
    requireConfigFile: true,
    babelOptions: {
      configFile: './.babelrc.json',
    },
    ecmaVersion: 2015, // 允许 ES6 语法，因为我们会用 Babel 转换
    sourceType: 'module', // 允许使用 import/export
  },
  env: {
    browser: true, // 启用浏览器环境
    es6: true, // 启用 ES6 全局变量
  },
  rules: {
    // 这里可以添加规则，但我们允许 ES6 语法，因为会用 Babel 转换
  },
};
