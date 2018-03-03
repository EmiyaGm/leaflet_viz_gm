import util from './util';
import $ from 'jquery';
import MiniMap from 'leaflet-minimap';
import {Location} from './location';
import iconLayers from 'leaflet-iconlayers';
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
                if($('#tools > li > .map-icon.font-active').next().attr('style')=='display: block;'){
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
                if($('#tools > li > .map-icon.font-active').next().attr('style')=='display: block;'){
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
            case 'iconLayers' : $('#'+map._container.id).find('.leaflet-iconLayers').hide();break;
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
            case 'iconLayers' : $('#'+map._container.id).find('.leaflet-iconLayers').show();break;
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
    changeMap(map,type){
        let layer;
        let center = map.getCenter();
        switch (type) {
            case 'google':
                map.options.crs = L.CRS.EPSG3857;
                layer = L.tileLayer.chinaProvider('Google.Normal.Map', {});
                break;
            case 'google-satellite':
                map.options.crs = L.CRS.EPSG3857;
                layer = L.tileLayer.chinaProvider('Google.Satellite.Map', {});
                break;
            case 'gaode':
                map.options.crs = L.CRS.EPSG3857;
                layer = L.tileLayer.chinaProvider('GaoDe.Normal.Map', {});
                break;
            case 'gaode-satellite':
                map.options.crs = L.CRS.EPSG3857;
                layer = L.tileLayer.chinaProvider('GaoDe.Satellite.Map', {});
                break;
            case 'baidu':
                map.options.crs = L.CRS.Baidu;
                layer = L.tileLayer.baidu({ layer: 'vec' });
                map.once('zoom',function(){
                    map.setView(center);
                });
                break;
            case 'baidu-road':
                map.options.crs = L.CRS.Baidu;
                layer = L.tileLayer.baidu({ layer: 'time' });
                map.once('zoom',function(){
                    map.setView(center);
                });
                break;
            case 'road':
                map.options.crs = L.CRS.EPSG3857;
                layer = L.tileLayer.chinaProvider('GaoDe.Road.Map', {});
                break;
        }
        if(type == 'baidu-road'){
            map.eachLayer(function (layer) {
                if(layer._url){
                    map.removeLayer(layer);
                }
            });
            map.addLayer(L.tileLayer.baidu({ layer: 'vec' }), true);
            map.addLayer(layer, true );
        }else if(type == 'road'){
            map.addLayer(layer, true );
        }else{
            map.eachLayer(function (layer) {
                if(layer._url){
                    map.removeLayer(layer);
                }
            });
            map.addLayer(layer, true );
        }

        return this;
    },
    initLine(map){
        let line = new L.Control.LinearMeasurement({
            unitSystem: 'metric',
            color: '#0D9BF2',
            type: 'line',
            show_last_node:true
        });
        map.addControl(line);
        return line;
    },
    startLine(map,line){
        $('.leaflet-grab').addClass('leaflet-pointer');
        $('.leaflet-grab').removeClass('leaflet-grab');
        var default_img_html = '<img width=15 src="">';
        var default_img = {
            html: default_img_html,
            iconSize: [0, 0]
        };
        let lmarker = this.myIcon(map,[30,104],default_img);
        lmarker.bindTooltip("my tooltip text").openTooltip();
        map.on('mousemove',function (event) {
            lmarker.setLatLng(event.latlng);
        });
        return line.initRuler();
    },
    endLine(line){
        $('.leaflet-pointer').addClass('leaflet-grab');
        $('.leaflet-pointer').removeClass('leaflet-pointer');
        line.resetRuler(!!line.mainLayer);
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
                        console.log('11111111');
                    })
                }else {
                    $.each(layer.getAllChildMarkers(),function (i,e) {
                        e.on('mouseover',function () {
                            console.log('11111111');
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
                    let size = cMarkers[j].options.icon.options.iconSize;
                    let rtlatlng = map.containerPointToLatLng(L.point([point.x + size[0]/2, point.y - size[1]/2]));
                    let lblatlng = map.containerPointToLatLng(L.point([point.x - size[0]/2, point.y + size[1]*1.6]));
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
            size = rectMarkers[i].options.icon.options.iconSize;
            let rtlatlng = map.containerPointToLatLng(L.point([point.x + size[0]/2, point.y - size[1]/2]));
            let lblatlng = map.containerPointToLatLng(L.point([point.x - size[0]/2, point.y + size[1]*1.6]));
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