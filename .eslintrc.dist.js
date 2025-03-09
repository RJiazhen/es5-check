module.exports = {
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    ecmaVersion: 5, // 严格限制为 ES5 语法
    sourceType: 'script', // 使用 script 模式，因为打包后应该是 ES5
  },
  env: {
    browser: true,
    es6: false, // 禁用 ES6 环境
  },
  rules: {
    // 只保留真正与 ES6+ 语法检测相关的规则

    // ES6+ 语法检测
    'no-var': 'off', // 允许使用 var（ES5 标准）

    // 箭头函数检测
    'arrow-body-style': 'error', // 禁止箭头函数
    'arrow-parens': 'error', // 禁止箭头函数参数括号
    'arrow-spacing': 'error', // 禁止箭头函数空格

    // 类语法检测
    'no-class-assign': 'error', // 禁止类赋值
    'no-dupe-class-members': 'error', // 禁止重复的类成员

    // 模板字符串检测
    'no-template-curly-in-string': 'error', // 禁止模板字符串

    // 移除代码风格相关的规则
    'prefer-template': 'off', // 关闭模板字符串推荐
    'prefer-destructuring': 'off', // 关闭解构推荐
    'prefer-rest-params': 'off', // 关闭剩余参数推荐
    'prefer-spread': 'off', // 关闭展开运算符推荐
    'prefer-arrow-callback': 'off', // 关闭箭头函数回调推荐
    'prefer-const': 'off', // 关闭 const 推荐
  },
};
