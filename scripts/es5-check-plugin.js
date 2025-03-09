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
  'arrow-body-style',
  'arrow-parens',
  'arrow-spacing',
  'no-class-assign',
  'no-dupe-class-members',
  'no-template-curly-in-string',
  'no-const',
  'no-let',
];

class ES5CheckPlugin {
  constructor(options = {}) {
    this.options = {
      jsGlob: '**/*.js', // 默认检查所有 JS 文件
      outputDir: 'dist', // 默认输出目录
      configFile: '.eslintrc.dist.js', // 默认配置文件
      failOnError: false, // 默认不中断构建
      ...options,
    };
  }

  apply(compiler) {
    // 在 webpack 完成构建后执行
    compiler.hooks.afterEmit.tapAsync(
      'ES5CheckPlugin',
      async (compilation, callback) => {
        const outputPath = compilation.outputOptions.path;
        // 使用 glob 查找所有匹配的 JS 文件
        const jsPattern = path.join(outputPath, this.options.jsGlob);

        console.log('\n[ES5CheckPlugin] 开始检查打包产物是否包含 ES6+ 语法...');
        console.log(`[ES5CheckPlugin] 检查模式: ${jsPattern}`);

        try {
          // 查找所有匹配的 JS 文件
          const jsFiles = glob.sync(jsPattern);

          if (jsFiles.length === 0) {
            console.error(
              `[ES5CheckPlugin] 错误: 未找到任何 JS 文件 (${jsPattern})`,
            );
            return callback();
          }

          console.log(
            `[ES5CheckPlugin] 找到 ${jsFiles.length} 个 JS 文件需要检查`,
          );

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
            const es6Errors = result.messages.filter((msg) =>
              ES6_SYNTAX_RULES.includes(msg.ruleId),
            );
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

            if (this.options.failOnError) {
              compilation.errors.push(new Error('打包产物中包含 ES6+ 语法'));
            } else {
              compilation.warnings.push(new Error('打包产物中包含 ES6+ 语法'));
            }
          } else {
            console.log(
              '[ES5CheckPlugin] 检查通过! 打包产物不包含 ES6+ 语法。',
            );

            // 输出一些统计信息
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
              `[ES5CheckPlugin] 总文件大小: ${(totalSize / 1024).toFixed(
                2,
              )} KB`,
            );
          }

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
