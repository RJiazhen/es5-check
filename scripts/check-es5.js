#!/usr/bin/env node

/**
 * ES5 语法检查命令行工具
 * 用法: node check-es5.js [--config <配置文件>] [--no-details] <文件或目录>...
 */

const { checkES5Syntax, findJSFiles } = require('./es5-check');
const fs = require('fs');

// 解析命令行参数
const args = process.argv.slice(2);
const files = [];
let configFile = '.eslintrc.dist.js';
let showDetails = true;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--config' && i + 1 < args.length) {
    configFile = args[i + 1];
    i++;
  } else if (arg === '--no-details') {
    showDetails = false;
  } else if (arg.startsWith('--')) {
    console.error(`未知参数: ${arg}`);
    process.exit(1);
  } else {
    files.push(arg);
  }
}

if (files.length === 0) {
  console.error(
    '用法: node check-es5.js [--config <配置文件>] [--no-details] <文件或目录>...',
  );
  process.exit(1);
}

// 处理目录参数，查找其中的 JS 文件
const allFiles = [];
for (const file of files) {
  if (fs.existsSync(file)) {
    const stat = fs.statSync(file);
    if (stat.isDirectory()) {
      const jsFiles = findJSFiles(file);
      allFiles.push(...jsFiles);
    } else {
      allFiles.push(file);
    }
  } else {
    console.error(`文件或目录不存在: ${file}`);
  }
}

if (allFiles.length === 0) {
  console.error('未找到任何 JS 文件');
  process.exit(1);
}

// 执行检查
checkES5Syntax(allFiles, { configFile, showDetails })
  .then(({ hasErrors }) => {
    process.exit(hasErrors ? 1 : 0);
  })
  .catch((error) => {
    console.error('检查过程中发生错误:', error);
    process.exit(1);
  });
