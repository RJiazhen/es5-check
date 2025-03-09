# ES5 兼容性检查与转换示例

这个项目演示了如何使用 Babel 和 Webpack 将 ES6+ 代码转换为兼容 IE9 的 ES5 代码。

## 功能特点

- 使用 Babel 将 ES6+ 代码转换为 ES5
- 使用 ESLint 进行代码质量检查
- 使用 Webpack 进行打包和开发服务器
- **打包完成后自动检查产物是否包含 ES6+ 语法**
- **支持检查所有打包产物，包括代码分割后的多个文件**
- **禁用代码压缩和混淆，便于检查转换结果**
- **零配置使用，插件提供合理的默认值**
- **包含测试文件，用于验证 ES6+ 语法检测功能**

## 工作流程

1. 开发阶段：编写 ES6+ 代码，使用 `pnpm run lint` 检查代码质量
2. 构建阶段：使用 Webpack 和 Babel 将 ES6+ 代码转换为 ES5
3. 检查阶段：使用自定义插件检查打包产物是否包含 ES6+ 语法

## 安装

```bash
pnpm install
```

## 使用方法

### 开发模式

启动开发服务器：

```bash
pnpm run dev
```

### 代码检查

检查源代码是否符合规范：

```bash
pnpm run lint
```

自动修复可修复的问题：

```bash
pnpm run lint-fix
```

### 生产构建

构建开发版本（不压缩）：

```bash
pnpm run build
```

构建生产版本（不压缩）：

```bash
pnpm run build:prod
```

构建后的文件将位于 `dist` 目录中。

### 检查打包产物

检查 dist 目录中的所有 JS 文件是否包含 ES6+ 语法：

```bash
pnpm run check-dist
```

## 自动检查

项目配置了自动检查机制，在每次构建完成后会自动检查打包产物是否包含 ES6+ 语法。如果检测到 ES6+ 语法，会在控制台显示警告信息。

### 检查策略

1. **检查所有打包产物**：
   - 默认检查 webpack 输出的所有 JS 文件
   - 详细显示每个文件中的 ES6+ 语法错误

2. **错误处理**：
   - 默认情况下，检测到 ES6+ 语法会显示警告但不会中断构建
   - 可以配置为在检测到 ES6+ 语法时中断构建

如果需要在检测到 ES6+ 语法时中断构建，可以在 `webpack.config.js` 中将 `ES5CheckPlugin` 的 `failOnError` 选项设置为 `true`：

```javascript
// 使用自定义配置
new ES5CheckPlugin({
  failOnError: true
})
```

## 测试 ES6+ 语法检测

项目包含一个特殊的测试文件 `src/skip-babel.js`，它使用了 ES6+ 语法并且被配置为跳过 Babel 转换。这个文件的目的是：

1. 在打包产物中产生 ES6+ 语法，用于测试 ES5CheckPlugin 的检测功能
2. 演示如何在 webpack 配置中排除特定文件不经过 Babel 转换
3. 提供一个实际的例子，展示 ES6+ 语法在不兼容的浏览器中会导致错误

当您运行 `pnpm run build` 时，应该会看到 ES5CheckPlugin 检查所有打包产物是否包含 ES6+ 语法。

要禁用这个测试，只需在 `src/index.js` 中注释掉对 `skip-babel.js` 的导入：

```javascript
// 注释掉这行可以避免 ES6 语法错误
// import { arrowFunction, TestClass, CONSTANT_VALUE } from './skip-babel';
```

## ES6+ 语法检查规则

项目专注于检查以下 ES6+ 语法特性：

- **箭头函数**：检测 `=>` 语法
- **类语法**：检测 `class` 关键字和类相关特性
- **常量和块级作用域变量**：检测 `const` 和 `let` 关键字
- **模板字符串**：检测 `` `${var}` `` 语法

注意：检查工具会忽略代码风格相关的规则（如 `prefer-template`、`prefer-destructuring` 等），只关注真正的 ES6+ 语法特性。

## 禁用代码压缩

为了便于检查 Babel 转换后的代码是否符合 ES5 标准，项目配置了以下优化：

- 禁用了 webpack 的代码压缩（`minimize: false`）
- 禁用了模块合并（`concatenateModules: false`）
- 禁用了 Babel 的压缩选项（`compact: false`, `minified: false`）
- 添加了源码映射（`devtool: 'source-map'`）

这些配置确保打包后的代码保持可读性，便于检查和调试。

## 项目结构

- `src/` - 源代码目录
  - `index.js` - 应用入口文件
  - `index.html` - HTML 模板
  - `es6-example.js` - 包含 ES6+ 语法的示例文件（会被 Babel 转换）
  - `skip-babel.js` - 包含 ES6+ 语法的测试文件（跳过 Babel 转换）
- `scripts/` - 脚本目录
  - `es5-check.js` - ES5 语法检查工具，可作为独立工具使用
  - `es5-check-plugin.js` - webpack 插件，用于自动检查
- `.babelrc.json` - Babel 配置
- `.eslintrc.js` - ESLint 配置（源代码）
- `.eslintrc.dist.js` - ESLint 配置（打包产物）
- `webpack.config.js` - Webpack 配置

## 浏览器兼容性

本项目配置为支持 IE9 及以上版本的浏览器。
