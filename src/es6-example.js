// 这个文件包含 ES6+ 语法，将被 Babel 转换为 ES5
// 注意：这些代码在没有转换的情况下不兼容 IE9

// ES6 常量声明
const PI = 3.14159;

// ES6 箭头函数
const square = (x) => x * x;

// ES6 模板字符串
const greeting = `圆周率是 ${PI}`;

// ES6 类
class Calculator {
  constructor() {
    this.value = 0;
  }

  add(x) {
    this.value += x;
    return this;
  }

  multiply(x) {
    this.value *= x;
    return this;
  }

  getValue() {
    return this.value;
  }
}

// ES6 解构赋值
const { sin, cos } = Math;

// ES6 默认参数
function greet(name = '世界') {
  return `你好，${name}！`;
}

// 导出这些函数和类，以便在其他文件中使用
export { PI, square, greeting, Calculator, greet };
