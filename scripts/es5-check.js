#!/usr/bin/env node

/**
 * ES5 语法检查工具
 * 这个工具用于检查 JavaScript 文件是否包含 ES6+ 语法
 * 可以作为独立工具使用，也可以被 ES5CheckPlugin 调用
 *
 * 命令行用法: node es5-check.js [--config <配置文件>] [--no-details] <文件或目录>...
 */

const { ESLint } = require('eslint');
const path = require('path');
const fs = require('fs');
const glob = require('glob');

// 定义真正关注的 ES6+ 语法错误类型
const ES6_SYNTAX_RULES = [
  // 箭头函数相关
  'arrow-body-style',
  'arrow-parens',
  'arrow-spacing',

  // 类相关
  'no-class-assign',
  'no-dupe-class-members',
  'constructor-super',
  'no-this-before-super',
  'no-useless-constructor',

  // 模板字符串
  'no-template-curly-in-string',

  // ES5 插件规则 (这些规则会以 es5/ 开头)
  'es5/no-arrow-functions',
  'es5/no-binary-and-octal-literals',
  'es5/no-block-scoping',
  'es5/no-classes',
  'es5/no-computed-properties',
  'es5/no-default-parameters',
  'es5/no-destructuring',
  'es5/no-exponentiation-operator',
  'es5/no-for-of',
  'es5/no-generators',
  'es5/no-modules',
  'es5/no-object-super',
  'es5/no-rest-parameters',
  'es5/no-shorthand-properties',
  'es5/no-spread',
  'es5/no-template-literals',
  'es5/no-typeof-symbol',
  'es5/no-unicode-code-point-escape',
  'es5/no-unicode-regex',
];

/**
 * 检查文件是否包含 ES6+ 语法
 * @param {string[]} files - 要检查的文件路径数组
 * @param {Object} options - 配置选项
 * @param {string} options.configFile - ESLint 配置文件路径
 * @param {boolean} options.showDetails - 是否显示详细错误信息
 * @returns {Promise<{hasErrors: boolean, results: Object[]}>} - 检查结果
 */
async function checkES5Syntax(files, options = {}) {
  const { configFile = '.eslintrc.dist.js', showDetails = true } = options;

  // 创建 ESLint 实例
  const eslint = new ESLint({
    overrideConfigFile: path.resolve(process.cwd(), configFile),
    useEslintrc: false,
    fix: false,
  });

  // 执行 lint
  const results = await eslint.lintFiles(files);

  // 过滤出真正的 ES6+ 语法错误
  const filteredResults = results.map((result) => {
    const es6Errors = result.messages.filter((msg) => {
      // 检查规则 ID 是否在我们关心的列表中，或者以 es5/ 开头
      return (
        ES6_SYNTAX_RULES.includes(msg.ruleId) ||
        (msg.ruleId && msg.ruleId.startsWith('es5/'))
      );
    });
    return {
      ...result,
      messages: es6Errors,
      errorCount: es6Errors.length,
      warningCount: 0,
      fixableErrorCount: 0,
      fixableWarningCount: 0,
    };
  });

  // 获取格式化器
  const formatter = await eslint.loadFormatter('stylish');
  const resultText = formatter.format(filteredResults);

  // 检查是否有 ES6+ 语法错误
  const hasErrors = filteredResults.some((result) => result.errorCount > 0);

  if (hasErrors) {
    console.error('[ES5Check] 检测到 ES6+ 语法:');
    console.log(resultText);

    if (showDetails) {
      // 输出更详细的错误信息，包括代码内容
      console.log('\n[ES5Check] 详细错误信息:');
      filteredResults.forEach((result) => {
        if (result.errorCount > 0) {
          console.log(`\n文件: ${result.filePath}`);
          const fileContent = fs
            .readFileSync(result.filePath, 'utf-8')
            .split('\n');

          result.messages.forEach((msg) => {
            const { line, column, ruleId, message } = msg;
            console.log(
              `\n第 ${line} 行, 第 ${column} 列: ${message} (${ruleId})`,
            );

            // 输出错误行的代码内容及其上下文
            const startLine = Math.max(1, line - 2);
            const endLine = Math.min(fileContent.length, line + 2);

            for (let i = startLine; i <= endLine; i++) {
              const isErrorLine = i === line;
              const lineContent = fileContent[i - 1] || '';
              const linePrefix = isErrorLine ? '> ' : '  ';
              console.log(`${linePrefix}${i}: ${lineContent}`);

              // 如果是错误行，添加指示箭头指向错误位置
              if (isErrorLine) {
                const pointer =
                  ' '.repeat(column + 3 + i.toString().length) + '^';
                console.log(pointer);
              }
            }
          });
        }
      });
    }
  } else {
    console.log('[ES5Check] 检查通过! 文件不包含 ES6+ 语法。');
  }

  // 输出文件大小信息
  let totalSize = 0;
  files.forEach((file) => {
    const fileSize = fs.statSync(file).size;
    totalSize += fileSize;
    console.log(
      `[ES5Check] ${path.basename(file)}: ${(fileSize / 1024).toFixed(2)} KB`,
    );
  });

  console.log(`[ES5Check] 总文件大小: ${(totalSize / 1024).toFixed(2)} KB`);

  return {
    hasErrors,
    results: filteredResults,
  };
}

/**
 * 查找目录中的 JS 文件
 * @param {string} dir - 要搜索的目录
 * @param {Object} options - 配置选项
 * @param {string} options.pattern - 文件匹配模式
 * @param {string[]} options.excludePatterns - 要排除的文件模式
 * @returns {string[]} - 找到的文件路径数组
 */
function findJSFiles(dir, options = {}) {
  const { pattern = '**/*.js', excludePatterns = [] } = options;

  const files = glob.sync(pattern, {
    cwd: dir,
    absolute: true,
  });

  // 过滤掉排除的文件
  return files.filter((file) => {
    const filename = path.basename(file);
    return !excludePatterns.some((pattern) => {
      return new RegExp(pattern).test(filename);
    });
  });
}

// 如果直接运行这个脚本，则检查命令行参数指定的文件
if (require.main === module) {
  // 解析命令行参数
  const args = process.argv.slice(2);
  const files = [];
  let configFile = '.eslintrc.dist.js';
  let showDetails = true;

  // 显示帮助信息的函数
  function showHelp() {
    console.log(`
ES5 语法检查工具
用法: node es5-check.js [选项] <文件或目录>...

选项:
  --config <文件路径>  指定 ESLint 配置文件 (默认: .eslintrc.dist.js)
  --no-details         不显示详细错误信息
  --help               显示此帮助信息

示例:
  node es5-check.js ./dist                  检查 dist 目录中的所有 JS 文件
  node es5-check.js --no-details ./dist     检查 dist 目录但不显示详细错误信息
  node es5-check.js ./dist/main.bundle.js   检查特定的 JS 文件
    `);
    process.exit(0);
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--config' && i + 1 < args.length) {
      configFile = args[i + 1];
      i++;
    } else if (arg === '--no-details') {
      showDetails = false;
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
    } else if (arg.startsWith('--')) {
      console.error(`未知参数: ${arg}`);
      console.error('使用 --help 查看帮助信息');
      process.exit(1);
    } else {
      files.push(arg);
    }
  }

  if (files.length === 0) {
    console.error('错误: 未指定要检查的文件或目录');
    console.error(
      '用法: node es5-check.js [--config <配置文件>] [--no-details] <文件或目录>...',
    );
    console.error('使用 --help 查看更多信息');
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
}

module.exports = {
  checkES5Syntax,
  findJSFiles,
  ES6_SYNTAX_RULES,
};
