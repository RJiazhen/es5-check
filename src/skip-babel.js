/**
 * 这个文件使用了 ES6+ 语法，但会跳过 Babel 转换
 * 用于测试 ES5CheckPlugin 的检测功能
 */

// ES6 箭头函数
const arrowFunction = () => {
  console.log('这是一个箭头函数，ES5 不支持');
};

// ES6 类语法
class TestClass {
  constructor() {
    this.name = 'TestClass';
  }

  // 类方法
  sayHello() {
    console.log(`Hello from ${this.name}`);
  }
}

// ES6 const 声明
const CONSTANT_VALUE = 'ES5 不支持 const';

// ES6 let 声明
let mutableValue = 'ES5 不支持 let';

// ES6 模板字符串
const greeting = `这是一个模板字符串，ES5 不支持 ${CONSTANT_VALUE}`;

// 导出这些内容，使其被打包
export { arrowFunction, TestClass, CONSTANT_VALUE, mutableValue, greeting };
