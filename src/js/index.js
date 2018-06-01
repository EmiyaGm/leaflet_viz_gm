import util from './util';
import $ from 'jquery';
import MiniMap from 'leaflet-minimap';
import {Location} from './location';
import providers from './providers';
import './leaflet.ChineseTmsProviders';
import './L.Control.Zoomslider';
import './Control.OSMGeocoder';
import './Leaflet.LinearMeasurement'
import 'leaflet-draw'; //矢量画图工具
import './L.Polyline.SnakeAnim';
import './MovingMarker';
import './Leaflet.Icon.Glyph';
import 'leaflet-polylinedecorator';
import 'leaflet.markercluster';
import 'leaflet-draw';
import 'leaflet.layergroup.collision';
import 'mapbox-gl-leaflet';
import 'leaflet-pip';
import 'jquery-mousewheel';
import 'proj4';
import 'proj4leaflet';
import './tileLayer.baidu';
import './HeatLayer';
//import Deck, {PolygonLayer} from 'deck.gl';
import {Deck, GeoJsonLayer, ScatterplotLayer, HexagonLayer, MapController, PolygonLayer} from '@deck.gl/core';
import '@asymmetrik/leaflet-d3';

window.mauna_map = {
    init(data,callBack){
        let host = window.location.host;
        host = 'api'+host.substring(host.indexOf('.'),host.length);
        let map_container = $('#'+data.map_container);
        let id = data.map_container;
        let map = basemap(id);
        let tools = data.tools;
        let tools_group_template = '<div class="switch_group" data-state="0"><i class="map-icon map-menu"></i></div>';
        let button_group_template = '<div class="button_group"><ul id="tools"></ul></div>';
        let navigation = data.navigation || null;
        if(tools){
            init_tools();
        }
        let top_menu_template = '';
        let frequently_used_city;
        if(navigation!=null){
            let top_menu_template_first = '<div class="top_menu select" style="position: absolute">\
                                    <div class="navigation_title form-group has-feedback">\
                                        <span class="select-arrow" style="top:14px;right:5px"></span>\
                                        <input type="text" class="form-control" id="navigation_input" readonly style="background: #fff;padding:0;padding-left:5px;padding-right:5px;height:30px; line-height: 30px; min-width: 70px;">\
                                    </div>\
                                    <div class="search_place form-group">\
                                    </div>\
                                </div>\
                                <div class="navigation_modal card-div-border">\
                                    <div class="table-toolbar" style="margin: 8px 0 0 8px;padding-left: 0px">\
                                    <form class="form-inline">\
                                    <div class="display_search">\
                                    <div name="type" value="city" class="btn-group">';

            let top_menu_template_second = '';
            let top_menu_template_third = '</div><div class="pull-right"></div>\
                                    </div>\
                                    </form>\
                                    </div>\
                                    <div class="navigation_totle">';
            let top_menu_template_forth = '';
            for(let i = 0 ;i<navigation.length;i++){
                if(navigation[i].value == 'city'){
                    frequently_used_city = navigation[i].frequently_used_city;
                    if(i==0){
                        top_menu_template_second = top_menu_template_second + '<button class="btn btn-sm btn-primary navigation" type="button" value="'+navigation[i].value+'">'+navigation[i].name+'</button>';
                        top_menu_template_forth = top_menu_template_forth + '<div class="navigation_'+navigation[i].value+'"><div style="margin-left: 14px;margin-top: 16px;padding: 0;color: #666;">常用城市</div><ul class="frequently_used_city" ></ul></div>';
                    }else {
                        top_menu_template_second = top_menu_template_second + '<button class="btn btn-sm btn-white navigation" type="button" value="'+navigation[i].value+'">'+navigation[i].name+'</button>';
                        top_menu_template_forth = top_menu_template_forth + '<div class="navigation_'+navigation[i].value+'" style="display: none;"></div>';

                    }
                }else {
                    if(i==0){
                        top_menu_template_second = top_menu_template_second + '<button class="btn btn-sm btn-primary navigation" type="button" value="'+navigation[i].value+'">'+navigation[i].name+'</button>';
                        top_menu_template_forth = top_menu_template_forth + '<div class="navigation_'+navigation[i].value+'"></div>';
                    }else {
                        top_menu_template_second = top_menu_template_second + '<button class="btn btn-sm btn-white navigation" type="button" value="'+navigation[i].value+'">'+navigation[i].name+'</button>';
                        top_menu_template_forth = top_menu_template_forth + '<div class="navigation_'+navigation[i].value+'" style="display: none;"></div>';
                    }
                }

            }
            top_menu_template = top_menu_template + top_menu_template_first + top_menu_template_second + top_menu_template_third +top_menu_template_forth + '</div></div>';
        }

        map_container.append('<div id="center-point" style="position: absolute;bottom: 0;z-index: 1000;background:rgba(255, 255, 255, 0.5);color: #333;font-size: 12px"></div>');
        init_top_menu(frequently_used_city);
        init_cross();

        let location = '';
        let url = 'https://restapi.amap.com/v3/geocode/regeo?output=json&location='+map.getCenter().lng+','+map.getCenter().lat+'&key=3ee09e2462ad937d972b825e3624a89a&radius=1000&extensions=all';
        $.ajax({
            url: url,
            success: function(data){
                let dataJson = data.regeocode;
                let zoom = map.getZoom();
                let center = '';
                if(dataJson.addressComponent.country.length > 0){
                    if(dataJson.addressComponent.province.length > 0){
                        if(zoom == 4){
                            center = '中国';
                            $('#center-point').css('left','calc(50% - 14px)');
                        }else if(zoom == 5 || zoom == 6){
                            center = dataJson.addressComponent['province'];
                            $('#center-point').css('left','calc(50% - '+center.length*12/2+'px)');
                        }else if(zoom>=7&&zoom<=10){
                            center = dataJson.addressComponent['province']+dataJson.addressComponent['city'];
                            $('#center-point').css('left','calc(50% - '+center.length*12/2+'px)');
                        }else if(zoom>=11&&zoom<=13){
                            center = dataJson.addressComponent['province']+dataJson.addressComponent['city']+dataJson.addressComponent['district'];
                            $('#center-point').css('left','calc(50% - '+center.length*12/2+'px)');
                        }else if(zoom>=14&&zoom<=18){
                            center = dataJson.formatted_address;
                            $('#center-point').css('left','calc(50% - '+center.length*12/2+'px)');
                        }
                    }else if(dataJson.addressComponent.seaArea){
                        center = dataJson.addressComponent.seaArea;
                        $('#center-point').css('left','calc(50% - '+center.length*12/2+'px)');
                    }
                }else {
                    center = '中国以外地区';
                    $('#center-point').css('left','calc(50% - '+center.length*12/2+'px)');
                }
                location = dataJson.addressComponent['district'];
                $('#navigation_input').val(location);
                $('#center-point').html(center);
            }
        });
        map.on('moveend',function () {
            let url = 'https://restapi.amap.com/v3/geocode/regeo?output=json&location='+map.getCenter().lng+','+map.getCenter().lat+'&key=3ee09e2462ad937d972b825e3624a89a&radius=1000&extensions=all';
            $.ajax({
                url: url,
                success: function(data){
                    let dataJson = data.regeocode;
                    let zoom = map.getZoom();
                    let center = '';
                    if(dataJson.addressComponent.country.length > 0){
                        if(dataJson.addressComponent.province.length > 0){
                            if(zoom == 4){
                                center = '中国';
                                $('#center-point').css('left','calc(50% - 14px)');
                            }else if(zoom == 5 || zoom == 6){
                                center = dataJson.addressComponent['province'];
                                $('#center-point').css('left','calc(50% - '+center.length*12/2+'px)');
                            }else if(zoom>=7&&zoom<=10){
                                center = dataJson.addressComponent['province']+dataJson.addressComponent['city'];
                                $('#center-point').css('left','calc(50% - '+center.length*12/2+'px)');
                            }else if(zoom>=11&&zoom<=13){
                                center = dataJson.addressComponent['province']+dataJson.addressComponent['city']+dataJson.addressComponent['district'];
                                $('#center-point').css('left','calc(50% - '+center.length*12/2+'px)');
                            }else if(zoom>=14&&zoom<=18){
                                center = dataJson.formatted_address;
                                $('#center-point').css('left','calc(50% - '+center.length*12/2+'px)');
                            }
                        }else if(dataJson.addressComponent.seaArea){
                            center = dataJson.addressComponent.seaArea;
                            $('#center-point').css('left','calc(50% - '+center.length*12/2+'px)');
                        }
                    }else {
                        center = '中国以外地区';
                        $('#center-point').css('left','calc(50% - '+center.length*12/2+'px)');
                    }
                    location = dataJson.addressComponent['district'];
                    $('#navigation_input').val(location);
                    $('#center-point').html(center);
                }
            });
        });
        function init_tools() {
            init_tools_group();
        }

        function init_top_menu(frequently_used_city) {
            map_container.append(top_menu_template);
            $('.top_menu').on('click',function (e) {
                e.stopPropagation();
            });
            $('.navigation_title').on('click',function (e) {
                if($('.navigation_title').hasClass('open')){
                    $('.navigation_title').removeClass('open');
                }else{
                    $('.navigation_title').addClass('open');
                }
                if(!$('.navigation_modal').attr('style')){
                    $('.navigation_modal').attr('style','display:block');
                }else if($('.navigation_modal').attr('style')=='display:none'){
                    $('.navigation_modal').attr('style','display:block');
                }else {
                    $('.navigation_modal').attr('style','display:none');
                }
                e.stopPropagation();
            });
            $('.top_menu').on('dblclick',function (e) {
                e.stopPropagation();
            });
            let li = '';
            if(frequently_used_city){
                for(let i=0;i<frequently_used_city.length;i++){
                    li = li + '<li data-zoom="'+frequently_used_city[i].zoom+'" data-center="'+frequently_used_city[i].center[0]+','+frequently_used_city[i].center[1]+'">'+frequently_used_city[i].name+'</li>'
                }
                $('ul.frequently_used_city').append(li);
                $('ul.frequently_used_city > li').on('click',function (e) {
                    let zoom = $(this).attr('data-zoom');
                    let latlng = $(this).attr('data-center').split(',');
                    map.setView(latlng,zoom);
                    e.stopPropagation();
                });
            }
            $('button.navigation').on('click',function (e) {
                $('button.navigation').each(function (i,e) {
                    $(e).removeClass('btn-primary');
                    $(e).addClass('btn-white');
                });
                $(this).removeClass('btn-white');
                $(this).addClass('btn-primary');
                let value = $(this).val();
                $('.navigation_totle>div').hide();
                $('.navigation_' + value).show();
                e.stopPropagation();
            });

            $('ul.frequently_used_city').after('<div style="margin-left: 14px;margin-top: 16px;padding: 0;color: #666;">选择城市</div>' +
                '<div style="margin-left: 14px; margin-top:8px; margin-right: 14px;">' +
                '<div data-id="province" class="select" value="" style="width: calc(32.6%);"></div>' +
                '<div data-id="city" class="select" value="" style="width: calc(32.6%);"></div>' +
                '<div data-id="district" class="select" value="" style="width: calc(32.6%);"></div>' +
                '</div>');
        }

        function init_tools_group() {
            map_container.append(tools_group_template);
            map_container.append(button_group_template);
        }
        $('.switch_group').on('click',function (e) {
            if ($('.switch_group').attr('data-state') == 0) {
                $('.button_group').show();
                $('.switch_group').attr('data-state', 1);
                $('.switch_group i').addClass('font-active');
            } else {
                $('.button_group').hide();
                $('.switch_group').attr('data-state', 0);
                $('.switch_group i').removeClass('font-active');
                //重置所有状态
                // close_evey_window();
            }
            e.stopPropagation();
        });

        $(".switch_group").dblclick(function(e){
            e.stopPropagation();
        });

        $(".button_group").dblclick(function(e){
            e.stopPropagation();
        });

        $('.button_group').on('click',function (e) {
            e.stopPropagation();
        });

        $('.navigation_modal').on('click',function (e) {
            e.stopPropagation();
        });

        $('.navigation_modal').on('dblclick',function (e) {
            e.stopPropagation();
        });

        $('.navigation_modal').on('mousewheel', function(e) {
            e.stopPropagation();
        });

        function init_cross() {
            map_container.append('<img src="../dist/images/cross_blue.svg" style="width: 14px;position: absolute;top: calc(50% - 7px);left: calc(50% - 7px);z-index: 1000"/>');
        }


        function basemap(map_container) {
            let corner1 = L.latLng(85, 170),
                corner2 = L.latLng(-85, -170),
                maxbound = L.latLngBounds(corner1, corner2);
            let map = L.map(map_container,{
                crs:L.CRS.EPSG3857, //默认墨卡托投影 ESPG：3857
                attributionControl: false,
                zoomsliderControl: true,
                zoomControl: false,
                maxZoom:18,
                minZoom:4,
                maxBounds:maxbound
            }).setView([30, 104], 5);
            let osm = L.tileLayer.chinaProvider('GaoDe.Normal.Map',{
                updateInterval : 0,
                keepBuffer : 0,
                className: 'basemap'
            });
            /*
             let token = 'pk.eyJ1IjoiZW1peWFnbSIsImEiOiJjajdsazVkdWsxMG12MzJvNnF4dWE4dzdkIn0.95qn2oWmFfBAZsHMzO42vQ';
             let gl = L.mapboxGL({
             accessToken: token,
             style: {
             "version": 8,
             //      style: 'mapbox://styles/mapbox/basic-v9',
             //      "sprite": "mapbox://sprites/mapbox/streets-v8",
             "sources": {
             "gaode-tiles": {
             "type": "raster",
             'tiles': [
             "http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
             ],
             'tileSize': 256
             }
             },
             "layers": [{
             "id": "simple-tiles",
             "type": "raster",
             "source": "gaode-tiles",
             "minzoom": 0,
             "maxzoom": 22
             }]
             },
             center: [30, 104],
             zoom: 5
             }).addTo(map);
             */
            osm.addTo(map);

            let scale = L.control.scale({
                imperial:false
            });
            scale.addTo(map);//比例尺


            let osm2 = new L.tileLayer.chinaProvider('Google.Normal.Map',{});
            new MiniMap(osm2, {
                width : 180,
                height:180,
                minimized:true,
                closeCallback:data.minimap_closecallback
            }).addTo(map);//小地图

            if($('.leaflet-control-minimap').length>0&&$('.leaflet-control-zoomslider').length>0){
                let minimap = $('.leaflet-control-minimap');
                $('.leaflet-control-minimap').remove();
                $('.leaflet-control-zoomslider').after(minimap);
            }
            $('.leaflet-control-zoomslider-province').hide();
            $('.leaflet-control-zoomslider-city').hide();
            $('.leaflet-control-zoomslider-street').hide();
            $('.leaflet-control-zoomslider').mouseover(function () {
                $('.leaflet-control-zoomslider-province').show();
                $('.leaflet-control-zoomslider-city').show();
                $('.leaflet-control-zoomslider-street').show();
            });
            $('.leaflet-control-zoomslider').mouseout(function () {
                $('.leaflet-control-zoomslider-province').hide();
                $('.leaflet-control-zoomslider-city').hide();
                $('.leaflet-control-zoomslider-street').hide();
            });

            /**
             let myIcon = L.icon({
                className: 'my-cross-icon',
                iconUrl: 'common/mauna/js/mauna.leaflet/dist/images/cross_blue.png',
                iconSize: [18, 18],
            });
             let crossMarker = L.marker(map.getCenter(), {
                icon: myIcon,
                zIndexOffset: 30000,
            }).addTo(map);



             map.on('move',function () {
                crossMarker.setLatLng(map.getCenter());
            });

             map.on('zoom',function () {
                crossMarker.setLatLng(map.getCenter());
            });



             let osmGeocoder = new L.Control.OSMGeocoder({
                collapsed: false,
                position: 'topright',
                text: 'Search',
            });
             osmGeocoder.addTo(map);//搜索框



             let attribution = L.control.attribution();
             attribution.addTo(map);
             let location = '';
             let url = 'http://api.vehicle-dev-nj.mokua.com:5107/vehicle/regeo?lng='+map.getCenter().lng+'&lat='+map.getCenter().lat;
             $.ajax({
                url: url,
                success: function(data){
                    let dataJson = eval('(' + data + ')');
                    location = dataJson.addressComponent['district'];
                    attribution.setPrefix(location);
                }
            });
             map.on('moveend',function () {
                let url = 'http://api.vehicle-dev-nj.mokua.com:5107/vehicle/regeo?lng='+map.getCenter().lng+'&lat='+map.getCenter().lat;
                $.ajax({
                    url: url,
                    success: function(data){
                        let dataJson = eval('(' + data + ')');
                        location = dataJson.addressComponent['district'];
                        attribution.setPrefix(location);
                    }
                });
            });
             map.on('zoomend',function () {
                let url = 'http://api.vehicle-dev-nj.mokua.com:5107/vehicle/regeo?lng='+map.getCenter().lng+'&lat='+map.getCenter().lat;
                $.ajax({
                    url: url,
                    success: function(data){
                        let dataJson = eval('(' + data + ')');
                        location = dataJson.addressComponent['district'];
                        attribution.setPrefix(location);
                    }
                });
            });


             let iconLayersControl = new iconLayers({
                maxLayersInRow:4
            });
             let layers = [];
             layers.push({
                id:1,
                title:'高德地图',
                icon:'../dist/images/高德地图.jpg',
                layer: L.tileLayer.chinaProvider('GaoDe.Normal.Map',{
                    maxZoom: 18
                })
            });

             layers.push({
                id:2,
                title:'高德卫星',
                icon:'../dist/images/高德卫星.jpg',
                layer:L.tileLayer.chinaProvider('GaoDe.Satellite.Map',{
                    maxZoom: 18

                })
            });

             layers.push({
                id:3,
                title:'谷歌地图',
                icon:'../dist/images/谷歌地图.jpg',
                layer:L.tileLayer.chinaProvider('Google.Normal.Map',{
                    maxZoom: 18

                })
            });

             layers.push({
                id:4,
                title:'谷歌卫星',
                icon:'../dist/images/谷歌卫星.jpg',
                layer:L.tileLayer.chinaProvider('Google.Satellite.Map',{
                    maxZoom: 18

                })
            });

             for (let providerId in providers) {
                layers.push(providers[providerId]);
            }
             iconLayersControl.setLayers(layers);
             iconLayersControl.addTo(map);
             iconLayersControl.on('activelayerchange', function(e) {
                console.log('1111111111111111');
            });
             **/

            //let drawnItems = editableLayers.addTo(map);

            map.on('click',function () {
                if($('.top_menu').hasClass('open')){
                    $('.top_menu').removeClass('open');
                }
                if($('.navigation_modal').attr('style')==undefined){

                }else if($('.navigation_modal').attr('style')=='display:none'){

                }else {
                    $('.navigation_modal').attr('style','display:none');
                }
                if($('#tools > li > .map-icon.font-active').parent().attr('data-picture')==1){
                    $('#tools > li > .map-icon.font-active').parent().attr('data-picture',0);
                    $('#tools > li > .map-icon.font-active').next().attr('style','display:none');
                    $('#tools > li > .map-icon.font-active').removeClass('font-active');
                }

            });
            return map;
        }


        if(callBack){
            callBack();
        }
        map.map_source = 'gaode';
        map.road = false;
        return map;
    },
    addMarker(latlng,map,options,imgUrl,callBack){
        if(imgUrl){
            L.Icon.Glyph.MDI = L.Icon.Glyph.extend({
                options: {
                    prefix: 'mdi',
                    iconUrl: imgUrl.url,
                    iconSize: [imgUrl.width, imgUrl.height],
                    bgSize : {
                        x: imgUrl.bgwidth,
                        y: imgUrl.bgheight
                    }
                }
            });
            // Factory
            L.icon.glyph.mdi = function(options) { return new L.Icon.Glyph.MDI(options); };

            if(options){
                options.icon = L.icon.glyph.mdi({ glyph: 'package' });
                options.riseOnHover = true;
            }else {
                options = {
                    icon : L.icon.glyph.mdi({ glyph: 'package' }),
                    riseOnHover: true
                };
            }

            let marker = L.marker(latlng, options);

            let layer = marker.addTo(map);
            if(callBack){
                callBack();
            }
            return layer;
        }else {
            let marker = L.marker(latlng);
            let layer = marker.addTo(map);
            if(callBack){
                callBack();
            }
            return layer;
        }

    },
    setView(latlng,map,zoom,callBack){
        map.setView(latlng,zoom);
        if(callBack){
            callBack();
        }
        return map;
    },
    removeMarker(layer,callBack){
        layer.remove();
        if(callBack){
            callBack();
        }
        return this;
    },
    draw(map,first,second,speed,imgUrl,options,callBack){
        if(imgUrl){
            L.Icon.Glyph.MDI = L.Icon.Glyph.extend({
                options: {
                    prefix: 'mdi',
                    iconUrl: imgUrl.url,
                    iconSize: [imgUrl.width, imgUrl.height],
                    bgSize : {
                        x: imgUrl.bgwidth,
                        y: imgUrl.bgheight
                    }
                }
            });
            // Factory
            L.icon.glyph.mdi = function(options) { return new L.Icon.Glyph.MDI(options); };

            if(options){
                options.icon = L.icon.glyph.mdi({ glyph: 'package' });
                options.riseOnHover = true;
            }else {
                options = {
                    icon : L.icon.glyph.mdi({ glyph: 'package' }),
                    riseOnHover: true
                };
            }
        }
        let marker = L.Marker.movingMarker([first,second], [speed] ,options).addTo(map);
        if(callBack){
            callBack();
        }
        return marker;
    },
    drawLines(map,latlngs,speed,imgUrl,options,callBack){
        if(imgUrl){
            L.Icon.Glyph.MDI = L.Icon.Glyph.extend({
                options: {
                    prefix: 'mdi',
                    iconUrl: imgUrl.url,
                    iconSize: [imgUrl.width, imgUrl.height],
                    bgSize : {
                        x: imgUrl.bgwidth,
                        y: imgUrl.bgheight
                    }
                }
            });
            // Factory
            L.icon.glyph.mdi = function(options) { return new L.Icon.Glyph.MDI(options); };

            if(options){
                options.icon = L.icon.glyph.mdi({ glyph: 'package' });
                options.riseOnHover = true;
            }else {
                options = {
                    icon : L.icon.glyph.mdi({ glyph: 'package' }),
                    riseOnHover:true
                };
            }
        }
        let marker = L.Marker.movingMarker(latlngs, speed , options).addTo(map);

        if(callBack){
            callBack();
        }
        return marker;
    },
    polyLine(map,latlngs,options,fitbound,callBack){
        let polyline = L.polyline(latlngs, options).addTo(map);
        if(fitbound){
            map.fitBounds(polyline.getBounds());
        }
        if(callBack){
            callBack();
        }
        return polyline;
    },
    contorl(map,marker,command,lineoptions,callBack){
        switch (command){
            case 'start' : marker.start();break;
            case 'pause' : marker.pause();break;
            case 'stop' : marker.stop();break;
            case 'resume' : marker.resume();break;
        }
        let snakeLine;

        if(lineoptions){
            snakeLine = L.polyline([],lineoptions).addTo(map);
        }else {
            snakeLine = L.polyline([]).addTo(map);
        }
        let decorator = L.polylineDecorator(snakeLine, {
            patterns: [
                {offset: 25, repeat: 100, symbol: L.Symbol.arrowHead({pixelSize: 15, pathOptions: {fillOpacity: 1, weight: 0}})}
            ]
        }).addTo(map);
        marker.on('move', updateSnakeLine);

        function updateSnakeLine(e) {
            let ll = e.target.getLatLng();
            snakeLine.addLatLng(ll);
            if(!map.getBounds().contains(ll)){
                map.panTo(ll);
            }
        }
        if(callBack){
            callBack();
        }
        return snakeLine;
    },
    control2(map,marker,lineoptions,callBack){
        let snakeLine;

        if(lineoptions){
            snakeLine = L.polyline([],lineoptions).addTo(map);
        }else {
            snakeLine = L.polyline([]).addTo(map);
        }
        let decorator = L.polylineDecorator(snakeLine, {
            patterns: [
                {offset: 25, repeat: 100, symbol: L.Symbol.arrowHead({pixelSize: 15, pathOptions: {fillOpacity: 1, weight: 0}})}
            ]
        }).addTo(map);
        marker.on('move', updateSnakeLine);

        function updateSnakeLine(e) {
            let ll = e.target.getLatLng();
            snakeLine.addLatLng(ll);
        }
        if(callBack){
            callBack();
        }
        return snakeLine;
    },
    d3draw(map,callBack){
        map = new L.Map("map", {center: [37.8, -96.9], zoom: 4})
            .addLayer(new L.TileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"));
        var svg = d3.select(map.getPanes().overlayPane).append("svg"),
            g = svg.append("g").attr("class", "leaflet-zoom-hide");
        d3.json("us-states.json", function(error, collection) {
            if (error) throw error;
            var transform = d3.geo.transform({point: projectPoint}),
                path = d3.geo.path().projection(transform);
            function projectPoint(x, y) {
                var point = map.latLngToLayerPoint(new L.LatLng(y, x));
                this.stream.point(point.x, point.y);
            }
            var feature = g.selectAll("path")
                .data(collection.features)
                .enter().append("path");
            feature.attr("d", path);
            // code here
        });
        if(callBack){
            callBack();
        }
    },
    addToolbar(map,className, template, clickFunc1, clickFunc2, callBack){
        let button_group = $('#tools');
        button_group.append(template);
        button_group.find('.'+className).click(function(e) {
            change_icon(className);
            if ($('.'+className).attr('data-picture') == 1) {
                $('.'+className+' > div').show();
                if(clickFunc1){
                    clickFunc1(e);
                }
            } else {
                $('.'+className+' > div').hide();
                if(clickFunc2){
                    clickFunc2(e);
                }
            }
            map.on('click',function () {
                if($('.top_menu').hasClass('open')){
                    $('.top_menu').removeClass('open');
                }
                if($('.navigation_modal').attr('style')==undefined){

                }else if($('.navigation_modal').attr('style')=='display:none'){

                }else {
                    $('.navigation_modal').attr('style','display:none');
                }
                if($('#tools > li > .map-icon.font-active').parent().attr('data-picture')==1){
                    $('#tools > li > .map-icon.font-active').parent().attr('data-picture',0);
                    $('#tools > li > .map-icon.font-active').next().attr('style','display:none');
                    $('#tools > li > .map-icon.font-active').removeClass('font-active');
                }

            });
            e.stopPropagation();
        });
        $(document).on("keyup",function(event){
            if ($('.'+className).attr('data-picture') == 1) {
                if(event.keyCode==27){
                    change_icon(className);
                    $('.'+className+' > div').hide();
                    if(clickFunc2){
                        clickFunc2(event);
                    }
                }
            }
        });
        button_group.find('.'+className).dblclick(function(e){
            e.stopPropagation();
        });
        if(callBack){
            callBack();
        }
        button_group.find('.'+className).mousewheel(function(e){
            e.stopPropagation();
        });

        function change_icon(cls) {
            $('#tools>li>i').removeClass('font-active');
            $('#tools>li>div').attr('style','display:none');

            if ($(`.${cls}`).attr('data-picture') == 0) {
                //$(`.${cls}`).children().attr('src',`/common/mauna/images/${cls}_active.png`);
                $(`.${cls}`).find('>i').addClass('font-active');
                $('#tools>li').attr('data-picture', 0);
                $(`.${cls}`).attr('data-picture', 1);
            } else {
                $(`.${cls}`).find('i').removeClass('font-active');
                $(`.${cls}`).attr('data-picture', 0);
                // close_evey_window();
            }
        }

        return this;

    },
    hideComponent(map,component,callBack){
        switch (component){
            case 'centerpoint' :
                $('#'+map._container.id).find('#center-point').hide();break;
            case 'zoomslider' : $('#'+map._container.id).find('.leaflet-control-zoomslider').hide();break;
            case 'lineaermeasurement' : break;
            case 'search' : $('#'+map._container.id).find('.leaflet-control-geocoder').hide();break;
            case 'scale' : $('#'+map._container.id).find('.leaflet-control-scale').hide();break;
            case 'minimap' : $('#'+map._container.id).find('.leaflet-control-minimap').hide();break;
            case 'searchplace' : $('#'+map._container.id).find('.search_place').hide();break;
        }
        if(callBack){
            callBack();
        }
        return this;
    },
    showComponent(map,component,callBack){
        switch (component){
            case 'centerpoint' : $('#'+map._container.id).find('#center-point').show();break;
            case 'zoomslider' : $('#'+map._container.id).find('.leaflet-control-zoomslider').show();break;
            case 'lineaermeasurement' : break;
            case 'search' : $('#'+map._container.id).find('.leaflet-control-geocoder').show();break;
            case 'scale' : $('#'+map._container.id).find('.leaflet-control-scale').show();break;
            case 'minimap' : $('#'+map._container.id).find('.leaflet-control-minimap').show();break;
            case 'searchplace' : $('#'+map._container.id).find('.search_place').show();break;
        }
        if(callBack){
            callBack();
        }
        return this;
    },
    getNavigation(index,callBack){
        if(callBack){
            callBack();
        }
        return $('.navigation_totle > div')[index-1];
    },
    myIcon(map,latlng,options,markeropt){
        let myIcon = L.divIcon(options);
        if(markeropt){
            markeropt.icon = myIcon;
            markeropt.riseOnHover = true;
        }else {
            markeropt = {
                icon : myIcon,
                riseOnHover : true
            }
        }
        return L.marker(latlng, markeropt).addTo(map);
    },
    myMarker(latlng,options,markeropt){
        let myIcon = L.divIcon(options);
        if(markeropt){
            markeropt.icon = myIcon;
        }else {
            markeropt = {
                icon : myIcon
            }
        }
        return L.marker(latlng, markeropt);
    },
    icon(map,latlng,options,markeropt){
        let icon = L.icon(options);
        if(markeropt){
            markeropt.icon = icon;
            markeropt.riseOnHover = true;
        }else {
            markeropt = {
                icon : icon,
                riseOnHover : true
            }
        }
        return L.marker(latlng, markeropt).addTo(map);
    },
    location(latlng,callBack){
        latlng = L.latLng(latlng);
        let address = new Location().init('高德地图',latlng);
        if(callBack){
            callBack();
        }
        return address;
    },
    createSearch(content,callBack){
        $('.search_place').append(content);
        if(callBack){
            callBack();
        }
        return $('.search_place');
    },
    getSearchTips(keywords,first,second){
        let latlng,city;
        if(first && typeof first == 'object'){
            latlng = L.latLng(first);
            city = second;
        }else {
            latlng = L.latLng(second);
            city = first;
        }
        let location = new Location();
        return location.getInputtips(keywords,city,latlng)
    },
    getSearch(keywords,city){
        let location = new Location();
        return location.getSearch(keywords,city);
    },
    getLatlng(address){
        let location = new Location();
        return location.getLatlng(address);
    },
    getSubdistrict(address){
        let location = new Location();
        return location.getSubdistrict(address);
    },
    changeMap(map,type,road){
        let layer,layer2;
        let center;
        switch (type) {
            case 'google':
                map.options.crs = L.CRS.EPSG3857;
                layer = L.tileLayer.chinaProvider('Google.Normal.Map', {});
                map.map_source = 'google';
                break;
            case 'google-satellite':
                map.options.crs = L.CRS.EPSG3857;
                layer = L.tileLayer.chinaProvider('Google.Satellite.Map', {});
                map.map_source = 'google-satellite';
                break;
            case 'gaode':
                map.options.crs = L.CRS.EPSG3857;
                layer = L.tileLayer.chinaProvider('GaoDe.Normal.Map', {});
                map.map_source = 'gaode';
                break;
            case 'gaode-satellite':
                map.options.crs = L.CRS.EPSG3857;
                layer = L.tileLayer.chinaProvider('GaoDe.Satellite.Map', {});
                map.map_source = 'gaode-satellite';
                break;
            case 'baidu':
                center = map.getCenter();
                map.options.crs = L.CRS.Baidu;
                layer = L.tileLayer.baidu({ layer: 'vec' });
                map.setView(center);
                map.map_source = 'baidu';
                break;
            case 'baidu-satellite':
                center = map.getCenter();
                map.options.crs = L.CRS.Baidu;
                layer = L.tileLayer.baidu({ layer: 'img_d' });
                map.setView(center);
                map.map_source = 'baidu-satellite';
                break;
            case 'geoq':
                map.options.crs = L.CRS.EPSG3857;
                layer = L.tileLayer.chinaProvider('Geoq.Normal.Map', {});
                map.map_source = 'geoq';
                break;
            case 'geoq-satellite':
                map.options.crs = L.CRS.EPSG3857;
                layer = L.tileLayer.chinaProvider('GaoDe.Satellite.Map', {});
                map.map_source = 'geoq-satellite';
                break;
            case 'tianditu':
                map.options.crs = L.CRS.EPSG3857;
                layer = L.tileLayer.chinaProvider('TianDiTu.Normal.Map', {});
                layer2 = L.tileLayer.chinaProvider('TianDiTu.Normal.Annotion', {});
                map.map_source = 'tianditu';
                break;
            case 'tianditu-satellite':
                map.options.crs = L.CRS.EPSG3857;
                layer = L.tileLayer.chinaProvider('TianDiTu.Satellite.Map', {});
                layer2 = L.tileLayer.chinaProvider('TianDiTu.Satellite.Annotion', {});
                map.map_source = 'tianditu-satellite';
                break;
            case 'geoq-bb':
                map.options.crs = L.CRS.EPSG3857;
                layer = L.tileLayer.chinaProvider('Geoq.Normal.PurplishBlue', {});
                map.map_source = 'geoq-bb';
                break;
            case 'geoq-bb-satellite':
                map.options.crs = L.CRS.EPSG3857;
                layer = L.tileLayer.chinaProvider('GaoDe.Satellite.Map', {});
                map.map_source = 'geoq-bb-satellite';
                break;
        }
        map.eachLayer(function (layer) {
            if(layer._url){
                map.removeLayer(layer);
            }
        });
        map.addLayer(layer, true);
        if(type == 'tianditu' || type == 'tianditu-satellite'){
            map.addLayer(layer2, true);
        }
        if(road){
            if(type == 'baidu' || type == 'baidu-satellite'){
                map.addLayer(L.tileLayer.baidu({ layer: 'time' }), true );
                map.road = true;
            }else{
                map.addLayer(L.tileLayer.chinaProvider('GaoDe.Road.Map', {}), true );
                map.road = false;
            }
        }
        return this;
    },
    initLine(map){
        let line = new L.Control.LinearMeasurement({
            unitSystem: 'metric',
            color: '#0D9BF2',
            type: 'line',
            show_last_node:false
        });
        map.addControl(line);
        return line;
    },
    startLine(map,classname){
        let line = new L.Control.LinearMeasurement({
            unitSystem: 'metric',
            color: '#0D9BF2',
            type: 'line',
            show_last_node:false,
            tool_className:classname
        });
        map.addControl(line);
        $('.leaflet-grab').addClass('leaflet-pointer');
        $('.leaflet-grab').removeClass('leaflet-grab');
        return line.initRuler();
    },
    endLine(line){
        $('.leaflet-pointer').addClass('leaflet-grab');
        $('.leaflet-pointer').removeClass('leaflet-pointer');
        //console.log(line);
        //line.resetRuler(!!line.mainLayer);
    },
    drawArrow(polyline){
        let decorator = L.polylineDecorator(polyline, {
            patterns: [
                {offset: 25, repeat: 100, symbol: L.Symbol.arrowHead({pixelSize: 10, pathOptions: {fillOpacity: 1, weight: 0}})}
            ]
        }).addTo(map);

        return decorator;
    },
    setPatterns(decorator,options){
        let patterns = [
            {
                offset:25,
                repeat:100,
                symbol:L.Symbol.arrowHead(
                    {
                        pixelSize:options.pixelSize,
                        pathOptions:options.pathOptions
                    }
                )
            }
        ];
        decorator.setPatterns(patterns);
        return this;
    },
    arrowCluster(map){
        let collisionLayer = L.LayerGroup.collision({margin:5});
        map.addLayer(collisionLayer);
        return collisionLayer;
    },
    addCluster(markers,map,cluster_options){
        for(let i =0;i<markers.length;i++){
            map.removeLayer(markers[i]);
        }
        let cluster;
        if(cluster_options){
            cluster = L.markerClusterGroup({
                iconCreateFunction: function(cluster) {
                    let childCount = cluster.getChildCount();

                    let c = ' marker-cluster-';
                    if (childCount < 10) {
                        c += 'small';
                        cluster_options.iconSize = new L.Point(40, 40);
                    } else if (childCount < 100) {
                        c += 'medium';
                        cluster_options.iconSize = new L.Point(48, 48);
                    } else {
                        c += 'large';
                        cluster_options.iconSize = new L.Point(60, 60);
                    }
                    cluster_options.className = 'marker-cluster ' + cluster_options.uniqueName + c;
                    cluster_options.html = '<div><span>' + childCount + '</span></div>';
                    return L.divIcon(cluster_options);
                }
            });
        }else {
            cluster = L.markerClusterGroup();
        }
        cluster.addLayers(markers);
        map.addLayer(cluster);
        return cluster;
    },
    removeCluster(cluster,markers,map){
        cluster.remove();
        for(let i = 0;i<markers.length;i++){
            map.addLayer(markers[i]);
        }
    },
    addToCluster(map,layers,cluster){
        for(var i =0;i<layers.length;i++){
            if(map.hasLayer(layers[i])){
                layers[i].remove();
            }else {

            }
        }
        cluster.addLayers(layers);
    },
    removeFromCluster(map,layers,cluster){
        for(var i =0;i<layers.length;i++){
            if(map.hasLayer(layers[i])){

            }else {
                map.addLayer(layers[i]);
            }
        }
        cluster.removeLayers(layers);
    },
    showBackground(map,url){
        map.dragging.disable();
        map.doubleClickZoom.disable();
        map.boxZoom.disable();
        map.touchZoom.disable();
        map.scrollWheelZoom.disable();
        let imageUrl = url;
        let imageBounds = [map.getCenter()];
        let options = {
            'zIndex' : 2000,
            'className' : ' backgroundImg',
            'crossOrigin' : true
        };
        let background = L.imageOverlay(imageUrl, imageBounds ,options).addTo(map);
        background.setBounds(map.getBounds());

        $('.top_menu').hide();
        $('.button_group').hide();
        $('.switch_group').hide();
        $('.card-div-border').hide();
        $('.marker-cluster').hide();
        map.on('resize',function () {
            if($('.backgroundImg').length > 0){
                map.dragging.disable();
                map.doubleClickZoom.disable();
                map.boxZoom.disable();
                map.touchZoom.disable();
                map.scrollWheelZoom.disable();
                background.setBounds(map.getBounds());
            }else {
                map.scrollWheelZoom.enable();
                map.dragging.enable();
                map.doubleClickZoom.enable();
                map.boxZoom.enable();
                map.touchZoom.enable();
            }
        });
        map.on('move',function () {
            background.setBounds(map.getBounds());
        });

        return background;
    },
    hideBackground(map,background){
        map.scrollWheelZoom.enable();
        map.dragging.enable();
        map.doubleClickZoom.enable();
        map.boxZoom.enable();
        map.touchZoom.enable();
        background.remove();
        $('.top_menu').show();
        $('.switch_group').show();
        $('.button_group').show();
        $('.marker-cluster').show();
    },
    showTransparentBg(map){
        map.dragging.disable();
        map.doubleClickZoom.disable();
        map.boxZoom.disable();
        map.touchZoom.disable();
        map.scrollWheelZoom.disable();
        let imageBounds = [map.getCenter()];
        let options = {
            'zIndex' : 2000,
            'className' : ' leaflet-tile-transparent',
            'crossOrigin' : true
        };
        let background = L.imageOverlay('', imageBounds ,options).addTo(map);
        background.setBounds(map.getBounds());
        map.on('resize',function () {
            if($('.leaflet-tile-transparent').length > 0){
                map.dragging.disable();
                map.doubleClickZoom.disable();
                map.boxZoom.disable();
                map.touchZoom.disable();
                map.scrollWheelZoom.disable();
                background.setBounds(map.getBounds());
            }else {
                map.scrollWheelZoom.enable();
                map.dragging.enable();
                map.doubleClickZoom.enable();
                map.boxZoom.enable();
                map.touchZoom.enable();
            }
        });
        map.on('move',function () {
            background.setBounds(map.getBounds());
        });

        return background;
    },
    hideTransparentBg(map,background){
        map.scrollWheelZoom.enable();
        map.dragging.enable();
        map.doubleClickZoom.enable();
        map.boxZoom.enable();
        map.touchZoom.enable();
        background.remove();
    },
    changeIcon(marker,latlng,options){
        let myIcon = L.divIcon(options);
        marker.setIcon(myIcon);
        marker.setLatLng(latlng);
        return marker;
    },
    drawPolygon(map,latlngs,option,fitBounds,callBack){
        let polygon = L.polygon(latlngs, option).addTo(map);
        if(fitBounds){
            map.fitBounds(polygon.getBounds());
        }
        if(callBack){
            callBack();
        }
        return polygon;
    },
    initPolygon(map){
        let editableLayers = new L.FeatureGroup();
        map.addLayer(editableLayers);
        let options = {
            position: 'topright',
            draw: {
                polyline:false,
                marker:false,
                polygon: false,
                circle: false, // Turns off this drawing tool
                rectangle: {
                    shapeOptions: {
                        clickable: false
                    }
                },
                circlemarker: false
            },
            edit: {
                featureGroup: editableLayers, //REQUIRED!!
                remove: true
            }
        };

        let drawControl = new L.Control.Draw(options);
        map.addControl(drawControl);

        map.on(L.Draw.Event.CREATED, function (e) {
            let type = e.layerType,
                layer = e.layer;
            editableLayers.addLayer(layer);
        });

        $('.leaflet-draw').hide();
    },
    startPolygon(){
        $(".leaflet-draw-draw-rectangle").children('span').click();
    },
    cancelPolygon(){
        if($(".leaflet-draw-actions").children('li').children('a').children('span').length==0){
            $(".leaflet-draw-actions").children('li').children('a').append('<span>cancel</span>');
            $(".leaflet-draw-actions").children('li').children('a').children('span').click();
        }else {
            $(".leaflet-draw-actions").children('li').children('a').children('span').click();
        }
    },
    removePolygon(layer){
        layer.remove();
    },
    endRemovePolygon(){
        if($('.leaflet-draw-actions-bottom').children('li:first').children('a').children('span').length==0){
            $('.leaflet-draw-actions-bottom').children('li:first').children('a').append('<span>save</span>');
            $('.leaflet-draw-actions-bottom').children('li:first').children('a').children('span').click();
        }else {
            $('.leaflet-draw-actions-bottom').children('li:first').children('a').children('span').click();
        }
    },
    changeContainerBg(url){
        $('.leaflet-container').css("background-image",'url('+url+')');
    },
    showMarkerList(map,callBack){
        let _this = this;
        let flag = 0;
        let bounds;
        let rect;
        let rectLayer;
        map.off("mousemove");
        map.on("mousemove", function (event) {
            if(flag == 0){
                let first_latlng = event.latlng;
                let first_point = map.latLngToLayerPoint(first_latlng);
                let first_pointRT = L.point(first_point.x+50,first_point.y+50);
                let first_pointLB = L.point(first_point.x-50,first_point.y-50);
                bounds = L.bounds(first_pointRT,first_pointLB);
            }
            flag = 1;
            if(bounds.contains(event.containerPoint)){
            }else {
                let latlng = event.latlng;
                let point = map.latLngToLayerPoint(latlng);
                let pointRT = L.point(point.x+50,point.y+50);
                let pointLB = L.point(point.x-50,point.y-50);
                bounds = L.bounds(pointRT,pointLB);
                let latlngRT = map.layerPointToLatLng(pointRT);
                let latlngLB = map.layerPointToLatLng(pointLB);
                rect = L.rectangle([latlngRT,latlngLB], {color: "#ff7800", weight: 1});
                rect.on('popupopen',function () {
                    map.off('mousemove');
                });
                rect.on('popupclose',function () {
                    rectLayer.remove();
                    _this.showMarkerList(map,callBack);
                });
                let layers = [];
                map.eachLayer(function (layer) {
                    if(layer._icon!=undefined&&$(layer._icon).hasClass('leaflet-marker-icon')&&(!$(layer._icon).hasClass('my-cross-icon'))){
                        if(!$(layer._icon).hasClass('marker-cluster')){
                            if(bounds.contains(map.latLngToLayerPoint(layer._latlng))){
                                layers.push(layer);
                            }
                        }else {
                            if(bounds.contains(map.latLngToLayerPoint(layer._latlng))){
                                $.each(layer.getAllChildMarkers(),function (i,e) {
                                    layers.push(this);
                                });
                            }
                        }
                    }
                });
                if(layers.length > 0){
                    if(map.hasLayer(rectLayer)){
                        rectLayer.setBounds([latlngRT,latlngLB]);
                    }else {
                        rectLayer = rect.addTo(map);
                    }
                }else {
                    if(map.hasLayer(rectLayer)){
                        rectLayer.remove();
                    }
                }
                if(callBack){
                    callBack(layers,bounds,rect,rectLayer,latlngRT,latlngLB);
                }
            }
        });

    },

    showMarkerList2(map,callBack){
        let layers = [];
        let bounds;
        let rect;
        let rectLayer;
        map.eachLayer(function (layer) {
            if(layer._icon!=undefined&&$(layer._icon).hasClass('leaflet-marker-icon')&&(!$(layer._icon).hasClass('my-cross-icon'))){
                if(!$(layer._icon).hasClass('marker-cluster')){
                    layer.on('mouseover',function () {
                        let latlng = layer._latlng;
                        let point = map.latLngToLayerPoint(latlng);
                        let pointRT = L.point(point.x+50,point.y+50);
                        let pointLB = L.point(point.x-50,point.y-50);
                        bounds = L.bounds(pointRT,pointLB);
                        let latlngRT = map.layerPointToLatLng(pointRT);
                        let latlngLB = map.layerPointToLatLng(pointLB);
                        rect = L.rectangle([latlngRT,latlngLB], {color: "#ff7800", weight: 1});
                    })
                }else {
                    $.each(layer.getAllChildMarkers(),function (i,e) {
                        e.on('mouseover',function () {

                        })
                    });
                }
            }
        });
    },
    closeMarkerList(map,callback){
        map.off('mousemove');
        if(callback){
            callback();
        }
    },
    drawCircle(map,latlng,options,callback){
        let circle = L.circle(latlng,options).addTo(map);
        if(callback){
            callback();
        }
        return circle;
    },
    pip(statesData){
        let leafletPip = require('leaflet-pip');
        let gjLayer = L.geoJson(statesData);
        let results = leafletPip.pointInLayer([-88,38],gjLayer);
        return results;
    },
    coverTips(map,markers,latlng,callback){
        let allBounds = [];
        let size;
        for(let i = 0; i<markers.length; i++){
            let point = map.latLngToLayerPoint(markers[i].getLatLng());
            if(markers[i]._icon.childNodes.length > 0){
                if(markers[i]._icon.childNodes[0].clientWidth !=0 && markers[i]._icon.childNodes[0].clientHeight != 0){
                    size = [markers[i]._icon.childNodes[0].clientWidth,markers[i]._icon.childNodes[0].clientHeight];
                }else{
                    size = [markers[i]._icon.clientWidth,markers[i]._icon.clientHeight];
                }
            }else{
                size = [markers[i]._icon.clientWidth,markers[i]._icon.clientHeight];
            }
            let rtlatlng = map.layerPointToLatLng(L.point([point.x + size[0]/2, point.y - size[1]]));
            let lblatlng = map.layerPointToLatLng(L.point([point.x - size[0]/2, point.y ]));
            allBounds.push(L.latLngBounds(lblatlng,rtlatlng));
        }
        let mousePoint = map.latLngToLayerPoint(latlng);
        let mouseRtLatlng = map.layerPointToLatLng(L.point([mousePoint.x + 7, mousePoint.y - 14]));
        let mouseLbLatlng = map.layerPointToLatLng(L.point([mousePoint.x - 7, mousePoint.y ]));
        let mouseBounds = L.latLngBounds(mouseRtLatlng, mouseLbLatlng);
        let coverMarkers = [];
        let noCoverBounds = [];
        for(let i = 0;i<allBounds.length;i++){
            if(allBounds[i].contains(latlng)){
                coverMarkers.push(markers[i]);
            }else{
                noCoverBounds.push(allBounds[i]);
            }
        }
        let resultMarkers = [];
        getCoverMarkers(coverMarkers,noCoverBounds,markers,allBounds,resultMarkers);
        function getCoverMarkers(cMarkers,noBounds,allMarkers,allBounds,resultMarkers) {
            let markers = [];
            let bounds = noBounds;
            for(let i = 0;i<noBounds.length;i++){
                for(let j = 0;j<cMarkers.length;j++){
                    let point = map.latLngToContainerPoint(cMarkers[j].getLatLng());
                    let size = [cMarkers[j]._icon.childNodes[0].clientWidth,cMarkers[j]._icon.childNodes[0].clientHeight];
                    let rtlatlng = map.containerPointToLatLng(L.point([point.x + size[0]/2, point.y - size[1]]));
                    let lblatlng = map.containerPointToLatLng(L.point([point.x - size[0]/2, point.y ]));
                    let markerBounds = L.latLngBounds(rtlatlng, lblatlng);
                    if(noBounds[i] != undefined){
                        if(markerBounds.intersects(noBounds[i])){
                            for(let k = 0;k<allBounds.length;k++){
                                if(allBounds[k].equals(noBounds[i])){
                                    markers.push(allMarkers[k]);
                                    resultMarkers.push(allMarkers[k]);
                                }
                            }
                            bounds.splice(i, 1);
                        }
                    }
                }
            }
            if(markers.length == 0){
                return resultMarkers;
            }else {
                getCoverMarkers(markers,bounds,allMarkers,allBounds,resultMarkers);
            }
        }
        let rectMarkers = coverMarkers.concat(resultMarkers);
        let latArray = [];
        let lngArray = [];
        for(let i = 0;i<rectMarkers.length;i++){
            let point = map.latLngToContainerPoint(rectMarkers[i].getLatLng());
            size =[rectMarkers[i]._icon.childNodes[0].clientWidth,rectMarkers[i]._icon.childNodes[0].clientHeight];
            let rtlatlng = map.containerPointToLatLng(L.point([point.x + size[0]/2, point.y - size[1]/3]));
            let lblatlng = map.containerPointToLatLng(L.point([point.x - size[0]/2, point.y + size[1]/1.5]));
            latArray.push(rtlatlng.lat);
            latArray.push(lblatlng.lat);
            lngArray.push(rtlatlng.lng);
            lngArray.push(lblatlng.lng);
        }
        let maxLat = Math.max.apply(null,latArray);
        let minLat = Math.min.apply(null,latArray);
        let maxLng = Math.max.apply(null,lngArray);
        let minLng = Math.min.apply(null,lngArray);
        let rect;
        if(latArray.length > 0){
            rect = L.rectangle([[maxLat,maxLng],[minLat,minLng]],{className:'leaflet-covertip-rect'});
        }
        if(callback){
            callback(map,rectMarkers,rect);
        }
        return rectMarkers;
    },
    showPopup(map,latlng,content,popupoptions,callback){
        let popup = L.popup(popupoptions)
            .setLatLng(latlng)
            .setContent(content)
            .openOn(map);
        if(callback){
            callback();
        }
        return popup;
    },
    showHeatMap(map,data,radius,callback){
        let heat = L.heatLayer(data, {radius: radius}).addTo(map);
        if(callback){
            callback();
        }
        return heat;
    },
    marsTobaidu(mars_point) {
        let x_pi=3.14159265358979324 * 3000.0 / 180.0;
        let baidu_point = {lon: 0, lat: 0};
        let x = mars_point[1];
        let y = mars_point[0];
        let z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
        let theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
        baidu_point.lon = z * Math.cos(theta) + 0.0065;
        baidu_point.lat = z * Math.sin(theta) + 0.006;
        return baidu_point;
    },
    changeToMapbox(map){
        map.eachLayer(function (layer) {
            if(layer._url){
                map.removeLayer(layer);
            }
        });
        let token = 'pk.eyJ1IjoiZW1peWFnbSIsImEiOiJjajdsazVkdWsxMG12MzJvNnF4dWE4dzdkIn0.95qn2oWmFfBAZsHMzO42vQ';
        let gl = L.mapboxGL({
            accessToken: token,
            style: {
                "version": 8,
                //      style: 'mapbox://styles/mapbox/basic-v9',
                //      "sprite": "mapbox://sprites/mapbox/streets-v8",
                "sources": {
                    "gaode-tiles": {
                        "type": "raster",
                        'tiles': [
                            "http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
                        ],
                        'tileSize': 256
                    }
                },
                "layers": [{
                    "id": "simple-tiles",
                    "type": "raster",
                    "source": "gaode-tiles",
                    "minzoom": 0,
                    "maxzoom": 22
                }]
            },
            center: [30, 104],
            zoom: 5,
            pitch: 40.5,
        }).addTo(map);
    },
    drawDeckGl(){
        const GEOJSON =
            {"type": "FeatureCollection",
                "features":
                    [
                        {"type": "Feature","properties":{"id":"65","size":"550","name":"新疆维吾尔自治区","cp":[84.9023,42.148],"childNum":18},"geometry":{"type":"Polygon","coordinates":[[[96.416,42.7588],[96.416,42.7148],[95.9766,42.4951],[96.0645,42.3193],[96.2402,42.2314],[95.9766,41.9238],[95.2734,41.6162],[95.1855,41.792],[94.5703,41.4844],[94.043,41.0889],[93.8672,40.6934],[93.0762,40.6494],[92.6367,39.6387],[92.373,39.3311],[92.373,39.1113],[92.373,39.0234],[90.1758,38.4961],[90.3516,38.2324],[90.6152,38.3203],[90.5273,37.8369],[91.0547,37.4414],[91.3184,37.0898],[90.7031,36.7822],[90.791,36.6064],[91.0547,36.5186],[91.0547,36.0791],[90.8789,36.0352],[90,36.2549],[89.9121,36.0791],[89.7363,36.0791],[89.209,36.2988],[88.7695,36.3428],[88.5938,36.4746],[87.3633,36.4307],[86.2207,36.167],[86.1328,35.8594],[85.6055,35.6836],[85.0781,35.7275],[84.1992,35.376],[83.1445,35.4199],[82.8809,35.6836],[82.4414,35.7275],[82.002,35.332],[81.6504,35.2441],[80.4199,35.4199],[80.2441,35.2881],[80.332,35.1563],[80.2441,35.2002],[79.8926,34.8047],[79.8047,34.4971],[79.1016,34.4531],[79.0137,34.3213],[78.2227,34.7168],[78.0469,35.2441],[78.0469,35.5078],[77.4316,35.4639],[76.8164,35.6396],[76.5527,35.8594],[76.2012,35.8154],[75.9375,36.0352],[76.0254,36.4746],[75.8496,36.6943],[75.498,36.7383],[75.4102,36.958],[75.0586,37.002],[74.8828,36.9141],[74.7949,37.0459],[74.5313,37.0898],[74.5313,37.2217],[74.8828,37.2217],[75.1465,37.4414],[74.8828,37.5732],[74.9707,37.749],[74.8828,38.4521],[74.3555,38.6719],[74.1797,38.6719],[74.0918,38.54],[73.8281,38.584],[73.7402,38.8477],[73.8281,38.9795],[73.4766,39.375],[73.916,39.5068],[73.916,39.6826],[73.8281,39.7705],[74.0039,40.0342],[74.8828,40.3418],[74.7949,40.5176],[75.2344,40.4297],[75.5859,40.6494],[75.7617,40.2979],[76.377,40.3857],[76.9043,41.001],[77.6074,41.001],[78.1348,41.2207],[78.1348,41.3965],[80.1563,42.0557],[80.2441,42.2754],[80.1563,42.627],[80.2441,42.8467],[80.5078,42.8906],[80.4199,43.0664],[80.7715,43.1982],[80.4199,44.165],[80.4199,44.6045],[79.9805,44.8242],[79.9805,44.9561],[81.7383,45.3955],[82.0898,45.2197],[82.5293,45.2197],[82.2656,45.6592],[83.0566,47.2412],[83.6719,47.0215],[84.7266,47.0215],[84.9023,46.8896],[85.5176,47.0654],[85.6934,47.2852],[85.5176,48.1201],[85.7813,48.4277],[86.5723,48.5596],[86.8359,48.8232],[86.748,48.9551],[86.8359,49.1309],[87.8027,49.1748],[87.8906,48.999],[87.7148,48.9111],[88.0664,48.7354],[87.9785,48.6035],[88.5059,48.3838],[88.6816,48.1641],[89.1211,47.9883],[89.5605,48.0322],[89.7363,47.8564],[90.0879,47.8564],[90.3516,47.6807],[90.5273,47.2412],[90.8789,46.9775],[91.0547,46.582],[90.8789,46.3184],[91.0547,46.0107],[90.7031,45.7471],[90.7031,45.5273],[90.8789,45.2197],[91.582,45.0879],[93.5156,44.9561],[94.7461,44.3408],[95.3613,44.2969],[95.3613,44.0332],[95.5371,43.9014],[95.8887,43.2422],[96.3281,42.9346],[96.416,42.7588]]]}},
                        {"type": "Feature","properties":{"id":"54","size":"550","name":"西藏自治区","cp":[87.8695,31.6846],"childNum":7},"geometry":{"type":"Polygon","coordinates":[[[79.0137,34.3213],[79.1016,34.4531],[79.8047,34.4971],[79.8926,34.8047],[80.2441,35.2002],[80.332,35.1563],[80.2441,35.2881],[80.4199,35.4199],[81.6504,35.2441],[82.002,35.332],[82.4414,35.7275],[82.8809,35.6836],[83.1445,35.4199],[84.1992,35.376],[85.0781,35.7275],[85.6055,35.6836],[86.1328,35.8594],[86.2207,36.167],[87.3633,36.4307],[88.5938,36.4746],[88.7695,36.3428],[89.209,36.2988],[89.7363,36.0791],[89.3848,36.0352],[89.4727,35.9033],[89.7363,35.7715],[89.7363,35.4199],[89.4727,35.376],[89.4727,35.2441],[89.5605,34.8926],[89.8242,34.8486],[89.7363,34.6729],[89.8242,34.3652],[89.6484,34.0137],[90.0879,33.4863],[90.7031,33.1348],[91.4063,33.1348],[91.9336,32.8271],[92.1973,32.8271],[92.2852,32.7393],[92.9883,32.7393],[93.5156,32.4756],[93.7793,32.5635],[94.1309,32.4316],[94.6582,32.6074],[95.1855,32.4316],[95.0098,32.2998],[95.1855,32.3438],[95.2734,32.2119],[95.3613,32.168],[95.3613,31.9922],[95.4492,31.8164],[95.8008,31.6846],[95.9766,31.8164],[96.1523,31.5967],[96.2402,31.9482],[96.5039,31.7285],[96.8555,31.6846],[96.7676,31.9922],[97.2949,32.0801],[97.3828,32.5635],[97.7344,32.5195],[98.1738,32.3438],[98.4375,31.8604],[98.877,31.4209],[98.6133,31.2012],[98.9648,30.7617],[99.1406,29.2676],[98.9648,29.1357],[98.9648,28.8281],[98.7891,28.8721],[98.7891,29.0039],[98.7012,28.916],[98.6133,28.5205],[98.7891,28.3447],[98.7012,28.2129],[98.3496,28.125],[98.2617,28.3887],[98.1738,28.125],[97.5586,28.5205],[97.2949,28.0811],[97.3828,27.9053],[97.0313,27.7295],[96.5039,28.125],[95.7129,28.2568],[95.3613,28.125],[95.2734,27.9492],[94.2188,27.5537],[93.8672,27.0264],[93.6035,26.9385],[92.1094,26.8506],[92.0215,27.4658],[91.582,27.5537],[91.582,27.9053],[91.4063,28.0371],[91.0547,27.8613],[90.7031,28.0811],[89.8242,28.2129],[89.6484,28.1689],[89.1211,27.5977],[89.1211,27.334],[89.0332,27.2021],[88.7695,27.4219],[88.8574,27.9932],[88.6816,28.125],[88.1543,27.9053],[87.8906,27.9492],[87.7148,27.8174],[87.0996,27.8174],[86.748,28.125],[86.5723,28.125],[86.4844,27.9053],[86.1328,28.125],[86.0449,27.9053],[85.6934,28.3447],[85.6055,28.2568],[85.166,28.3447],[85.166,28.6523],[84.9023,28.5645],[84.4629,28.7402],[84.2871,28.8721],[84.1992,29.2236],[84.1113,29.2676],[83.584,29.1797],[83.2324,29.5752],[82.1777,30.0586],[82.0898,30.3223],[81.3867,30.3662],[81.2109,30.0146],[81.0352,30.2344],[80.0684,30.5859],[79.7168,30.9375],[79.0137,31.0693],[78.75,31.333],[78.8379,31.5967],[78.6621,31.8164],[78.75,31.9043],[78.4863,32.124],[78.3984,32.5195],[78.75,32.6953],[78.9258,32.3438],[79.2773,32.5635],[79.1016,33.1787],[78.6621,33.6621],[78.6621,34.1016],[78.9258,34.1455],[79.0137,34.3213]]]}},
                        {"type": "Feature","properties":{"id":"15","size":"450","name":"内蒙古自治区","cp":[112.5977,46.3408],"childNum":12},"geometry":{"type":"Polygon","coordinates":[[[97.207,42.8027],[99.4922,42.583],[100.8105,42.6709],[101.7773,42.4951],[102.041,42.2314],[102.7441,42.1436],[103.3594,41.8799],[103.8867,41.792],[104.502,41.8799],[104.502,41.6602],[105.0293,41.5723],[105.7324,41.9238],[107.4023,42.4512],[109.4238,42.4512],[110.3906,42.7588],[111.0059,43.3301],[111.9727,43.6816],[111.9727,43.8135],[111.4453,44.3848],[111.7969,45],[111.9727,45.0879],[113.6426,44.7363],[114.1699,44.9561],[114.5215,45.3955],[115.6641,45.4395],[116.1914,45.7031],[116.2793,45.9668],[116.543,46.2744],[117.334,46.3623],[117.4219,46.582],[117.7734,46.5381],[118.3008,46.7578],[118.7402,46.7139],[118.916,46.7578],[119.0918,46.6699],[119.707,46.626],[119.9707,46.7139],[119.707,47.1973],[118.4766,47.9883],[117.8613,48.0322],[117.334,47.6807],[116.8066,47.9004],[116.1914,47.8564],[115.9277,47.6807],[115.5762,47.9004],[115.4883,48.1641],[115.8398,48.252],[115.8398,48.5596],[116.7188,49.834],[117.7734,49.5264],[118.5645,49.9219],[119.2676,50.0977],[119.3555,50.3174],[119.1797,50.3613],[119.5313,50.7568],[119.5313,50.8887],[119.707,51.0645],[120.1465,51.6797],[120.6738,51.9434],[120.7617,52.1191],[120.7617,52.251],[120.5859,52.3389],[120.6738,52.5146],[120.4102,52.6465],[120.0586,52.6025],[120.0586,52.7344],[120.8496,53.2617],[121.4648,53.3496],[121.8164,53.042],[121.2012,52.5586],[121.6406,52.4268],[121.7285,52.2949],[121.9922,52.2949],[122.168,52.5146],[122.6953,52.251],[122.6074,52.0752],[122.959,51.3281],[123.3105,51.2402],[123.6621,51.3721],[124.3652,51.2842],[124.541,51.3721],[124.8926,51.3721],[125.0684,51.6357],[125.332,51.6357],[126.0352,51.0205],[125.7715,50.7568],[125.7715,50.5371],[125.332,50.1416],[125.1563,49.834],[125.2441,49.1748],[124.8047,49.1309],[124.4531,48.1201],[124.2773,48.5156],[122.4316,47.373],[123.0469,46.7139],[123.3984,46.8896],[123.3984,46.9775],[123.4863,46.9775],[123.5742,46.8457],[123.5742,46.8896],[123.5742,46.6699],[123.0469,46.582],[123.2227,46.2305],[122.7832,46.0107],[122.6953,45.7031],[122.4316,45.8789],[122.2559,45.791],[121.8164,46.0107],[121.7285,45.7471],[121.9043,45.7031],[122.2559,45.2637],[122.0801,44.8682],[122.3438,44.2529],[123.1348,44.4727],[123.4863,43.7256],[123.3105,43.5059],[123.6621,43.374],[123.5742,43.0225],[123.3105,42.9785],[123.1348,42.8027],[122.7832,42.7148],[122.3438,42.8467],[122.3438,42.6709],[121.9922,42.7148],[121.7285,42.4512],[121.4648,42.4951],[120.498,42.0996],[120.1465,41.7041],[119.8828,42.1875],[119.5313,42.3633],[119.3555,42.2754],[119.2676,41.7041],[119.4434,41.6162],[119.2676,41.3086],[118.3887,41.3086],[118.125,41.748],[118.3008,41.792],[118.3008,42.0996],[118.125,42.0557],[117.9492,42.2314],[118.0371,42.4072],[117.7734,42.627],[117.5098,42.583],[117.334,42.4512],[116.8945,42.4072],[116.8066,42.0117],[116.2793,42.0117],[116.0156,41.792],[115.9277,41.9238],[115.2246,41.5723],[114.9609,41.6162],[114.873,42.0996],[114.5215,42.1436],[114.1699,41.792],[114.2578,41.5723],[113.9063,41.4404],[113.9941,41.2207],[113.9063,41.1328],[114.082,40.7373],[114.082,40.5176],[113.8184,40.5176],[113.5547,40.3418],[113.2031,40.3857],[112.7637,40.166],[112.3242,40.2539],[111.9727,39.5947],[111.4453,39.6387],[111.3574,39.4189],[111.0938,39.375],[111.0938,39.5947],[110.6543,39.2871],[110.127,39.4629],[110.2148,39.2871],[109.8633,39.2432],[109.9512,39.1553],[108.9844,38.3203],[109.0723,38.0127],[108.8965,37.9688],[108.8086,38.0127],[108.7207,37.7051],[108.1934,37.6172],[107.666,37.8809],[107.3145,38.1006],[106.7871,38.1885],[106.5234,38.3203],[106.9629,38.9795],[106.7871,39.375],[106.3477,39.2871],[105.9082,38.7158],[105.8203,37.793],[104.3262,37.4414],[103.4473,37.8369],[103.3594,38.0127],[103.5352,38.1445],[103.4473,38.3643],[104.2383,38.9795],[104.0625,39.4189],[103.3594,39.3311],[103.0078,39.1113],[102.4805,39.2432],[101.8652,39.1113],[102.041,38.8916],[101.7773,38.6719],[101.3379,38.7598],[101.25,39.0234],[100.9863,38.9355],[100.8105,39.4189],[100.5469,39.4189],[100.0195,39.7705],[99.4922,39.8584],[100.1074,40.2539],[100.1953,40.6494],[99.9316,41.001],[99.2285,40.8691],[99.0527,40.6934],[98.9648,40.7813],[98.7891,40.6055],[98.5254,40.7373],[98.6133,40.6494],[98.3496,40.5615],[98.3496,40.9131],[97.4707,41.4844],[97.8223,41.6162],[97.8223,41.748],[97.207,42.8027]]]}},
                        {"type": "Feature","properties":{"id":"63","size":"800","name":"青海省","cp":[95.2402,35.4199],"childNum":8},"geometry":{"type":"Polygon","coordinates":[[[89.7363,36.0791],[89.9121,36.0791],[90,36.2549],[90.8789,36.0352],[91.0547,36.0791],[91.0547,36.5186],[90.791,36.6064],[90.7031,36.7822],[91.3184,37.0898],[91.0547,37.4414],[90.5273,37.8369],[90.6152,38.3203],[90.3516,38.2324],[90.1758,38.4961],[92.373,39.0234],[92.373,39.1113],[93.1641,39.1992],[93.1641,38.9795],[93.6914,38.9355],[93.8672,38.7158],[94.3066,38.7598],[94.5703,38.3643],[95.0098,38.4082],[95.4492,38.2764],[95.7129,38.3643],[96.2402,38.1006],[96.416,38.2324],[96.6797,38.1885],[96.6797,38.4521],[97.1191,38.584],[97.0313,39.1992],[98.1738,38.8037],[98.3496,39.0234],[98.6133,38.9355],[98.7891,39.0674],[99.1406,38.9355],[99.8438,38.3643],[100.1953,38.2764],[100.0195,38.4521],[100.1074,38.4961],[100.459,38.2764],[100.7227,38.2324],[101.1621,37.8369],[101.5137,37.8809],[101.7773,37.6172],[101.9531,37.7051],[102.1289,37.4414],[102.5684,37.1777],[102.4805,36.958],[102.6563,36.8262],[102.5684,36.7383],[102.832,36.3428],[103.0078,36.2549],[102.9199,36.0791],[102.9199,35.9033],[102.6563,35.7715],[102.832,35.5957],[102.4805,35.5957],[102.3047,35.4199],[102.3926,35.2002],[101.9531,34.8486],[101.9531,34.6289],[102.2168,34.4092],[102.1289,34.2773],[101.6895,34.1016],[100.9863,34.3652],[100.8105,34.2773],[101.25,33.6621],[101.5137,33.7061],[101.6016,33.5303],[101.7773,33.5303],[101.6895,33.3105],[101.7773,33.2227],[101.6016,33.1348],[101.1621,33.2227],[101.25,32.6953],[100.7227,32.6514],[100.7227,32.5195],[100.3711,32.7393],[100.1074,32.6514],[100.1074,32.8711],[99.8438,33.0029],[99.7559,32.7393],[99.2285,32.915],[99.2285,33.0469],[98.877,33.1787],[98.4375,34.0576],[97.8223,34.1895],[97.6465,34.1016],[97.7344,33.9258],[97.3828,33.8818],[97.4707,33.5742],[97.7344,33.3984],[97.3828,32.8711],[97.4707,32.6953],[97.7344,32.5195],[97.3828,32.5635],[97.2949,32.0801],[96.7676,31.9922],[96.8555,31.6846],[96.5039,31.7285],[96.2402,31.9482],[96.1523,31.5967],[95.9766,31.8164],[95.8008,31.6846],[95.4492,31.8164],[95.3613,31.9922],[95.3613,32.168],[95.2734,32.2119],[95.1855,32.3438],[95.0098,32.2998],[95.1855,32.4316],[94.6582,32.6074],[94.1309,32.4316],[93.7793,32.5635],[93.5156,32.4756],[92.9883,32.7393],[92.2852,32.7393],[92.1973,32.8271],[91.9336,32.8271],[91.4063,33.1348],[90.7031,33.1348],[90.0879,33.4863],[89.6484,34.0137],[89.8242,34.3652],[89.7363,34.6729],[89.8242,34.8486],[89.5605,34.8926],[89.4727,35.2441],[89.4727,35.376],[89.7363,35.4199],[89.7363,35.7715],[89.4727,35.9033],[89.3848,36.0352],[89.7363,36.0791]]]}},
                        {"type": "Feature","properties":{"id":"51","size":"900","name":"四川省","cp":[101.9199,30.1904],"childNum":21},"geometry":{"type":"Polygon","coordinates":[[[101.7773,33.5303],[101.8652,33.5742],[101.9531,33.4424],[101.8652,33.0908],[102.4805,33.4424],[102.2168,33.9258],[102.9199,34.3213],[103.0957,34.1895],[103.1836,33.7939],[104.1504,33.6182],[104.2383,33.3984],[104.4141,33.3105],[104.3262,33.2227],[104.4141,33.0469],[104.3262,32.8711],[104.4141,32.7393],[105.2051,32.6074],[105.3809,32.7393],[105.3809,32.8711],[105.4688,32.915],[105.5566,32.7393],[106.084,32.8711],[106.084,32.7393],[106.3477,32.6514],[107.0508,32.6953],[107.1387,32.4756],[107.2266,32.4316],[107.4023,32.5195],[108.0176,32.168],[108.2813,32.2559],[108.5449,32.2119],[108.3691,32.168],[108.2813,31.9043],[108.5449,31.6846],[108.1934,31.5088],[107.9297,30.8496],[107.4902,30.8496],[107.4023,30.7617],[107.4902,30.6299],[107.0508,30.0146],[106.7871,30.0146],[106.6113,30.3223],[106.2598,30.1904],[105.8203,30.4541],[105.6445,30.2783],[105.5566,30.1025],[105.7324,29.8828],[105.293,29.5313],[105.4688,29.3115],[105.7324,29.2676],[105.8203,28.96],[106.2598,28.8721],[106.3477,28.5205],[105.9961,28.7402],[105.6445,28.4326],[105.9082,28.125],[106.1719,28.125],[106.3477,27.8174],[105.6445,27.6416],[105.5566,27.7734],[105.293,27.7295],[105.2051,27.9932],[105.0293,28.0811],[104.8535,27.9053],[104.4141,27.9492],[104.3262,28.0371],[104.4141,28.125],[104.4141,28.2568],[104.2383,28.4326],[104.4141,28.6084],[103.8867,28.6523],[103.7988,28.3008],[103.4473,28.125],[103.4473,27.7734],[102.9199,27.29],[103.0078,26.3672],[102.6563,26.1914],[102.5684,26.3672],[102.1289,26.1035],[101.8652,26.0596],[101.6016,26.2354],[101.6895,26.3672],[101.4258,26.5869],[101.4258,26.8066],[101.4258,26.7188],[101.1621,27.0264],[101.1621,27.1582],[100.7227,27.8613],[100.3711,27.8174],[100.2832,27.7295],[100.0195,28.125],[100.1953,28.3447],[99.668,28.8281],[99.4043,28.5205],[99.4043,28.1689],[99.2285,28.3008],[99.1406,29.2676],[98.9648,30.7617],[98.6133,31.2012],[98.877,31.4209],[98.4375,31.8604],[98.1738,32.3438],[97.7344,32.5195],[97.4707,32.6953],[97.3828,32.8711],[97.7344,33.3984],[97.4707,33.5742],[97.3828,33.8818],[97.7344,33.9258],[97.6465,34.1016],[97.8223,34.1895],[98.4375,34.0576],[98.877,33.1787],[99.2285,33.0469],[99.2285,32.915],[99.7559,32.7393],[99.8438,33.0029],[100.1074,32.8711],[100.1074,32.6514],[100.3711,32.7393],[100.7227,32.5195],[100.7227,32.6514],[101.25,32.6953],[101.1621,33.2227],[101.6016,33.1348],[101.7773,33.2227],[101.6895,33.3105],[101.7773,33.5303]]]}},
                        {"type": "Feature","properties":{"id":"23","size":"700","name":"黑龙江省","cp":[126.1445,48.7156],"childNum":13},"geometry":{"type":"Polygon","coordinates":[[[121.4648,53.3496],[123.6621,53.5693],[124.8926,53.0859],[125.0684,53.2178],[125.5957,53.0859],[125.6836,52.9102],[126.123,52.7783],[126.0352,52.6025],[126.2109,52.5146],[126.3867,52.2949],[126.3867,52.207],[126.5625,52.1631],[126.4746,51.9434],[126.9141,51.3721],[126.8262,51.2842],[127.002,51.3281],[126.9141,51.1084],[127.2656,50.7568],[127.3535,50.2734],[127.6172,50.2295],[127.5293,49.8779],[127.793,49.6143],[128.7598,49.5703],[129.1113,49.3506],[129.4629,49.4385],[130.2539,48.8672],[130.6934,48.8672],[130.5176,48.6475],[130.8691,48.2959],[130.6934,48.1201],[131.0449,47.6807],[132.5391,47.7246],[132.627,47.9443],[133.0664,48.1201],[133.5059,48.1201],[134.209,48.3838],[135.0879,48.4277],[134.7363,48.252],[134.5605,47.9883],[134.7363,47.6807],[134.5605,47.4609],[134.3848,47.4609],[134.209,47.2852],[134.209,47.1533],[133.8574,46.5381],[133.9453,46.2744],[133.5059,45.835],[133.418,45.5713],[133.2422,45.5273],[133.0664,45.1318],[132.8906,45.0439],[131.9238,45.3516],[131.5723,45.0439],[131.0449,44.8682],[131.3086,44.0771],[131.2207,43.7256],[131.3086,43.4619],[130.8691,43.418],[130.5176,43.6377],[130.3418,43.9893],[129.9902,43.8574],[129.9023,44.0332],[129.8145,43.9014],[129.2871,43.8135],[129.1992,43.5938],[128.8477,43.5498],[128.4961,44.165],[128.4082,44.4727],[128.0566,44.3408],[128.0566,44.1211],[127.7051,44.1211],[127.5293,44.6045],[127.0898,44.6045],[127.002,44.7803],[127.0898,45],[126.9141,45.1318],[126.5625,45.2637],[126.0352,45.1758],[125.7715,45.3076],[125.6836,45.5273],[125.0684,45.3955],[124.8926,45.5273],[124.3652,45.4395],[124.0137,45.7471],[123.9258,46.2305],[123.2227,46.2305],[123.0469,46.582],[123.5742,46.6699],[123.5742,46.8896],[123.5742,46.8457],[123.4863,46.9775],[123.3984,46.9775],[123.3984,46.8896],[123.0469,46.7139],[122.4316,47.373],[124.2773,48.5156],[124.4531,48.1201],[124.8047,49.1309],[125.2441,49.1748],[125.1563,49.834],[125.332,50.1416],[125.7715,50.5371],[125.7715,50.7568],[126.0352,51.0205],[125.332,51.6357],[125.0684,51.6357],[124.8926,51.3721],[124.541,51.3721],[124.3652,51.2842],[123.6621,51.3721],[123.3105,51.2402],[122.959,51.3281],[122.6074,52.0752],[122.6953,52.251],[122.168,52.5146],[121.9922,52.2949],[121.7285,52.2949],[121.6406,52.4268],[121.2012,52.5586],[121.8164,53.042],[121.4648,53.3496]]]}},
                        {"type": "Feature","properties":{"id":"62","size":"690","name":"甘肃省","cp":[99.7129,38.166],"childNum":14},"geometry":{"type":"Polygon","coordinates":[[[96.416,42.7148],[97.207,42.8027],[97.8223,41.748],[97.8223,41.6162],[97.4707,41.4844],[98.3496,40.9131],[98.3496,40.5615],[98.6133,40.6494],[98.5254,40.7373],[98.7891,40.6055],[98.9648,40.7813],[99.0527,40.6934],[99.2285,40.8691],[99.9316,41.001],[100.1953,40.6494],[100.1074,40.2539],[99.4922,39.8584],[100.0195,39.7705],[100.5469,39.4189],[100.8105,39.4189],[100.9863,38.9355],[101.25,39.0234],[101.3379,38.7598],[101.7773,38.6719],[102.041,38.8916],[101.8652,39.1113],[102.4805,39.2432],[103.0078,39.1113],[103.3594,39.3311],[104.0625,39.4189],[104.2383,38.9795],[103.4473,38.3643],[103.5352,38.1445],[103.3594,38.0127],[103.4473,37.8369],[104.3262,37.4414],[104.5898,37.4414],[104.5898,37.2217],[104.8535,37.2217],[105.293,36.8262],[105.2051,36.6943],[105.4688,36.123],[105.293,35.9912],[105.3809,35.7715],[105.7324,35.7275],[105.8203,35.5518],[105.9961,35.4639],[105.9082,35.4199],[105.9961,35.4199],[106.084,35.376],[106.2598,35.4199],[106.3477,35.2441],[106.5234,35.332],[106.4355,35.6836],[106.6992,35.6836],[106.9629,35.8154],[106.875,36.123],[106.5234,36.2549],[106.5234,36.4746],[106.4355,36.5625],[106.6113,36.7822],[106.6113,37.0898],[107.3145,37.0898],[107.3145,36.9141],[108.7207,36.3428],[108.6328,35.9912],[108.5449,35.8594],[108.6328,35.5518],[108.5449,35.2881],[107.7539,35.2881],[107.7539,35.1123],[107.8418,35.0244],[107.666,34.9365],[107.2266,34.8926],[106.9629,35.0684],[106.6113,35.0684],[106.5234,34.7607],[106.3477,34.585],[106.6992,34.3213],[106.5234,34.2773],[106.6113,34.1455],[106.4355,33.9258],[106.5234,33.5303],[105.9961,33.6182],[105.7324,33.3984],[105.9961,33.1787],[105.9082,33.0029],[105.4688,32.915],[105.3809,32.8711],[105.3809,32.7393],[105.2051,32.6074],[104.4141,32.7393],[104.3262,32.8711],[104.4141,33.0469],[104.3262,33.2227],[104.4141,33.3105],[104.2383,33.3984],[104.1504,33.6182],[103.1836,33.7939],[103.0957,34.1895],[102.9199,34.3213],[102.2168,33.9258],[102.4805,33.4424],[101.8652,33.0908],[101.9531,33.4424],[101.8652,33.5742],[101.7773,33.5303],[101.6016,33.5303],[101.5137,33.7061],[101.25,33.6621],[100.8105,34.2773],[100.9863,34.3652],[101.6895,34.1016],[102.1289,34.2773],[102.2168,34.4092],[101.9531,34.6289],[101.9531,34.8486],[102.3926,35.2002],[102.3047,35.4199],[102.4805,35.5957],[102.832,35.5957],[102.6563,35.7715],[102.9199,35.9033],[102.9199,36.0791],[103.0078,36.2549],[102.832,36.3428],[102.5684,36.7383],[102.6563,36.8262],[102.4805,36.958],[102.5684,37.1777],[102.1289,37.4414],[101.9531,37.7051],[101.7773,37.6172],[101.5137,37.8809],[101.1621,37.8369],[100.7227,38.2324],[100.459,38.2764],[100.1074,38.4961],[100.0195,38.4521],[100.1953,38.2764],[99.8438,38.3643],[99.1406,38.9355],[98.7891,39.0674],[98.6133,38.9355],[98.3496,39.0234],[98.1738,38.8037],[97.0313,39.1992],[97.1191,38.584],[96.6797,38.4521],[96.6797,38.1885],[96.416,38.2324],[96.2402,38.1006],[95.7129,38.3643],[95.4492,38.2764],[95.0098,38.4082],[94.5703,38.3643],[94.3066,38.7598],[93.8672,38.7158],[93.6914,38.9355],[93.1641,38.9795],[93.1641,39.1992],[92.373,39.1113],[92.373,39.3311],[92.6367,39.6387],[93.0762,40.6494],[93.8672,40.6934],[94.043,41.0889],[94.5703,41.4844],[95.1855,41.792],[95.2734,41.6162],[95.9766,41.9238],[96.2402,42.2314],[96.0645,42.3193],[95.9766,42.4951],[96.416,42.7148]]]}},
                        {"type": "Feature","properties":{"id":"53","size":"1200","name":"云南省","cp":[101.0652,25.1807],"childNum":16},"geometry":{"type":"Polygon","coordinates":[[[98.1738,28.125],[98.2617,28.3887],[98.3496,28.125],[98.7012,28.2129],[98.7891,28.3447],[98.6133,28.5205],[98.7012,28.916],[98.7891,29.0039],[98.7891,28.8721],[98.9648,28.8281],[98.9648,29.1357],[99.1406,29.2676],[99.2285,28.3008],[99.4043,28.1689],[99.4043,28.5205],[99.668,28.8281],[100.1953,28.3447],[100.0195,28.125],[100.2832,27.7295],[100.3711,27.8174],[100.7227,27.8613],[101.1621,27.1582],[101.1621,27.0264],[101.4258,26.7188],[101.4258,26.8066],[101.4258,26.5869],[101.6895,26.3672],[101.6016,26.2354],[101.8652,26.0596],[102.1289,26.1035],[102.5684,26.3672],[102.6563,26.1914],[103.0078,26.3672],[102.9199,27.29],[103.4473,27.7734],[103.4473,28.125],[103.7988,28.3008],[103.8867,28.6523],[104.4141,28.6084],[104.2383,28.4326],[104.4141,28.2568],[104.4141,28.125],[104.3262,28.0371],[104.4141,27.9492],[104.8535,27.9053],[105.0293,28.0811],[105.2051,27.9932],[105.293,27.7295],[105.2051,27.3779],[104.5898,27.334],[104.4141,27.4658],[104.1504,27.2461],[103.8867,27.4219],[103.623,27.0264],[103.7109,26.9824],[103.7109,26.7627],[103.8867,26.543],[104.4141,26.6748],[104.6777,26.4111],[104.3262,25.708],[104.8535,25.2246],[104.5898,25.0488],[104.6777,24.9609],[104.502,24.7412],[104.6777,24.3457],[104.7656,24.4775],[105.0293,24.4336],[105.2051,24.082],[105.4688,24.0381],[105.5566,24.126],[105.9961,24.126],[106.1719,23.8184],[106.1719,23.5547],[105.6445,23.4229],[105.5566,23.2031],[105.293,23.3789],[104.8535,23.1592],[104.7656,22.8516],[104.3262,22.6758],[104.1504,22.8076],[103.9746,22.5439],[103.623,22.7637],[103.5352,22.5879],[103.3594,22.8076],[103.0957,22.4561],[102.4805,22.7637],[102.3047,22.4121],[101.8652,22.3682],[101.7773,22.5],[101.6016,22.1924],[101.8652,21.6211],[101.7773,21.1377],[101.6016,21.2256],[101.25,21.1816],[101.1621,21.7529],[100.6348,21.4453],[100.1074,21.4893],[99.9316,22.0605],[99.2285,22.1484],[99.4043,22.5879],[99.3164,22.7197],[99.4922,23.0713],[98.877,23.2031],[98.7012,23.9502],[98.877,24.126],[98.1738,24.082],[97.7344,23.8623],[97.5586,23.9063],[97.7344,24.126],[97.6465,24.4336],[97.5586,24.4336],[97.5586,24.7412],[97.7344,24.8291],[97.8223,25.2686],[98.1738,25.4004],[98.1738,25.6201],[98.3496,25.5762],[98.5254,25.8398],[98.7012,25.8838],[98.6133,26.0596],[98.7012,26.1475],[98.7891,26.5869],[98.7012,27.5098],[98.5254,27.6416],[98.3496,27.5098],[98.1738,28.125]]]}},
                        {"type": "Feature","properties":{"id":"45","size":"1450","name":"广西壮族自治区","cp":[107.7813,23.6426],"childNum":14},"geometry":{"type":"Polygon","coordinates":[[[104.502,24.7412],[104.6777,24.6094],[105.2051,24.9609],[105.9961,24.6533],[106.1719,24.7852],[106.1719,24.9609],[106.875,25.1807],[107.0508,25.2686],[106.9629,25.4883],[107.2266,25.6201],[107.4902,25.2246],[107.7539,25.2246],[107.8418,25.1367],[108.1055,25.2246],[108.1934,25.4443],[108.3691,25.5322],[108.6328,25.3125],[108.6328,25.5762],[109.0723,25.5322],[108.9844,25.752],[109.3359,25.708],[109.5117,26.0156],[109.7754,25.8838],[109.9512,26.1914],[110.2148,25.9717],[110.5664,26.3232],[111.1816,26.3232],[111.2695,26.2354],[111.2695,25.8838],[111.4453,25.8398],[111.0059,25.0049],[111.0938,24.9609],[111.3574,25.1367],[111.5332,24.6533],[111.709,24.7852],[112.0605,24.7412],[111.8848,24.6533],[112.0605,24.3457],[111.8848,24.2139],[111.8848,23.9941],[111.7969,23.8184],[111.6211,23.8184],[111.6211,23.6865],[111.3574,23.4668],[111.4453,23.0273],[111.2695,22.8076],[110.7422,22.5439],[110.7422,22.2803],[110.6543,22.1484],[110.3027,22.1484],[110.3027,21.8848],[109.9512,21.8408],[109.8633,21.665],[109.7754,21.6211],[109.7754,21.4014],[109.5996,21.4453],[109.1602,21.3574],[109.248,20.874],[109.0723,20.9619],[109.0723,21.5332],[108.7207,21.5332],[108.6328,21.665],[108.2813,21.4893],[107.8418,21.6211],[107.4023,21.6211],[107.0508,21.7969],[107.0508,21.9287],[106.6992,22.0166],[106.6113,22.4121],[106.7871,22.7637],[106.6992,22.8955],[105.9082,22.9395],[105.5566,23.0713],[105.5566,23.2031],[105.6445,23.4229],[106.1719,23.5547],[106.1719,23.8184],[105.9961,24.126],[105.5566,24.126],[105.4688,24.0381],[105.2051,24.082],[105.0293,24.4336],[104.7656,24.4775],[104.6777,24.3457],[104.502,24.7412]]]}},
                        {"type": "Feature","properties":{"id":"43","size":"1700","name":"湖南省","cp":[111.5332,27.3779],"childNum":14},"geometry":{"type":"Polygon","coordinates":[[[109.248,28.4766],[109.248,29.1357],[109.5117,29.6191],[109.6875,29.6191],[109.7754,29.751],[110.4785,29.6631],[110.6543,29.751],[110.4785,30.0146],[110.8301,30.1465],[111.7969,29.9268],[112.2363,29.5313],[112.5,29.6191],[112.6758,29.5752],[112.9395,29.7949],[113.0273,29.751],[112.9395,29.4873],[113.0273,29.4434],[113.5547,29.8389],[113.5547,29.707],[113.7305,29.5752],[113.6426,29.3115],[113.7305,29.0918],[113.9063,29.0479],[114.1699,28.8281],[114.082,28.5645],[114.2578,28.3447],[113.7305,27.9492],[113.6426,27.5977],[113.6426,27.3779],[113.8184,27.29],[113.7305,27.1143],[113.9063,26.9385],[113.9063,26.6309],[114.082,26.5869],[113.9941,26.1914],[114.2578,26.1475],[113.9941,26.0596],[113.9063,25.4443],[113.6426,25.3125],[113.2031,25.5322],[112.8516,25.3564],[113.0273,25.2246],[113.0273,24.9609],[112.8516,24.917],[112.5879,25.1367],[112.2363,25.1807],[112.1484,24.873],[112.0605,24.7412],[111.709,24.7852],[111.5332,24.6533],[111.3574,25.1367],[111.0938,24.9609],[111.0059,25.0049],[111.4453,25.8398],[111.2695,25.8838],[111.2695,26.2354],[111.1816,26.3232],[110.5664,26.3232],[110.2148,25.9717],[109.9512,26.1914],[109.7754,25.8838],[109.5117,26.0156],[109.4238,26.2793],[109.248,26.3232],[109.4238,26.5869],[109.3359,26.7188],[109.5117,26.8066],[109.5117,27.0264],[109.3359,27.1582],[108.8965,27.0264],[108.8086,27.1143],[109.4238,27.5977],[109.3359,27.9053],[109.3359,28.2568],[109.248,28.4766]]]}},
                        {"type": "Feature","properties":{"id":"61","size":"1150","name":"陕西省","cp":[109.5996,35.7396],"childNum":10},"geometry":{"type":"Polygon","coordinates":[[[105.4688,32.915],[105.9082,33.0029],[105.9961,33.1787],[105.7324,33.3984],[105.9961,33.6182],[106.5234,33.5303],[106.4355,33.9258],[106.6113,34.1455],[106.5234,34.2773],[106.6992,34.3213],[106.3477,34.585],[106.5234,34.7607],[106.6113,35.0684],[106.9629,35.0684],[107.2266,34.8926],[107.666,34.9365],[107.8418,35.0244],[107.7539,35.1123],[107.7539,35.2881],[108.5449,35.2881],[108.6328,35.5518],[108.5449,35.8594],[108.6328,35.9912],[108.7207,36.3428],[107.3145,36.9141],[107.3145,37.0898],[107.3145,37.6172],[107.666,37.8809],[108.1934,37.6172],[108.7207,37.7051],[108.8086,38.0127],[108.8965,37.9688],[109.0723,38.0127],[108.9844,38.3203],[109.9512,39.1553],[109.8633,39.2432],[110.2148,39.2871],[110.127,39.4629],[110.6543,39.2871],[111.0938,39.5947],[111.0938,39.375],[111.1816,39.2432],[110.918,38.7158],[110.8301,38.4961],[110.4785,38.1885],[110.4785,37.9688],[110.8301,37.6611],[110.3906,37.002],[110.4785,36.123],[110.5664,35.6396],[110.2148,34.8926],[110.2148,34.6729],[110.3906,34.585],[110.4785,34.2334],[110.6543,34.1455],[110.6543,33.8379],[111.0059,33.5303],[111.0059,33.2666],[110.7422,33.1348],[110.5664,33.2666],[110.3027,33.1787],[109.5996,33.2666],[109.4238,33.1348],[109.7754,33.0469],[109.7754,32.915],[110.127,32.7393],[110.127,32.6074],[109.6875,32.6074],[109.5117,32.4316],[109.5996,31.7285],[109.248,31.7285],[109.0723,31.9482],[108.5449,32.2119],[108.2813,32.2559],[108.0176,32.168],[107.4023,32.5195],[107.2266,32.4316],[107.1387,32.4756],[107.0508,32.6953],[106.3477,32.6514],[106.084,32.7393],[106.084,32.8711],[105.5566,32.7393],[105.4688,32.915]]]}},
                        {"type": "Feature","properties":{"id":"44","size":"1600","name":"广东省","cp":[113.4668,22.8076],"childNum":21},"geometry":{"type":"Polygon","coordinates":[[[109.7754,21.4014],[109.7754,21.6211],[109.8633,21.665],[109.9512,21.8408],[110.3027,21.8848],[110.3027,22.1484],[110.6543,22.1484],[110.7422,22.2803],[110.7422,22.5439],[111.2695,22.8076],[111.4453,23.0273],[111.3574,23.4668],[111.6211,23.6865],[111.6211,23.8184],[111.7969,23.8184],[111.8848,23.9941],[111.8848,24.2139],[112.0605,24.3457],[111.8848,24.6533],[112.0605,24.7412],[112.1484,24.873],[112.2363,25.1807],[112.5879,25.1367],[112.8516,24.917],[113.0273,24.9609],[113.0273,25.2246],[112.8516,25.3564],[113.2031,25.5322],[113.6426,25.3125],[113.9063,25.4443],[113.9941,25.2686],[114.6094,25.4004],[114.7852,25.2686],[114.6973,25.1367],[114.4336,24.9609],[114.1699,24.6973],[114.4336,24.5215],[115.4004,24.7852],[115.8398,24.5654],[115.752,24.7852],[115.9277,24.917],[116.2793,24.7852],[116.3672,24.873],[116.543,24.6094],[116.7188,24.6533],[116.9824,24.1699],[116.9824,23.9063],[117.1582,23.5547],[117.334,23.2471],[116.8945,23.3789],[116.6309,23.1152],[116.543,22.8516],[115.9277,22.7197],[115.6641,22.7637],[115.5762,22.6318],[115.0488,22.6758],[114.6094,22.3682],[114.3457,22.5439],[113.9941,22.5],[113.8184,22.1924],[114.3457,22.1484],[114.4336,22.0166],[114.082,21.9287],[113.9941,21.7969],[113.5547,22.0166],[113.1152,21.8408],[112.9395,21.5771],[112.4121,21.4453],[112.2363,21.5332],[111.5332,21.4893],[111.2695,21.3574],[110.7422,21.3574],[110.6543,21.2256],[110.7422,20.918],[110.4785,20.874],[110.6543,20.2588],[110.5664,20.2588],[110.3906,20.127],[110.0391,20.127],[109.8633,20.127],[109.8633,20.3027],[109.5996,20.918],[109.7754,21.4014],[109.7754,21.4014]],[[113.5986,22.1649],[113.6096,22.1265],[113.5547,22.11],[113.5437,22.2034],[113.5767,22.2034],[113.5986,22.1649]]]}},
                        {"type": "Feature","properties":{"id":"22","size":"1120","name":"吉林省","cp":[125.7746,43.5938],"childNum":9},"geometry":{"type":"Polygon","coordinates":[[[123.2227,46.2305],[123.9258,46.2305],[124.0137,45.7471],[124.3652,45.4395],[124.8926,45.5273],[125.0684,45.3955],[125.6836,45.5273],[125.7715,45.3076],[126.0352,45.1758],[126.5625,45.2637],[126.9141,45.1318],[127.0898,45],[127.002,44.7803],[127.0898,44.6045],[127.5293,44.6045],[127.7051,44.1211],[128.0566,44.1211],[128.0566,44.3408],[128.4082,44.4727],[128.4961,44.165],[128.8477,43.5498],[129.1992,43.5938],[129.2871,43.8135],[129.8145,43.9014],[129.9023,44.0332],[129.9902,43.8574],[130.3418,43.9893],[130.5176,43.6377],[130.8691,43.418],[131.3086,43.4619],[131.3086,43.3301],[131.1328,42.9346],[130.4297,42.7148],[130.6055,42.6709],[130.6055,42.4512],[130.2539,42.7588],[130.2539,42.8906],[130.166,42.9785],[129.9023,43.0225],[129.7266,42.4951],[129.375,42.4512],[128.9355,42.0117],[128.0566,42.0117],[128.3203,41.5723],[128.1445,41.3525],[127.0898,41.5283],[127.1777,41.5723],[126.9141,41.792],[126.6504,41.6602],[126.4746,41.3965],[126.123,40.957],[125.6836,40.8691],[125.5957,40.9131],[125.7715,41.2207],[125.332,41.6602],[125.332,41.9678],[125.4199,42.0996],[125.332,42.1436],[124.8926,42.8027],[124.8926,43.0664],[124.7168,43.0664],[124.4531,42.8467],[124.2773,43.2422],[123.8379,43.4619],[123.6621,43.374],[123.3105,43.5059],[123.4863,43.7256],[123.1348,44.4727],[122.3438,44.2529],[122.0801,44.8682],[122.2559,45.2637],[121.9043,45.7031],[121.7285,45.7471],[121.8164,46.0107],[122.2559,45.791],[122.4316,45.8789],[122.6953,45.7031],[122.7832,46.0107],[123.2227,46.2305]]]}},
                        {"type": "Feature","properties":{"id":"13","size":"1300","name":"河北省","cp":[115.4004,39.4688],"childNum":11},"geometry":{"type":"MultiPolygon","coordinates":[[[[114.5215,39.5068],[114.3457,39.8584],[113.9941,39.9902],[114.5215,40.3418],[114.3457,40.3857],[114.2578,40.6055],[114.082,40.7373],[113.9063,41.1328],[113.9941,41.2207],[113.9063,41.4404],[114.2578,41.5723],[114.1699,41.792],[114.5215,42.1436],[114.873,42.0996],[114.9609,41.6162],[115.2246,41.5723],[115.9277,41.9238],[116.0156,41.792],[116.2793,42.0117],[116.8066,42.0117],[116.8945,42.4072],[117.334,42.4512],[117.5098,42.583],[117.7734,42.627],[118.0371,42.4072],[117.9492,42.2314],[118.125,42.0557],[118.3008,42.0996],[118.3008,41.792],[118.125,41.748],[118.3887,41.3086],[119.2676,41.3086],[118.8281,40.8252],[119.2676,40.5176],[119.5313,40.5615],[119.707,40.1221],[119.8828,39.9463],[119.5313,39.6826],[119.4434,39.4189],[118.916,39.0674],[118.4766,38.9355],[118.125,39.0234],[118.0371,39.1992],[118.0371,39.2432],[117.8613,39.4189],[117.9492,39.5947],[117.6855,39.5947],[117.5098,39.7705],[117.5098,39.9902],[117.6855,39.9902],[117.6855,40.0781],[117.4219,40.21],[117.2461,40.5176],[117.4219,40.6494],[116.9824,40.6934],[116.6309,41.0449],[116.3672,40.9131],[116.4551,40.7813],[116.1914,40.7813],[116.1035,40.6055],[115.752,40.5615],[115.9277,40.2539],[115.4004,39.9463],[115.4883,39.6387],[115.752,39.5068],[116.1914,39.5947],[116.3672,39.4629],[116.543,39.5947],[116.8066,39.5947],[116.8945,39.1113],[116.7188,38.9355],[116.7188,38.8037],[117.2461,38.54],[117.5977,38.6279],[117.9492,38.3203],[117.4219,37.8369],[116.8066,37.8369],[116.4551,37.4854],[116.2793,37.5732],[116.2793,37.3535],[116.0156,37.3535],[115.752,36.9141],[115.3125,36.5186],[115.4883,36.167],[115.3125,36.0791],[115.1367,36.2109],[114.9609,36.0791],[114.873,36.123],[113.7305,36.3428],[113.4668,36.6504],[113.7305,36.8701],[113.7305,37.1338],[114.1699,37.6611],[113.9941,37.7051],[113.8184,38.1445],[113.5547,38.2764],[113.5547,38.54],[113.8184,38.8037],[113.8184,38.9355],[113.9063,39.0234],[114.3457,39.0674],[114.5215,39.5068]]],[[[117.2461,40.0781],[117.1582,39.8145],[117.1582,39.6387],[116.8945,39.6826],[116.8945,39.8145],[116.8066,39.9902],[117.2461,40.0781]]]]}},
                        {"type": "Feature","properties":{"id":"42","size":"1500","name":"湖北省","cp":[112.2363,31.1572],"childNum":17},"geometry":{"type":"Polygon","coordinates":[[[110.2148,31.1572],[110.127,31.377],[109.6875,31.5527],[109.7754,31.6846],[109.5996,31.7285],[109.5117,32.4316],[109.6875,32.6074],[110.127,32.6074],[110.127,32.7393],[109.7754,32.915],[109.7754,33.0469],[109.4238,33.1348],[109.5996,33.2666],[110.3027,33.1787],[110.5664,33.2666],[110.7422,33.1348],[111.0059,33.2666],[111.5332,32.6074],[112.3242,32.3438],[113.2031,32.4316],[113.4668,32.2998],[113.7305,32.4316],[113.8184,31.8604],[113.9941,31.7725],[114.1699,31.8604],[114.5215,31.7725],[114.6094,31.5527],[114.7852,31.4648],[115.1367,31.5967],[115.2246,31.4209],[115.4004,31.4209],[115.5762,31.2012],[116.0156,31.0254],[115.752,30.6738],[116.1035,30.1904],[116.1035,29.8389],[115.9277,29.707],[115.4883,29.7949],[114.873,29.3994],[114.2578,29.3555],[113.9063,29.0479],[113.7305,29.0918],[113.6426,29.3115],[113.7305,29.5752],[113.5547,29.707],[113.5547,29.8389],[113.0273,29.4434],[112.9395,29.4873],[113.0273,29.751],[112.9395,29.7949],[112.6758,29.5752],[112.5,29.6191],[112.2363,29.5313],[111.7969,29.9268],[110.8301,30.1465],[110.4785,30.0146],[110.6543,29.751],[110.4785,29.6631],[109.7754,29.751],[109.6875,29.6191],[109.5117,29.6191],[109.248,29.1357],[109.0723,29.3555],[108.9844,29.3115],[108.6328,29.8389],[108.457,29.7949],[108.5449,30.2344],[108.457,30.4102],[108.6328,30.5859],[108.8086,30.498],[109.0723,30.6299],[109.1602,30.542],[109.248,30.6299],[109.4238,30.542],[109.8633,30.8936],[110.0391,30.8057],[110.2148,31.1572]]]}},
                        {"type": "Feature","properties":{"id":"52","size":"2000","name":"贵州省","cp":[106.6113,26.9385],"childNum":9},"geometry":{"type":"Polygon","coordinates":[[[104.1504,27.2461],[104.4141,27.4658],[104.5898,27.334],[105.2051,27.3779],[105.293,27.7295],[105.5566,27.7734],[105.6445,27.6416],[106.3477,27.8174],[106.1719,28.125],[105.9082,28.125],[105.6445,28.4326],[105.9961,28.7402],[106.3477,28.5205],[106.5234,28.5645],[106.4355,28.7842],[106.5234,28.7842],[106.6113,28.6523],[106.6113,28.5205],[106.6992,28.4766],[106.875,28.7842],[107.4023,28.8721],[107.4023,29.1797],[107.5781,29.2236],[107.8418,29.1357],[107.8418,29.0039],[108.2813,29.0918],[108.3691,28.6523],[108.5449,28.6523],[108.5449,28.3887],[108.7207,28.4766],[108.7207,28.2129],[109.0723,28.2129],[109.248,28.4766],[109.3359,28.2568],[109.3359,27.9053],[109.4238,27.5977],[108.8086,27.1143],[108.8965,27.0264],[109.3359,27.1582],[109.5117,27.0264],[109.5117,26.8066],[109.3359,26.7188],[109.4238,26.5869],[109.248,26.3232],[109.4238,26.2793],[109.5117,26.0156],[109.3359,25.708],[108.9844,25.752],[109.0723,25.5322],[108.6328,25.5762],[108.6328,25.3125],[108.3691,25.5322],[108.1934,25.4443],[108.1055,25.2246],[107.8418,25.1367],[107.7539,25.2246],[107.4902,25.2246],[107.2266,25.6201],[106.9629,25.4883],[107.0508,25.2686],[106.875,25.1807],[106.1719,24.9609],[106.1719,24.7852],[105.9961,24.6533],[105.2051,24.9609],[104.6777,24.6094],[104.502,24.7412],[104.6777,24.9609],[104.5898,25.0488],[104.8535,25.2246],[104.3262,25.708],[104.6777,26.4111],[104.4141,26.6748],[103.8867,26.543],[103.7109,26.7627],[103.7109,26.9824],[103.623,27.0264],[103.8867,27.4219],[104.1504,27.2461]]]}},
                        {"type": "Feature","properties":{"id":"37","size":"1500","name":"山东省","cp":[118.7402,36.4307],"childNum":17},"geometry":{"type":"Polygon","coordinates":[[[115.4883,36.167],[115.3125,36.5186],[115.752,36.9141],[116.0156,37.3535],[116.2793,37.3535],[116.2793,37.5732],[116.4551,37.4854],[116.8066,37.8369],[117.4219,37.8369],[117.9492,38.3203],[118.125,38.1445],[118.916,38.1445],[119.3555,37.6611],[119.0039,37.5293],[119.0039,37.3535],[119.3555,37.1338],[119.707,37.1338],[119.8828,37.3975],[120.498,37.8369],[120.5859,38.1445],[120.9375,38.4521],[121.0254,37.8369],[121.2012,37.6611],[121.9043,37.4854],[122.168,37.6172],[122.2559,37.4854],[122.6074,37.4854],[122.6953,37.3535],[122.6074,36.9141],[122.4316,36.7822],[121.8164,36.8701],[121.7285,36.6943],[121.1133,36.6064],[121.1133,36.4307],[121.377,36.2549],[120.7617,36.167],[120.9375,35.8594],[120.6738,36.0352],[119.707,35.4639],[119.9707,34.9805],[119.3555,35.0244],[119.2676,35.1123],[118.916,35.0244],[118.7402,34.7168],[118.4766,34.6729],[118.3887,34.4092],[118.2129,34.4092],[118.125,34.6289],[117.9492,34.6729],[117.5977,34.4531],[117.334,34.585],[117.2461,34.4531],[116.8066,34.9365],[116.4551,34.8926],[116.3672,34.6289],[116.1914,34.585],[115.5762,34.585],[115.4004,34.8486],[114.7852,35.0684],[115.0488,35.376],[115.2246,35.4199],[115.4883,35.7275],[116.1035,36.0791],[115.3125,35.8154],[115.4883,36.167]]]}},
                        {"type": "Feature","properties":{"id":"36","size":"1700","name":"江西省","cp":[116.0156,27.29],"childNum":11},"geometry":{"type":"Polygon","coordinates":[[[114.2578,28.3447],[114.082,28.5645],[114.1699,28.8281],[113.9063,29.0479],[114.2578,29.3555],[114.873,29.3994],[115.4883,29.7949],[115.9277,29.707],[116.1035,29.8389],[116.2793,29.7949],[116.7188,30.0586],[116.8945,29.9268],[116.7188,29.751],[116.7188,29.6191],[117.1582,29.707],[117.0703,29.8389],[117.1582,29.9268],[117.5098,29.6191],[118.0371,29.5752],[118.2129,29.3994],[118.0371,29.1797],[118.0371,29.0479],[118.3887,28.7842],[118.4766,28.3447],[118.4766,28.3008],[118.3008,28.0811],[117.7734,27.8174],[117.5098,27.9932],[116.9824,27.6416],[117.1582,27.29],[117.0703,27.1143],[116.543,26.8066],[116.6309,26.4551],[116.3672,26.2354],[116.4551,26.1035],[116.1914,25.8838],[116.0156,25.2686],[115.8398,25.2246],[115.9277,24.917],[115.752,24.7852],[115.8398,24.5654],[115.4004,24.7852],[114.4336,24.5215],[114.1699,24.6973],[114.4336,24.9609],[114.6973,25.1367],[114.7852,25.2686],[114.6094,25.4004],[113.9941,25.2686],[113.9063,25.4443],[113.9941,26.0596],[114.2578,26.1475],[113.9941,26.1914],[114.082,26.5869],[113.9063,26.6309],[113.9063,26.9385],[113.7305,27.1143],[113.8184,27.29],[113.6426,27.3779],[113.6426,27.5977],[113.7305,27.9492],[114.2578,28.3447]]]}},
                        {"type": "Feature","properties":{"id":"41","size":"1700","name":"河南省","cp":[113.0668,33.8818],"childNum":17},"geometry":{"type":"Polygon","coordinates":[[[110.3906,34.585],[110.8301,34.6289],[111.1816,34.8047],[111.5332,34.8486],[111.7969,35.0684],[112.0605,35.0684],[112.0605,35.2881],[112.7637,35.2002],[113.1152,35.332],[113.6426,35.6836],[113.7305,36.3428],[114.873,36.123],[114.9609,36.0791],[115.1367,36.2109],[115.3125,36.0791],[115.4883,36.167],[115.3125,35.8154],[116.1035,36.0791],[115.4883,35.7275],[115.2246,35.4199],[115.0488,35.376],[114.7852,35.0684],[115.4004,34.8486],[115.5762,34.585],[116.1914,34.585],[116.1914,34.4092],[116.543,34.2773],[116.6309,33.9258],[116.1914,33.7061],[116.0156,33.9697],[115.6641,34.0576],[115.5762,33.9258],[115.5762,33.6621],[115.4004,33.5303],[115.3125,33.1787],[114.873,33.1348],[114.873,33.0029],[115.1367,32.8711],[115.2246,32.6074],[115.5762,32.4316],[115.8398,32.5195],[115.9277,31.7725],[115.4883,31.6846],[115.4004,31.4209],[115.2246,31.4209],[115.1367,31.5967],[114.7852,31.4648],[114.6094,31.5527],[114.5215,31.7725],[114.1699,31.8604],[113.9941,31.7725],[113.8184,31.8604],[113.7305,32.4316],[113.4668,32.2998],[113.2031,32.4316],[112.3242,32.3438],[111.5332,32.6074],[111.0059,33.2666],[111.0059,33.5303],[110.6543,33.8379],[110.6543,34.1455],[110.4785,34.2334],[110.3906,34.585]]]}},
                        {"type": "Feature","properties":{"id":"21","size":"1500","name":"辽宁省","cp":[122.0438,41.0889],"childNum":14},"geometry":{"type":"Polygon","coordinates":[[[119.2676,41.3086],[119.4434,41.6162],[119.2676,41.7041],[119.3555,42.2754],[119.5313,42.3633],[119.8828,42.1875],[120.1465,41.7041],[120.498,42.0996],[121.4648,42.4951],[121.7285,42.4512],[121.9922,42.7148],[122.3438,42.6709],[122.3438,42.8467],[122.7832,42.7148],[123.1348,42.8027],[123.3105,42.9785],[123.5742,43.0225],[123.6621,43.374],[123.8379,43.4619],[124.2773,43.2422],[124.4531,42.8467],[124.7168,43.0664],[124.8926,43.0664],[124.8926,42.8027],[125.332,42.1436],[125.4199,42.0996],[125.332,41.9678],[125.332,41.6602],[125.7715,41.2207],[125.5957,40.9131],[125.6836,40.8691],[124.541,40.21],[124.1016,39.6826],[123.3984,39.6826],[123.1348,39.4189],[123.1348,39.0234],[122.0801,39.0234],[121.5527,38.7158],[121.1133,38.6719],[120.9375,38.9795],[121.377,39.1992],[121.2012,39.5508],[122.0801,40.3857],[121.9922,40.6934],[121.7285,40.8252],[121.2012,40.8252],[120.5859,40.21],[119.8828,39.9463],[119.707,40.1221],[119.5313,40.5615],[119.2676,40.5176],[118.8281,40.8252],[119.2676,41.3086]]]}},
                        {"type": "Feature","properties":{"id":"14","size":"1450","name":"山西省","cp":[112.4121,37.6611],"childNum":11},"geometry":{"type":"Polygon","coordinates":[[[110.918,38.7158],[111.1816,39.2432],[111.0938,39.375],[111.3574,39.4189],[111.4453,39.6387],[111.9727,39.5947],[112.3242,40.2539],[112.7637,40.166],[113.2031,40.3857],[113.5547,40.3418],[113.8184,40.5176],[114.082,40.5176],[114.082,40.7373],[114.2578,40.6055],[114.3457,40.3857],[114.5215,40.3418],[113.9941,39.9902],[114.3457,39.8584],[114.5215,39.5068],[114.3457,39.0674],[113.9063,39.0234],[113.8184,38.9355],[113.8184,38.8037],[113.5547,38.54],[113.5547,38.2764],[113.8184,38.1445],[113.9941,37.7051],[114.1699,37.6611],[113.7305,37.1338],[113.7305,36.8701],[113.4668,36.6504],[113.7305,36.3428],[113.6426,35.6836],[113.1152,35.332],[112.7637,35.2002],[112.0605,35.2881],[112.0605,35.0684],[111.7969,35.0684],[111.5332,34.8486],[111.1816,34.8047],[110.8301,34.6289],[110.3906,34.585],[110.2148,34.6729],[110.2148,34.8926],[110.5664,35.6396],[110.4785,36.123],[110.3906,37.002],[110.8301,37.6611],[110.4785,37.9688],[110.4785,38.1885],[110.8301,38.4961],[110.918,38.7158]]]}},
                        {"type": "Feature","properties":{"id":"34","size":"1700","name":"安徽省","cp":[117.2461,32.0361],"childNum":17},"geometry":{"type":"Polygon","coordinates":[[[116.6309,33.9258],[116.543,34.2773],[116.1914,34.4092],[116.1914,34.585],[116.3672,34.6289],[116.8945,34.4092],[117.1582,34.0576],[117.5977,34.0137],[117.7734,33.7061],[118.125,33.75],[117.9492,33.2227],[118.0371,33.1348],[118.2129,33.2227],[118.3008,32.7832],[118.7402,32.7393],[118.916,32.959],[119.1797,32.8271],[119.1797,32.4756],[118.5645,32.5635],[118.6523,32.2119],[118.4766,32.168],[118.3887,31.9482],[118.916,31.5527],[118.7402,31.377],[118.8281,31.2451],[119.3555,31.2891],[119.4434,31.1572],[119.6191,31.1133],[119.6191,31.0693],[119.4434,30.6738],[119.2676,30.6299],[119.3555,30.4102],[118.916,30.3223],[118.916,29.9707],[118.7402,29.707],[118.2129,29.3994],[118.0371,29.5752],[117.5098,29.6191],[117.1582,29.9268],[117.0703,29.8389],[117.1582,29.707],[116.7188,29.6191],[116.7188,29.751],[116.8945,29.9268],[116.7188,30.0586],[116.2793,29.7949],[116.1035,29.8389],[116.1035,30.1904],[115.752,30.6738],[116.0156,31.0254],[115.5762,31.2012],[115.4004,31.4209],[115.4883,31.6846],[115.9277,31.7725],[115.8398,32.5195],[115.5762,32.4316],[115.2246,32.6074],[115.1367,32.8711],[114.873,33.0029],[114.873,33.1348],[115.3125,33.1787],[115.4004,33.5303],[115.5762,33.6621],[115.5762,33.9258],[115.6641,34.0576],[116.0156,33.9697],[116.1914,33.7061],[116.6309,33.9258]]]}},
                        {"type": "Feature","properties":{"id":"35","size":"2000","name":"福建省","cp":[118.3008,25.9277],"childNum":9},"geometry":{"type":"Polygon","coordinates":[[[118.4766,28.3008],[118.8281,28.2568],[118.7402,28.0371],[118.916,27.4658],[119.2676,27.4219],[119.6191,27.6855],[119.7949,27.29],[120.2344,27.4219],[120.4102,27.1582],[120.7617,27.0264],[120.6738,26.8945],[120.2344,26.8506],[120.2344,26.7188],[120.4102,26.6748],[120.498,26.3672],[120.2344,26.2793],[120.4102,26.1475],[120.0586,26.1914],[119.9707,25.9277],[119.7949,25.9277],[119.9707,25.4004],[119.7949,25.2686],[119.5313,25.1367],[119.4434,25.0049],[119.2676,25.0928],[118.916,24.8291],[118.6523,24.5215],[118.4766,24.5215],[118.4766,24.4336],[118.2129,24.3457],[118.2129,24.1699],[117.8613,23.9941],[117.7734,23.7744],[117.5098,23.5986],[117.1582,23.5547],[116.9824,23.9063],[116.9824,24.1699],[116.7188,24.6533],[116.543,24.6094],[116.3672,24.873],[116.2793,24.7852],[115.9277,24.917],[115.8398,25.2246],[116.0156,25.2686],[116.1914,25.8838],[116.4551,26.1035],[116.3672,26.2354],[116.6309,26.4551],[116.543,26.8066],[117.0703,27.1143],[117.1582,27.29],[116.9824,27.6416],[117.5098,27.9932],[117.7734,27.8174],[118.3008,28.0811],[118.4766,28.3008]]]}},
                        {"type": "Feature","properties":{"id":"33","size":"2100","name":"浙江省","cp":[120.498,29.0918],"childNum":11},"geometry":{"type":"Polygon","coordinates":[[[118.2129,29.3994],[118.7402,29.707],[118.916,29.9707],[118.916,30.3223],[119.3555,30.4102],[119.2676,30.6299],[119.4434,30.6738],[119.6191,31.0693],[119.6191,31.1133],[119.9707,31.1572],[120.498,30.8057],[120.9375,31.0254],[121.2891,30.6738],[121.9922,30.8057],[122.6953,30.8936],[122.8711,30.7178],[122.959,30.1465],[122.6074,30.1025],[122.6074,29.9268],[122.168,29.5313],[122.3438,28.8721],[121.9922,28.8721],[121.9922,28.4326],[121.7285,28.3447],[121.7285,28.2129],[121.4648,28.2129],[121.5527,28.0371],[121.2891,27.9492],[121.1133,27.4219],[120.6738,27.334],[120.6738,27.1582],[120.9375,27.0264],[120.7617,27.0264],[120.4102,27.1582],[120.2344,27.4219],[119.7949,27.29],[119.6191,27.6855],[119.2676,27.4219],[118.916,27.4658],[118.7402,28.0371],[118.8281,28.2568],[118.4766,28.3008],[118.4766,28.3447],[118.3887,28.7842],[118.0371,29.0479],[118.0371,29.1797],[118.2129,29.3994]]]}},
                        {"type": "Feature","properties":{"id":"32","size":"1950","name":"江苏省","cp":[118.8586,32.915],"childNum":13},"geometry":{"type":"Polygon","coordinates":[[[116.3672,34.6289],[116.4551,34.8926],[116.8066,34.9365],[117.2461,34.4531],[117.334,34.585],[117.5977,34.4531],[117.9492,34.6729],[118.125,34.6289],[118.2129,34.4092],[118.3887,34.4092],[118.4766,34.6729],[118.7402,34.7168],[118.916,35.0244],[119.2676,35.1123],[119.3555,35.0244],[119.3555,34.8486],[119.707,34.585],[120.3223,34.3652],[120.9375,33.0469],[121.0254,32.6514],[121.377,32.4756],[121.4648,32.168],[121.9043,31.9922],[121.9922,31.6846],[121.9922,31.5967],[121.2012,31.8604],[121.1133,31.7285],[121.377,31.5088],[121.2012,31.4648],[120.9375,31.0254],[120.498,30.8057],[119.9707,31.1572],[119.6191,31.1133],[119.4434,31.1572],[119.3555,31.2891],[118.8281,31.2451],[118.7402,31.377],[118.916,31.5527],[118.3887,31.9482],[118.4766,32.168],[118.6523,32.2119],[118.5645,32.5635],[119.1797,32.4756],[119.1797,32.8271],[118.916,32.959],[118.7402,32.7393],[118.3008,32.7832],[118.2129,33.2227],[118.0371,33.1348],[117.9492,33.2227],[118.125,33.75],[117.7734,33.7061],[117.5977,34.0137],[117.1582,34.0576],[116.8945,34.4092],[116.3672,34.6289]]]}},
                        {"type": "Feature","properties":{"id":"50","size":"2380","name":"重庆市","cp":[107.7539,30.1904],"childNum":40},"geometry":{"type":"Polygon","coordinates":[[[108.5449,31.6846],[108.2813,31.9043],[108.3691,32.168],[108.5449,32.2119],[109.0723,31.9482],[109.248,31.7285],[109.5996,31.7285],[109.7754,31.6846],[109.6875,31.5527],[110.127,31.377],[110.2148,31.1572],[110.0391,30.8057],[109.8633,30.8936],[109.4238,30.542],[109.248,30.6299],[109.1602,30.542],[109.0723,30.6299],[108.8086,30.498],[108.6328,30.5859],[108.457,30.4102],[108.5449,30.2344],[108.457,29.7949],[108.6328,29.8389],[108.9844,29.3115],[109.0723,29.3555],[109.248,29.1357],[109.248,28.4766],[109.0723,28.2129],[108.7207,28.2129],[108.7207,28.4766],[108.5449,28.3887],[108.5449,28.6523],[108.3691,28.6523],[108.2813,29.0918],[107.8418,29.0039],[107.8418,29.1357],[107.5781,29.2236],[107.4023,29.1797],[107.4023,28.8721],[106.875,28.7842],[106.6992,28.4766],[106.6113,28.5205],[106.6113,28.6523],[106.5234,28.7842],[106.4355,28.7842],[106.5234,28.5645],[106.3477,28.5205],[106.2598,28.8721],[105.8203,28.96],[105.7324,29.2676],[105.4688,29.3115],[105.293,29.5313],[105.7324,29.8828],[105.5566,30.1025],[105.6445,30.2783],[105.8203,30.4541],[106.2598,30.1904],[106.6113,30.3223],[106.7871,30.0146],[107.0508,30.0146],[107.4902,30.6299],[107.4023,30.7617],[107.4902,30.8496],[107.9297,30.8496],[108.1934,31.5088],[108.5449,31.6846]]]}},
                        {"type": "Feature","properties":{"id":"64","size":"2100","name":"宁夏回族自治区","cp":[105.9961,37.3096],"childNum":5},"geometry":{"type":"Polygon","coordinates":[[[104.3262,37.4414],[105.8203,37.793],[105.9082,38.7158],[106.3477,39.2871],[106.7871,39.375],[106.9629,38.9795],[106.5234,38.3203],[106.7871,38.1885],[107.3145,38.1006],[107.666,37.8809],[107.3145,37.6172],[107.3145,37.0898],[106.6113,37.0898],[106.6113,36.7822],[106.4355,36.5625],[106.5234,36.4746],[106.5234,36.2549],[106.875,36.123],[106.9629,35.8154],[106.6992,35.6836],[106.4355,35.6836],[106.5234,35.332],[106.3477,35.2441],[106.2598,35.4199],[106.084,35.376],[105.9961,35.4199],[106.084,35.4639],[105.9961,35.4639],[105.8203,35.5518],[105.7324,35.7275],[105.3809,35.7715],[105.293,35.9912],[105.4688,36.123],[105.2051,36.6943],[105.293,36.8262],[104.8535,37.2217],[104.5898,37.2217],[104.5898,37.4414],[104.3262,37.4414]]]}},
                        {"type": "Feature","properties":{"id":"46","size":"4500","name":"海南省","cp":[109.9512,19.2041],"childNum":18},"geometry":{"type":"Polygon","coordinates":[[[108.6328,19.3799],[109.0723,19.6436],[109.248,19.9512],[109.5996,20.0391],[110.0391,20.127],[110.3906,20.127],[110.5664,20.2588],[110.6543,20.2588],[111.0938,19.9512],[111.2695,19.9951],[110.6543,19.1602],[110.5664,18.6768],[110.2148,18.5889],[110.0391,18.3691],[109.8633,18.3691],[109.6875,18.1055],[108.9844,18.2813],[108.6328,18.457],[108.6328,19.3799]]]}},
                        {"type": "Feature","properties":{"id":"71","size":"3000","name":"台湾省","cp":[120.0254,23.5986],"childNum":1},"geometry":{"type":"Polygon","coordinates":[[[121.9043,25.0488],[121.9922,25.0049],[121.8164,24.7412],[121.9043,24.5654],[121.6406,24.0381],[121.377,23.1152],[121.0254,22.6758],[120.8496,22.0605],[120.7617,21.9287],[120.6738,22.3242],[120.2344,22.5879],[120.0586,23.0713],[120.1465,23.6865],[121.0254,25.0488],[121.5527,25.3125],[121.9043,25.0488]]]}},
                        {"type": "Feature","properties":{"id":"11","size":"5000","name":"北京市","cp":[116.4551,40.2539],"childNum":19},"geometry":{"type":"Polygon","coordinates":[[[117.4219,40.21],[117.334,40.1221],[117.2461,40.0781],[116.8066,39.9902],[116.8945,39.8145],[116.8945,39.6826],[116.8066,39.5947],[116.543,39.5947],[116.3672,39.4629],[116.1914,39.5947],[115.752,39.5068],[115.4883,39.6387],[115.4004,39.9463],[115.9277,40.2539],[115.752,40.5615],[116.1035,40.6055],[116.1914,40.7813],[116.4551,40.7813],[116.3672,40.9131],[116.6309,41.0449],[116.9824,40.6934],[117.4219,40.6494],[117.2461,40.5176],[117.4219,40.21]]]}},
                        {"type": "Feature","properties":{"id":"12","size":"5000","name":"天津市","cp":[117.4219,39.4189],"childNum":18},"geometry":{"type":"Polygon","coordinates":[[[116.8066,39.5947],[116.8945,39.6826],[117.1582,39.6387],[117.1582,39.8145],[117.2461,40.0781],[117.334,40.1221],[117.4219,40.21],[117.6855,40.0781],[117.6855,39.9902],[117.5098,39.9902],[117.5098,39.7705],[117.6855,39.5947],[117.9492,39.5947],[117.8613,39.4189],[118.0371,39.2432],[118.0371,39.1992],[117.8613,39.1113],[117.5977,38.6279],[117.2461,38.54],[116.7188,38.8037],[116.7188,38.9355],[116.8945,39.1113],[116.8066,39.5947]]]}},
                        {"type": "Feature","properties":{"id":"31","size":"7500","name":"上海市","cp":[121.4648,31.2891],"childNum":19},"geometry":{"type":"Polygon","coordinates":[[[120.9375,31.0254],[121.2012,31.4648],[121.377,31.5088],[121.1133,31.7285],[121.2012,31.8604],[121.9922,31.5967],[121.9043,31.1572],[121.9922,30.8057],[121.2891,30.6738],[120.9375,31.0254]]]}},
                        {"type": "Feature","properties":{"id":"81","size":"18000","name":"香港特别行政区","cp":[114.1178,22.3242],"childNum":1},"geometry":{"type":"Polygon","coordinates":[[[114.6094,22.4121],[114.5215,22.1484],[114.3457,22.1484],[113.9063,22.1484],[113.8184,22.1924],[113.9063,22.4121],[114.1699,22.5439],[114.3457,22.5439],[114.4336,22.5439],[114.4336,22.4121],[114.6094,22.4121]]]}},
                        {"type": "Feature","properties":{"id":"82","size":"27","name":"澳门特别行政区","cp":[111.5547,22.1484],"childNum":1},"geometry":{"type":"Polygon","coordinates":[[[113.5986,22.1649],[113.6096,22.1265],[113.5547,22.11],[113.5437,22.2034],[113.5767,22.2034],[113.5986,22.1649]]]}}
                    ]
            };

        const INITIAL_VIEW_STATE = {
            latitude: 30,
            longitude: 104,
            zoom: 3,
            pitch: 40.5,
        };

        const deckgl = new Deck({
            canvas: 'deck-canvas',
            width: '100%',
            height: '100%',
            viewState: INITIAL_VIEW_STATE,
            controller: MapController,
            onViewportChange: viewState => {
                deckgl.setProps({viewState});
                //map.setProps({viewState});
            }
        });

        deckgl.setProps({
            layers: [
                new GeoJsonLayer({
                    GEOJSON,
                    stroked: true,
                    filled: true,
                    lineWidthMinPixels: 2,
                    opacity: 0.4,
                    getLineColor: () => [255, 160, 100],
                    getFillColor: () => [200, 160, 0, 180]
                })
            ]
        });
    },
    drawHexbin(map,latlngs){
        let hexLayer = L.hexbinLayer().addTo(map);
        // Random data generators
        hexLayer.data(latlngs);
        return hexLayer;
    }

};

window.mauna_minimap = {
    init(data,callBack){
        let map_container = $('#'+data.map_container);
        let id = data.map_container;
        let latlng = data.latlng;
        let zoom = data.zoom;
        let map = basemap(id,latlng,zoom);
        function basemap(map_container,latlng,zoom) {
            let map = L.map(map_container,{
                crs:L.CRS.EPSG3857, //默认墨卡托投影 ESPG：3857
                attributionControl: false,
                zoomsliderControl: false,
                zoomControl: false,
                maxZoom:18,
                minZoom:4,
                scrollWheelZoom: true,
                touchZoom:false,
                doubleClickZoom:false,
                dragging:true
            }).setView(latlng, zoom);
            let osm = L.tileLayer.chinaProvider('GaoDe.Normal.Map',{});
            osm.addTo(map);
            return map;
        }
        if(callBack){
            callBack();
        }
        return map;
    },
    myIcon(map,latlng,options,markeropt){
        let myIcon = L.divIcon(options);
        if(markeropt){
            markeropt.icon = myIcon;
        }else {
            markeropt = {
                icon : myIcon
            }
        }
        return L.marker(latlng, markeropt).addTo(map);
    },
    changeIcon(marker,latlng,options){
        let myIcon = L.divIcon(options);
        marker.setIcon(myIcon);
        marker.setLatLng(latlng);
        return marker;
    }
}