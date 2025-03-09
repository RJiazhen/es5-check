// 这是应用程序的入口文件
// 我们使用 ES5 语法，确保兼容 IE9

// 导入 ES6 模块（会被 Babel 转换为 ES5 兼容的代码）
import { PI, square, greeting, Calculator, greet } from './es6-example';

// 导入跳过 Babel 转换的模块（这将在打包产物中保留 ES6 语法）
// 注释掉这行可以避免 ES6 语法错误
import { arrowFunction, TestClass, CONSTANT_VALUE } from './skip-babel';

// 在页面上显示内容
function showContent() {
  var appElement = document.getElementById('app');
  if (!appElement) return;

  // 创建内容容器
  var content = document.createElement('div');

  // 添加标题
  var title = document.createElement('h1');
  title.textContent = '使用 Babel 转换 ES6 到 ES5 的示例';
  content.appendChild(title);

  // 添加段落
  var p1 = document.createElement('p');
  p1.textContent = greeting; // 使用 ES6 模板字符串生成的内容
  content.appendChild(p1);

  var p2 = document.createElement('p');
  p2.textContent = '5 的平方是: ' + square(5); // 使用 ES6 箭头函数
  content.appendChild(p2);

  var p3 = document.createElement('p');
  // 使用 ES6 类
  var calc = new Calculator();
  calc.add(10).multiply(2);
  p3.textContent = '计算结果: ' + calc.getValue();
  content.appendChild(p3);

  var p4 = document.createElement('p');
  p4.textContent = greet(); // 使用 ES6 默认参数
  content.appendChild(p4);

  var p5 = document.createElement('p');
  p5.textContent = greet('ES5 用户'); // 使用自定义参数
  content.appendChild(p5);

  // 添加跳过 Babel 转换的内容（这些内容在运行时会出错，因为包含 ES6 语法）
  try {
    var p6 = document.createElement('p');
    p6.textContent = '跳过 Babel 转换的常量: ' + CONSTANT_VALUE;
    content.appendChild(p6);

    // 尝试使用箭头函数
    arrowFunction();

    // 尝试使用 ES6 类
    var testInstance = new TestClass();
    testInstance.sayHello();
  } catch (error) {
    var errorMsg = document.createElement('p');
    errorMsg.style.color = 'red';
    errorMsg.textContent =
      '错误: ' + error.message + ' (这是预期的，因为浏览器不支持 ES6)';
    content.appendChild(errorMsg);
  }

  // 清空并添加新内容
  appElement.innerHTML = '';
  appElement.appendChild(content);
}

// 页面加载完成后显示内容
window.onload = function () {
  showContent();
};
