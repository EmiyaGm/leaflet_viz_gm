# 基于leaflet的地图组件

- 使用 gulp 作为任务编排工具
- 使用 es2015 语法
- 使用 bower 管理前端库
- 使用 webpack 打包

## Demo

[demo](https://emiyagm.github.io/leaflet_viz_gm/example/indexDemo.html)

[hexbin图绘制demo](https://emiyagm.github.io/leaflet_viz_gm/example/indexHexbin.html)

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

### 调用方式

引入的资源
```html
    <link rel="stylesheet" href="../dist/css/mauna_map.css">
    <link rel="stylesheet" href="../bower_components/bootstrap/dist/css/bootstrap.css">
    <style>
        body{
            height: 100%;
            width: 100%;
        }
        #map {
            height: 100%;
            width:100%;
        }
        *{
            box-sizing: inherit;
        }
    </style>
    <script src="../bower_components/jquery/dist/jquery.js"></script>
    <script src="../bower_components/d3/d3.js"></script>
    <script src="../dist/js/commons.js"></script>
    <script src="../dist/js/gm_map.js"></script>
```

```javascript
var map_options = {
        map_container: 'map区域id',
        tools: {
            tools_group: {
                view_control: true
            }
        },
        navigation:[
                    {
                        name:'城市导航',
                        value:'city',  //唯一，如果value为city那么必须是城市导航
                        frequently_used_city:[
                            {
                                name:'全国',
                                zoom:4,
                                center: [34.950204,110.595009]
                            }
                        ]
                    },
                    {
                        name:'兴趣点导航',
                        value:'marker'
                    },
                    {
                        name:'其他导航',
                        value:'other'
                    }
                ]
    };
var map = new mauna_map.init(map_options);
```

### Methods

| Method | Returns | Description |
|:---|:---|:---|
| init(map_options,callBack) | [Map](#user-content-leaflet-map) | 地图初始化方法，返回结果为leaflet里的class Map |
| addMarker(<[Latlng](#user-content-latlng)>latlng,<[Map](#user-content-leaflet-map)>map,\<Object\>options,\<[imgJson](#user-content-imgJson)\>imgUrl,callBack) | [Layer](#user-content-leaflet-layer) | 在指定经纬度添加marker，返回结果为leaflet里面的class Layer |
| setView(<[Latlng](#user-content-latlng)>latlng,<[Map](#user-content-leaflet-map)>map,\<Number\>zoom,callBack) | [Map](#user-content-leaflet-map) | 指定地图中心点位置和缩放程度 |
| removeMarker(<[Layer](#user-content-leaflet-layer)>layer,callBack) | this | 移除指定marker |
| draw(<[Map](#user-content-leaflet-map)>map,\<Array\>first,\<Array\>second,\<Number\>speed,\<String\>imgUrl,\<object\>options,callBack) | [Marker](#user-content-movingmarker-marker) | 在两点之间画可动的轨迹，返回结果为movingMarker组件的class Marker |
| drawLines(<[Map](#user-content-leaflet-map)>map,Array<[Latlng](#user-content-latlng)>latlngs,\<Number\>speed,\<String\>imgUrl,\<object\>options,callBack) | [Marker](#user-content-movingmarker-marker) | 画多组点的可动轨迹，顺序按照数组经纬度存放顺序 |
| addToolbar(\<String\>className, \<String\>template, \>Function\>clickFunc1, \>Function\>clickFunc2 ,callBack) | this | 给右上方toolbar增加功能的外部接口 |
| hideComponent(<[Map](#user-content-leaflet-map)>map,\<String\>component,callBack) | this | 隐藏内部公用组件，component传值对应说明：centerpoint：正下方中心地址，iconLayers：图层切换，zoomslider：层级伸缩条，search：搜索框，scale：比例尺，minimap：小地图，searchplace：搜索框 |
| showComponent(<[Map](#user-content-leaflet-map)>map,\<String\>component,callBack) | this | 显示内部公用组件，component传值对应说明：centerpoint：正下方中心地址，iconLayers：图层切换，zoomslider：层级伸缩条，search：搜索框，scale：比例尺，minimap：小地图，searchplace：搜索框 |
| getNavigation(\<Number\>index) | HTMLElement | 获取对应顺序的导航栏下方对应的div，从1开始 |
| contorl(<[Map](#user-content-leaflet-map)>map,<[Marker](#user-content-movingmarker-marker)>,\<String\>command,\<object\>lineoptions,callBack) | this | 控制绘制轨迹的点，command传值对应说明：start：开始移动，pause：暂停移动，stop：终止移动，如果你在之后再调用start，那么会从初始点开始移动，resume：重新开始 |
| contorl2(<[Map](#user-content-leaflet-map)>map,<[Marker](#user-content-movingmarker-marker)>,\<object\>lineoptions,callBack) | this | 控制绘制轨迹的点 |
| d3draw(<[Map](#user-content-leaflet-map)>map,callback) | none | 使用d3.js绘制图形 |
| addToolbar([Map](#user-content-leaflet-map)>map, \<String\>className, \<String\>template, clickFunc1, clickFunc2, callBack) | this | 右上角工具栏设置，详情请见demo页 |
| polyLine(<[Map](#user-content-leaflet-map)>map,Array<[Latlng](#user-content-latlng)>latlngs,\<object\>options,callBack) | polyline | 绘制路线，线条样式可以自定义，配置详情见leaflet的polyline配置项 |
| getNavigation(\<Number\>index,callBack) | HTMLElement | 获取导航栏分栏区域 |
| myIcon(<[Map](#user-content-leaflet-map)>map,\<Array\>latlng,\<object\>options,\<object\>markeropt) | myIcon | leaflet myIcon功能接口封装 |
| myMarker(\<Array\>latlng, \<object\>options, \<object\>markeropt) | <[Marker](#user-content-movingmarker-marker)> | 生成一个自定义icon的leaflet标准marker |
| icon(<[Map](#user-content-leaflet-map)>map,\<Array\>latlng,\<object\>options,\<object\>markeropt) | icon | leaflet icon功能接口封装 |
| location(\<Array\>latlng,callBack) | String | 逆地址编码转换接口 |
| createSearch(\<String\>content,callBack) | HTMLElement | 创建搜索区域 |
| getSearchTips(\<keywords\>,first,second) | JSON | 根据关键词，城市，经纬度查询 |
| changeMap(<[Map](#user-content-leaflet-map)>map,\<String\>type,\<Boolean\>road) | this | 切换基础地图图层，参数说明：type说明：google： 谷歌标准底图，google-satellite：谷歌卫星底图，gaode：高德标准底图，gaode-satellite：高德卫星底图，baidu：百度标准底图（注意！百度地图的投影坐标系和其他地图的均不一样，更换底图会导致原来在地图上的点和线位置偏移），baidu-satellite：百度卫星底图。road说明：true：显示路况，false：不显示路况（注意！百度底图的情况下，显示百度路况，其他底图情况下，统一显示高德路况）|
| initLine(<[Map](#user-content-leaflet-map)>map) | LinearMeasurement | 初始化测距工具 |
| startLine(\<LinearMeasurement\>line) | | 开始测距 |
| endLine(\<LinearMeasurement\>line) | | 结束测距 （已废弃）|
| drawArrow(polyline) | polylineDecorator | 在polyline上绘制箭头 |
| setPatterns(\<polylineDecorator\>decorator,\<object\>options) | this | 设置箭头样式 |
| myMarker(\<Array\>latlng,\<object\>options,\<object\>markeropt) | [Marker](#user-content-leaflet-marker) | 新建一个地图上的点，但是不显示在地图上 |
| getSearch(\<String\>keywords,<String>city) | JSON | 根据城市名称搜索 |
| getLatlng(\<String\>address) | Array | 根据地址搜索经纬度 |
| getSubdistrict(<String>address) | JSON | 高德行政区域查询接口 |
| arrowCluster(<[Map](#user-content-leaflet-map)>map) | collisionLayer | TODO |
| addCluster(\<Array\>Markers, <[Map](#user-content-leaflet-map)>map, \<object\>cluster_options) | markerClusterGroup | 点聚合，详情请见对应demo页面 |
| removeCluster(cluster,\<Array\>Markers,<[Map](#user-content-leaflet-map)>map) | none | 删除点聚合，还原坐标点 |
| addToCluster(<[Map](#user-content-leaflet-map)>map,\<Array\>layers,cluster | none | 向聚合里面添加点 |
| removerFromCluster(<[Map](#user-content-leaflet-map)>map, \<Array\>layers, cluster | none | 从聚合里删除点 |
| showBackground(<[Map](#user-content-leaflet-map)>map, \<String\>url) | Layer | 显示自定义背景蒙版，此时地图将不可操作 |
| hideBackground(<[Map](#user-content-leaflet-map)>map, background) | none | 移除自定义背景蒙版，此时地图将恢复操作 |
| showTransparentBg(<[Map](#user-content-leaflet-map)>map) | Layer | 显示灰色透明的背景蒙版，此时地图将不可操作 |
| hideTransparentBg(<[Map](#user-content-leaflet-map)>map,background) | none | 移除灰色透明的背景蒙版，此时地图将恢复操作 |
| changeIcon([Marker](#user-content-movingmarker-marker), \<Array\>latlng, \<object\>options) | [Marker](#user-content-movingmarker-marker) | 改变已有的Icon Marker |
| drawPolygon(<[Map](#user-content-leaflet-map)>map, \<Array\>latlngs, \<object\>option, \<Boolean\>fitBounds, callback) | polygon | 区域绘制 |
| initPolygon(<[Map](#user-content-leaflet-map)>map) | none | 初始化绘制区域功能，因为其功能被整合到Toolbar中，所以自带的功能按钮被隐藏 |
| startPolygon() | none | 开始绘制区域 |
| cancelPolygon() | none | 结束区域绘制 |
| removePolygon(layer) | none | 移除已经绘制的区域 |
| changeContainerBg(\<String\>url) | none | 修改地图底图背景 |
| showMarkerList(<[Map](#user-content-leaflet-map)>map, callBack) | none | 重叠提示（废弃） |
| showMarkerList2(<[Map](#user-content-leaflet-map)>map, callBack) | none | 重叠提示（废弃） |
| closeMarkerList(<[Map](#user-content-leaflet-map)>map, callBack | none | 关闭重叠提示（废弃）|
| drawCircle(<[Map](#user-content-leaflet-map)>map, \<Array\>latlng, \<object\>options,callback) | Layer | 画圆 |
| coverTips(<[Map](#user-content-leaflet-map)>map, \<Array\>markers, latlng, callback) | none | 重叠提示功能，配合鼠标移动监听使用 |
| showPopup(<[Map](#user-content-leaflet-map)>map, latlng, \<String\>content, \<object\>popupoptions, callback) | Popup | 添加一个popup |
| showHeatmap(<[Map](#user-content-leaflet-map)>map, \<Array\>data, radius, callback) | Layer | 绘制经典热力图，data是点的数组 |
| marsTobaidu(\<Array\>mars_point) | baidu_point | 火星坐标转百度坐标，一般配合更换百度地图底图使用 |
| changeToMapbox(<[Map](#user-content-leaflet-map)>map) | none | 将底图更换为mapbox底图 |
| drawDeckGl() | none | DeckGl绘制 |
| drawHexbin(<[Map](#user-content-leaflet-map)>map, \<Array\>latlngs) | Layer | hexbin图绘制 |



### Leaflet Map

此为暴露的Leaflet class Map开放接口，详见文档：
[Map](http://leafletjs.com/reference-1.2.0.html#map)

### Leaflet Layer

此为暴露的Leaflet class Layer开放接口，详见文档：
[Layer](http://leafletjs.com/reference-1.2.0.html#Layer)

### Leaflet Marker

此为暴露的Leaflet class Marker开放接口，详见文档：
[Marker](http://leafletjs.com/reference-1.2.0.html#Marker)

### movingMarker Marker

此为暴露的Leaflet组件Leaflet.MovingMarker的class Marker开放接口

**Methods**

*Getter*

 - ``` isRunning()```: return ```true``` if the marker is currently moving.
 - ```isPaused()```: return ```true``` if the marker is paused

 - ``` isEnded()```: return ```true``` if the marker is arrived to the last position or it has been stopped manually

 - ```isStarted()```: return ```true``` if the marker has started

**Note**: ```Marker.getLatLng()``` still works and give the current position

*Setter*

 - ```start()```:  the marker begins its path or resumes if it is paused.
 - ``` stop()```: manually stops the marker, if you call ```start`` after, the marker starts again the polyline at the beginning.
 - ```pause()```: just pauses the marker
 - ``` resume()```: the marker resumes its animation
 - ```addLatLng(latlng, duration)```: adds a point to the polyline. Useful, if we have to set the path one by one.
 - ``` moveTo(latlng, duration)```: stops current animation and make the marker move to ```latlng``` in ```duration``` ms.
 - ```addStation(pointIndex, duration)```: the marker will stop at the ```pointIndex```th points of the polyline during ```duration``` ms. You can't add a station at the first or last point of the polyline.

*Events*

 - ```start```: fired when the marker starts
 - ``` end```: fired when the marker stops
 - ```loop```: fired when the marker begin a new loop

**Note**: Event are not synchrone because of the use of ```requestAnimationFrame```.  If you quit the tab where the animation is working, events will be fired when the tab will get back the focus. Events ```end``` and ```loop``` have the attribute ```elapsedTime``` to get the time elapsed since the real end/loop.

### Latlng

关于Latlng类型说明

其实际上是一个存放经纬度的数组

例：
```
var latlng1 = [30,110];
var latlng2 = [30,104];
var map = new mauna_map.init(map_options);
mauna_map.draw(map,latlng2,latlng1,20000);
```

### imgJson

关于自定义marker样式的options，请按如下规则填写该json数据

```JavaScript
var imgUrl = {
    url : '', //图片地址
    width : 30,  //图片宽度
    height : 50  //图片高度
}
```

### PS

部分引入的leaflet插件，做了修改，以下列出名单

- [Leaflet.markercluster](https://github.com/EmiyaGm/Leaflet.markercluster)
- [Leaflet-MiniMap](https://github.com/EmiyaGm/Leaflet-MiniMap)
- [Leaflet.LayerGroup.Collision](https://github.com/EmiyaGm/Leaflet.LayerGroup.Collision)
