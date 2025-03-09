/**
 * ES5 检查 Webpack 插件
 * 这个插件会在 webpack 构建完成后自动检查打包产物是否包含 ES6+ 语法
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

class ES5CheckPlugin {
  constructor(options = {}) {
    /** 默认参数 */
    this.options = {
      jsGlob: '**/*.js', // 默认检查所有 JS 文件
      outputDir: 'dist', // 默认输出目录
      configFile: '.eslintrc.dist.js', // 默认配置文件
      failOnError: false, // 默认不中断构建
      excludePatterns: [], // 排除的文件模式
      ...options,
    };
  }

  apply(compiler) {
    // 在 webpack 完成构建后执行
    compiler.hooks.afterEmit.tapAsync(
      'ES5CheckPlugin',
      async (compilation, callback) => {
        const outputPath = compilation.outputOptions.path;

        console.log('\n[ES5CheckPlugin] 开始检查打包产物是否包含 ES6+ 语法...');

        try {
          // 获取所有 JS 文件
          const jsFiles = [];

          // 获取 webpack 输出的资源文件列表
          const assets = compilation.getAssets();

          // 筛选出 JS 文件
          for (const asset of assets) {
            const filename = asset.name;
            if (filename.endsWith('.js')) {
              const filePath = path.join(outputPath, filename);
              if (fs.existsSync(filePath)) {
                // 检查是否在排除列表中
                const shouldExclude = this.options.excludePatterns.some(
                  (pattern) => {
                    return new RegExp(pattern).test(filename);
                  },
                );

                if (!shouldExclude) {
                  jsFiles.push(filePath);
                }
              }
            }
          }

          if (jsFiles.length === 0) {
            console.error(`[ES5CheckPlugin] 错误: 未找到任何 JS 文件`);
            return callback();
          }

          console.log(
            `[ES5CheckPlugin] 找到 ${jsFiles.length} 个 JS 文件需要检查:`,
          );
          jsFiles.forEach((file) => {
            console.log(`[ES5CheckPlugin] - ${path.basename(file)}`);
          });

          // 创建 ESLint 实例
          const eslint = new ESLint({
            overrideConfigFile: path.resolve(
              process.cwd(),
              this.options.configFile,
            ),
            useEslintrc: false,
            fix: false,
          });

          // 执行 lint
          const results = await eslint.lintFiles(jsFiles);

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
          const hasES6Errors = filteredResults.some(
            (result) => result.errorCount > 0,
          );

          if (hasES6Errors) {
            console.error('[ES5CheckPlugin] 打包产物中检测到 ES6+ 语法:');
            console.log(resultText);

            // 输出更详细的错误信息，包括代码内容
            console.log('\n[ES5CheckPlugin] 详细错误信息:');
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

            if (this.options.failOnError) {
              compilation.errors.push(new Error('打包产物中包含 ES6+ 语法'));
            } else {
              compilation.warnings.push(new Error('打包产物中包含 ES6+ 语法'));
            }
          } else {
            console.log(
              '[ES5CheckPlugin] 检查通过! 打包产物不包含 ES6+ 语法。',
            );
          }

          // 输出文件大小信息
          let totalSize = 0;
          jsFiles.forEach((file) => {
            const fileSize = fs.statSync(file).size;
            totalSize += fileSize;
            console.log(
              `[ES5CheckPlugin] ${path.basename(file)}: ${(
                fileSize / 1024
              ).toFixed(2)} KB`,
            );
          });

          console.log(
            `[ES5CheckPlugin] 总文件大小: ${(totalSize / 1024).toFixed(2)} KB`,
          );

          callback();
        } catch (error) {
          console.error('[ES5CheckPlugin] 检查过程中发生错误:', error);
          compilation.errors.push(error);
          callback();
        }
      },
    );
  }
}

module.exports = ES5CheckPlugin;
