# mauna 地图组件

- 使用 gulp 作为任务编排工具
- 使用 es2015 语法
- 使用 bower 管理前端库

## 初始化

```
npm install
bower install
```

## 编译

```shell
npm run build
```

编译后的组件代码在 dist 中。

## 开发

### js

开发时引用 `lib/browser` 下的 `.js` 文件，启动文件监听：

```shell
npm run watch
```

当 src/*.js 文件发生变化时会自动编译。

### css 和静态文件

开发时引用 `src` 下的 css 和其他静态文件。

### 第三方组件

开发时使用 `bower_components/*/dist/` 下的第三方组件，可以在 `bower.json` 文件中修改组件版本

## 参考

- [awesome-gis] (https://github.com/sshuair/awesome-gis)