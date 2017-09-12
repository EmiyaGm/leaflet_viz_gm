import util from './util';
import $ from 'jquery';
import MiniMap from 'leaflet-minimap';
import 'leaflet-fullscreen';
import {Location} from './location';
import iconLayers from 'leaflet-iconlayers';
import providers from './providers';
import './leaflet.ChineseTmsProviders';
import './L.Control.Zoomslider';
import './Control.OSMGeocoder';
import './Leaflet.LinearMeasurement'
import 'leaflet-draw'; //矢量画图工具

window.gm_map = {
    init(data){
        let map_container = $('#'+data.map_container);
        let id = data.map_container;
        util.adaptHeight(id,0);
        let map = basemap(id);
        function basemap(map_container) {
            let map = L.map(map_container,{
                crs:L.CRS.EPSG3857, //默认墨卡托投影 ESPG：3857
                attributionControl: false,
                fullscreenContro: true,
                zoomsliderControl: true,
                zoomControl: false
            }).setView([30, 104], 5);
            let osm = L.tileLayer.chinaProvider('GaoDe.Normal.Map',{});
            osm.addTo(map);


            L.control.scale({
                imperial:false
            }).addTo(map); //比例尺


            let osm2 = new L.TileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                minZoom: 0,
                maxZoom: 13
            });
            new MiniMap(osm2, { toggleDisplay: true }).addTo(map);//小地图


            let osmGeocoder = new L.Control.OSMGeocoder({
                collapsed: false,
                position: 'topright',
                text: 'Search',
            });
            osmGeocoder.addTo(map);//搜索框


            let attribution = L.control.attribution();
            attribution.setPrefix('中心地址');
            attribution.addAttribution(new Location().init('高德地图',map.getCenter()));
            attribution.addTo(map);
            let old_center = new Location().init('高德地图',map.getCenter());
            map.on('zoomend',function (e) {
                attribution.removeAttribution(old_center);
                attribution.addAttribution(new Location().init('高德地图',map.getCenter()));
                old_center = new Location().init('高德地图',map.getCenter());
                attribution.addTo(map);
            });
            map.on('moveend',function (e) {
                attribution.removeAttribution(old_center);
                attribution.addAttribution(new Location().init('高德地图',map.getCenter()));
                old_center = new Location().init('高德地图',map.getCenter());
                attribution.addTo(map);
            });


            let iconLayersControl = new iconLayers({
                maxLayersInRow:4
            });
            let layers = [];
            layers.push({
                id:1,
                title:'高德地图',
                icon:'../dist/images/高德地图.jpg',
                layer: L.tileLayer.chinaProvider('GaoDe.Normal.Map',{})
            });

            layers.push({
                id:2,
                title:'高德卫星',
                icon:'../dist/images/高德卫星.jpg',
                layer:L.tileLayer.chinaProvider('GaoDe.Satellite.Map',{})
            });

            layers.push({
                id:3,
                title:'谷歌地图',
                icon:'../dist/images/谷歌地图.jpg',
                layer:L.tileLayer.chinaProvider('Google.Normal.Map',{
                    maxZoom: 18,
                    minZoom: 5
                })
            });

            layers.push({
                id:4,
                title:'谷歌卫星',
                icon:'../dist/images/谷歌卫星.jpg',
                layer:L.tileLayer.chinaProvider('Google.Satellite.Map',{
                    maxZoom: 18,
                    minZoom: 5
                })
            });

            for (let providerId in providers) {
                layers.push(providers[providerId]);
            }
            iconLayersControl.setLayers(layers);
            iconLayersControl.addTo(map);
            iconLayersControl.on('activelayerchange', function(e) {

            });


            let editableLayers = new L.FeatureGroup();
            editbar(editableLayers,map);
            let drawnItems = editableLayers.addTo(map);


            map.addControl(new L.Control.LinearMeasurement({
                unitSystem: 'metric',
                color: '#FF0080',
                type: 'line'
            }));

            return map;
        }

        function editbar(editableLayers,map) {
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


            map.on(L.Draw.Event.CREATED, function(e) {
                var type = e.layerType,
                    layer = e.layer;
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
                    console.log(layer._latlngs);
                    if(area) layer.bindPopup('面积：'+area);
                }

                editableLayers.addLayer(layer);
            });
        }

        // 我的视野
        let default_view = {};
        // 初始化视野点
        function init_views() {
            $.ajax({
                'type': 'POST',
                'data': {
                    'class': 'visual_field',
                },
                'dataType': 'json',
                'url': '?app=data&controller=object&action=find&deep=true',
                'success': function(res) {
                    if (res.state) {
                        var data = res.data;
                        var html = '';
                        for (var index in data) {
                            var row = data[index];
                            var center = row.center;
                            var point = center[1] + "," + center[0];
                            //console.log(row, center);
                            html = '<div class="views_item_container" data-name="' + row.name + '" >';
                            html += '<div class="views_item" data-viewid="' + row._id + '" data-zoom="' + row.zoom + '"  data-center="' + point + '"style="padding-left:3px;float:left;" title="' + row.name + '">' + row.name + '</div>';
                            html += '<div style="float:right; right:8px;"><i class="delete_view_point map_close"></i></div>';
                            html += '<div class="set_default" data-viewid="' + row._id + '" style="float:right;margin-right:5px;display:none;" data-default="' + row.is_default + '"><i class="map_radio"></i>设为默认</div>';
                            html += '</div>';
                            $('.views_div').append(html);

                        }

                        function change_icon(view_id, is_default) {
                            var set_default = $('.views_div').find('.set_default[data-viewid=' + view_id + ']');
                            if (is_default) {
                                set_default.find('i').addClass('map_radio_selected');
                            } else {
                                set_default.find('i').removeClass('map_radio_selected');
                            }
                        }

                        if (default_view.view_id) {

                            change_icon(default_view.view_id, true);
                        }


                        $('.views_div').on('click', '.views_item', function() {
                            var zoom = $(this).attr('data-zoom');
                            var center = $(this).attr('data-center').toString();
                            var arr = center.split(',');
                        });

                        $('.views_div').on('mouseover', '.views_item_container', function() {
                            $(this).find('.set_default').show();
                        }).on('mouseout', '.views_item_container', function() {
                            $(this).find('.set_default').hide();
                        });

                        $('.views_div').on('click', '.delete_view_point', function() {
                            //$(`div[data-viewid=${viewid}]`).parent('div[data-name]').hide();
                            var viewid = $(this).parent().parent().find('div.views_item').attr('data-viewid');
                            var jsondata_delete = JSON.stringify({
                                'class': 'visual_field',
                                '_id': viewid
                            });
                            $.ajax({
                                type: 'post',
                                url: '?app=data&controller=object&action=delete', //替换为后端接口
                                data: jsondata_delete,
                                complete: function(res) {
                                    if (res.status) {

                                        $('.views_div').find('div.views_item[data-viewid=' + viewid + ']').parent().remove();
                                    } else {

                                    }

                                }
                            });
                        });

                        $('.views_div').on('click', '.set_default', function() {
                            //debugger;
                            var view_id = $(this).parent().find('div.views_item').attr('data-viewid');
                            if (default_view.view_id) {
                                if (default_view.view_id == view_id) return;
                                var data_update = {};
                                data_update.class = modelConfig['visual_field'];
                                data_update.data = {
                                    '_id': default_view.view_id,
                                    'is_default': 0
                                };
                                var jsondata_update = JSON.stringify(data_update);
                                $.ajax({
                                    type: 'POST',
                                    url: '?app=data&controller=object&action=update',
                                    data: jsondata_update,
                                    dataType: 'json',
                                    success: function(res) {
                                        if (res.status) {
                                            change_icon(default_view.view_id, false);
                                            data_update.class = modelConfig['visual_field'];
                                            data_update.data = {
                                                '_id': view_id,
                                                'is_default': 1
                                            };
                                            jsondata_update = JSON.stringify(data_update);
                                            $.ajax({
                                                type: 'POST',
                                                url: '?app=data&controller=object&action=update',
                                                data: jsondata_update,
                                                dataType: 'json',
                                                success: function(res) {
                                                    if (res.status) {
                                                        change_icon(view_id, true);
                                                        default_view.view_id = view_id;
                                                    } else {

                                                    }
                                                }
                                            });
                                        } else {

                                        }
                                    }
                                });
                            } else {
                                var data_update = {};
                                data_update.class = modelConfig['visual_field'];
                                data_update.data = {
                                    '_id': view_id,
                                    'is_default': 1
                                };
                                var jsondata_update = JSON.stringify(data_update);
                                $.ajax({
                                    type: 'POST',
                                    url: '?app=data&controller=object&action=update',
                                    data: jsondata_update,
                                    dataType: 'json',
                                    success: function(res) {
                                        if (res.status) {
                                            change_icon(view_id, true);
                                            default_view.view_id = view_id;
                                        } else {

                                        }
                                    }
                                });
                            }
                        });
                    } else {

                    }
                }
            });

        }
        return map;
    },
    addMarker(latlng,map,popupcontent){
        let marker = L.marker(latlng);
        let layer = marker.addTo(map);
        if(popupcontent){
            layer.addTo(map).bindPopup(popupcontent).openPopup();
        }
        return layer;
    },
    setView(latlng,map){
        map.setView(latlng,13);
    },
    removerMarker(layer){
        layer.remove();
    }

}
