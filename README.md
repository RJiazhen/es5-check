# ES5 兼容性检查与转换示例

这个项目演示了如何使用 Babel 和 Webpack 将 ES6+ 代码转换为兼容 IE9 的 ES5 代码。

## 功能特点

- 使用 Babel 将 ES6+ 代码转换为 ES5
- 使用 ESLint 进行代码质量检查
- 使用 Webpack 进行打包和开发服务器

## 安装

```bash
npm install
```

## 使用方法

### 开发模式

启动开发服务器：

```bash
npm run dev
```

### 代码检查

检查代码是否符合规范：

```bash
npm run lint
```

自动修复可修复的问题：

```bash
npm run lint-fix
```

### 生产构建

构建生产版本：

```bash
npm run build
```

构建后的文件将位于 `dist` 目录中。

## 项目结构

- `src/` - 源代码目录
  - `index.js` - 应用入口文件
  - `index.html` - HTML 模板
  - `es6-example.js` - 包含 ES6+ 语法的示例文件
- `.babelrc.json` - Babel 配置
- `.eslintrc.js` - ESLint 配置
- `webpack.config.js` - Webpack 配置

## 浏览器兼容性

本项目配置为支持 IE9 及以上版本的浏览器。
