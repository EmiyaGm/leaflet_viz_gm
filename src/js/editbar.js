/**
 * Created by gongmin on 2017/9/7.
 */
import {editableLayers} from './basemap.js';
import 'leaflet-draw'; //矢量画图工具

import {Location} from './location.js';


class Editbar {
    init(map) {
        this._handleEdit(map);
    }
    _handleEdit(map) {

        map.addLayer(editableLayers);
        L.drawLocal.draw.toolbar.buttons.polygon = '多边形区域采集';
        L.drawLocal.draw.toolbar.buttons.polyline = '画线';
        L.drawLocal.draw.toolbar.buttons.marker = '位置采集';
        L.drawLocal.draw.toolbar.buttons.rectangle = '方形区域采集';

        var MyCustomMarker = L.Icon.extend({
            options: {
                shadowUrl: null,
                iconAnchor: new L.Point(12, 12),
                iconSize: new L.Point(16, 24),
                iconUrl: '../dist/images/marker-icon.png'
            }
        });

        var options = {
            position: 'topright',
            draw: {
                polyline: {
                    shapeOptions: {
                        color: '#000',
                        weight: 5
                    }
                },
                polygon: {
                    showArea: true, //显示面积
                    metric: true,
                    allowIntersection: false, // Restricts shapes to simple polygons
                    drawError: {
                        color: '#e1e100', // Color the shape will turn when intersects
                        message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
                    },
                    shapeOptions: {
                        color: '#bada55'
                    }
                },
                circle: false, // Turns off this drawing tool
                rectangle: {
                    metric: true,
                    showArea: true, //显示面积
                    shapeOptions: {
                        clickable: false
                    }
                },
                marker: {
                    icon: new MyCustomMarker()
                },
                circlemarker : false
            },
            edit: {
                featureGroup: editableLayers, //REQUIRED!!
                remove: true  //是否有删除按钮
            }
        };

        var drawControl = new L.Control.Draw(options);
        map.addControl(drawControl);
        console.info(L.DrawToolbar.TYPE);


        map.on(L.Draw.Event.CREATED, function(e) {
            var type = e.layerType,
                layer = e.layer;
            console.log("e(L.Draw.Event.CREATED)", e);
            var pos = e.layer._latlngs ? e.layer._latlngs : e.layer._latlng;
            // console.log("坐标", pos);
            if (document.getElementsByClassName("leaflet-draw-tooltip-subtext")[0]){
                var area = document.getElementsByClassName("leaflet-draw-tooltip-subtext")[0].innerHTML;
                // console.log("面积", area);
            }
            //使用[GeoJSON.js](https://github.com/caseycesari/GeoJSON.js)转化为GeoJSON
            //leaflet 中有转化的方法toGeoJSON
            if (type === 'marker') {
                let location = new Location();
                let address = location.init('高德地图',layer._latlng);
                if(e.layer._latlng) layer.bindPopup('坐标：'+ e.layer._latlng+'<br />'+'地址：'+address);
            } else if (type === 'rectangle' || type === 'polygon') {
                if(area) layer.bindPopup('面积：'+area);
            }

            editableLayers.addLayer(layer);
        });
    }
}

export { Editbar };