/**
 * ES5 检查 Webpack 插件
 * 这个插件会在 webpack 构建完成后自动检查打包产物是否包含 ES6+ 语法
 */

const path = require('path');
const { checkES5Syntax } = require('./es5-check');
const fs = require('fs');

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

          // 使用 es5-check.js 模块检查文件
          const { hasErrors } = await checkES5Syntax(jsFiles, {
            configFile: this.options.configFile,
            showDetails: true,
          });

          if (hasErrors && this.options.failOnError) {
            compilation.errors.push(new Error('打包产物中包含 ES6+ 语法'));
          } else if (hasErrors) {
            compilation.warnings.push(new Error('打包产物中包含 ES6+ 语法'));
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
