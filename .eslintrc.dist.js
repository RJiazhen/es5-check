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
  // 添加 eslint-plugin-es5 插件，它专门用于检测 ES6+ 语法
  plugins: ['es5'],
  extends: ['plugin:es5/no-es2015'], // 使用 es5 插件的预设规则
  rules: {
    // ES6+ 语法检测
    'no-var': 'off', // 允许使用 var（ES5 标准）

    // 箭头函数检测 - 使用更严格的规则
    'arrow-body-style': ['error', 'always'], // 箭头函数必须使用大括号
    'arrow-parens': ['error', 'always'], // 箭头函数参数必须使用括号
    'arrow-spacing': ['error', { before: true, after: true }], // 箭头函数箭头周围必须有空格

    // 类语法检测
    'no-class-assign': 'error', // 禁止类赋值
    'no-dupe-class-members': 'error', // 禁止重复的类成员

    // 模板字符串检测
    'no-template-curly-in-string': 'error', // 禁止模板字符串

    // 添加更多 ES6+ 语法检测规则
    'constructor-super': 'error', // 禁止在非派生类的构造函数中使用 super
    'no-this-before-super': 'error', // 禁止在 super() 调用前使用 this
    'no-useless-constructor': 'error', // 禁止不必要的构造函数

    // 使用 es5 插件的规则，而不是自定义规则
    'es5/no-block-scoping': 'error', // 禁止块级作用域（const、let）
    'es5/no-arrow-functions': 'error', // 禁止箭头函数
    'es5/no-classes': 'error', // 禁止类
    'es5/no-template-literals': 'error', // 禁止模板字符串
    'es5/no-destructuring': 'error', // 禁止解构
    'es5/no-spread': 'error', // 禁止展开运算符
    'es5/no-modules': 'error', // 禁止 ES 模块

    // 移除代码风格相关的规则
    'prefer-template': 'off', // 关闭模板字符串推荐
    'prefer-destructuring': 'off', // 关闭解构推荐
    'prefer-rest-params': 'off', // 关闭剩余参数推荐
    'prefer-spread': 'off', // 关闭展开运算符推荐
    'prefer-arrow-callback': 'off', // 关闭箭头函数回调推荐
    'prefer-const': 'off', // 关闭 const 推荐

    // 允许使用 Symbol 类型
    'es5/no-typeof-symbol': 'off',
  },
  // 添加全局变量
  globals: {
    // webpack 运行时变量
    __webpack_require__: 'readonly',
    __webpack_exports__: 'readonly',
    __webpack_modules__: 'readonly',
    __webpack_module_cache__: 'readonly',
  },
  // 忽略 core-js 的 polyfill
  ignorePatterns: ['**/core-js/**', '**/node_modules/**'],
};
