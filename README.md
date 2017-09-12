# 基于leaflet的地图组件

- 使用 gulp 作为任务编排工具
- 使用 es2015 语法
- 使用 bower 管理前端库
- 使用 webpack 打包

## Demo

[demo](https://emiyagm.github.io/leaflet_viz_gm/example/index.html)

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

单独编译src/js下的文件：

```shell
npm run scripts
```

### css 和静态文件

单独编译src/css下的文件：

```shell
npm run styles
```
scss文件也可以一起编译

单独编译src/images下的文件：

```shell
npm run images
```

### 第三方组件

开发时使用 `bower_components/*/dist/` 下的第三方组件，可以在 `bower.json` 文件中修改组件版本
