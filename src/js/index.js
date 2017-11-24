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

window.gm_map = {
    init(data,callBack){
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
                                    <div class="table-toolbar" style="margin: 8px 0 0 8px;">\
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
        init_top_menu(frequently_used_city);

        let location = '';
        let url = 'http://api.vehicle-dev-nj.mokua.com:5107/vehicle/regeo?lng='+map.getCenter().lng+'&lat='+map.getCenter().lat;
        $.ajax({
            url: url,
            success: function(data){
                let dataJson = eval('(' + data + ')');
                location = dataJson.addressComponent['district'];
                $('#navigation_input').val(location);
            }
        });
        map.on('moveend',function () {
            let url = 'http://api.vehicle-dev-nj.mokua.com:5107/vehicle/regeo?lng='+map.getCenter().lng+'&lat='+map.getCenter().lat;
            $.ajax({
                url: url,
                success: function(data){
                    let dataJson = eval('(' + data + ')');
                    location = dataJson.addressComponent['district'];
                    $('#navigation_input').val(location);
                }
            });
        });
        function init_tools() {
            init_tools_group();
        }

        function init_top_menu(frequently_used_city) {
            map_container.after(top_menu_template);
            $('.navigation_title').on('click',function () {
                if($('.top_menu').hasClass('open')){
                    $('.top_menu').removeClass('open');
                }else{
                    $('.top_menu').addClass('open');
                }
                if($('.navigation_modal').attr('style')==undefined){
                    $('.navigation_modal').attr('style','display:block');
                }else if($('.navigation_modal').attr('style')=='display:none'){
                    $('.navigation_modal').attr('style','display:block');
                }else {
                    $('.navigation_modal').attr('style','display:none');
                }
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
            });

            $('ul.frequently_used_city').after('<div style="margin-left: 14px;margin-top: 16px;padding: 0;color: #666;">选择城市</div>' +
                '<div style="margin-left: 14px; margin-top:8px; margin-right: 14px;">' +
                '<div data-id="province" class="select" value="" style="width: calc(32.6%);"></div>' +
                '<div data-id="city" class="select" value="" style="width: calc(32.6%);"></div>' +
                '<div data-id="district" class="select" value="" style="width: calc(32.6%);"></div>' +
                '</div>');
        }

        function init_tools_group() {
            map_container.after(tools_group_template);
            map_container.after(button_group_template);
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


        function basemap(map_container) {
            let map = L.map(map_container,{
                crs:L.CRS.EPSG3857, //默认墨卡托投影 ESPG：3857
                attributionControl: false,
                zoomsliderControl: true,
                zoomControl: false,
                maxZoom:18,
                minZoom:4
            }).setView([30, 104], 5);
            let osm = L.tileLayer.chinaProvider('GaoDe.Normal.Map',{
                updateInterval : 0,
                tileSize : 512,
                keepBuffer : 0
            });
            osm.addTo(map);


            let scale = L.control.scale({
                imperial:false
            });
            scale.addTo(map);//比例尺


            let osm2 = new L.tileLayer.chinaProvider('Google.Normal.Map',{});
            new MiniMap(osm2, {
                width : 180,
                height:180,
                minimized:true
            }).addTo(map);//小地图

            if($('.leaflet-control-minimap').length>0&&$('.leaflet-control-zoomslider').length>0){
                let minimap = $('.leaflet-control-minimap');
                $('.leaflet-control-minimap').remove();
                $('.leaflet-control-zoomslider').after(minimap);
            }

            let myIcon = L.icon({
                className: 'my-cross-icon',
                iconUrl: '../dist/images/cross.svg',
                iconSize: [18, 18],
            });
            let crossMarker = L.marker(map.getCenter(), {
                icon: myIcon,
                zIndexOffset: 5000,
            }).addTo(map);

            map.on('move',function () {
                crossMarker.setLatLng(map.getCenter());
            });

            map.on('zoom',function () {
                crossMarker.setLatLng(map.getCenter());
            });




            /**
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
                let address = new Location().init('高德地图',map.getCenter());
                attribution.addAttribution(address);
                old_center = address;
                attribution.addTo(map);
            });
             map.on('moveend',function (e) {
                attribution.removeAttribution(old_center);
                let address = new Location().init('高德地图',map.getCenter());
                attribution.addAttribution(address);
                old_center = address;
                attribution.addTo(map);
            });
             **/


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

            });

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
    addToolbar(className, template, clickFunc1, clickFunc2, callBack){
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
            case 'attribution' :
                $('#'+map._container.id).find('.leaflet-control-attribution').hide();
                map.on('zoomend',function (e) {
                    $('#'+map._container.id).find('.leaflet-control-attribution').hide();
                });
                map.on('moveend',function (e) {
                    $('#'+map._container.id).find('.leaflet-control-attribution').hide();
                });
                break;
            case 'iconLayers' : $('#'+map._container.id).find('.leaflet-iconLayers').hide();break;
            case 'zoomslider' : $('#'+map._container.id).find('.leaflet-control-zoomslider').hide();break;
            case 'lineaermeasurement' : break;
            case 'search' : $('#'+map._container.id).find('.leaflet-control-geocoder').hide();break;
            case 'scale' : $('#'+map._container.id).find('.leaflet-control-scale').hide();break;
            case 'minimap' : $('#'+map._container.id).find('.leaflet-control-minimap').hide();break;
        }
        if(callBack){
            callBack();
        }
        return this;
    },
    showComponent(map,component,callBack){
        switch (component){
            case 'attribution' : $('#'+map._container.id).find('.leaflet-control-attribution').show();break;
            case 'iconLayers' : $('#'+map._container.id).find('.leaflet-iconLayers').show();break;
            case 'zoomslider' : $('#'+map._container.id).find('.leaflet-control-zoomslider').show();break;
            case 'lineaermeasurement' : break;
            case 'search' : $('#'+map._container.id).find('.leaflet-control-geocoder').show();break;
            case 'scale' : $('#'+map._container.id).find('.leaflet-control-scale').show();break;
            case 'minimap' : $('#'+map._container.id).find('.leaflet-control-minimap').show();break;
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
            markeropt.riseOnHover = true;
        }else {
            markeropt = {
                icon : myIcon,
                riseOnHover : true
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
        switch (type){
            case 'google': layer = L.tileLayer.chinaProvider('Google.Normal.Map',{});break;
            case 'google-satellite': layer = L.tileLayer.chinaProvider('Google.Satellite.Map',{});break;
            case 'gaode': layer = L.tileLayer.chinaProvider('GaoDe.Normal.Map',{});break;
            case 'gaode-satellite': layer = L.tileLayer.chinaProvider('GaoDe.Satellite.Map',{});break;
        }
        map.addLayer(layer, true );
        return this;
    },
    initLine(map){
        let line = new L.Control.LinearMeasurement({
            unitSystem: 'metric',
            color: '#FF0080',
            type: 'line',
            show_last_node:true
        });
        map.addControl(line);
        return line;
    },
    startLine(line){
        return line.initRuler();
    },
    endLine(line){
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
    arrowCluster(){
        let collisionLayer = L.LayerGroup.collision({margin:5});
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
        for(let i = 0;i<markers.length;i++){
            if(map.hasLayer(markers[i])){

            }else {
                map.addLayer(markers[i]);
            }
        }
        cluster.remove();
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

        $('#'+map._container.id).find('.leaflet-control-zoomslider').hide();
        $('#'+map._container.id).find('.leaflet-control-minimap').hide();
        $('.top_menu').hide();
        $('.button_group').hide();
        $('#'+map._container.id).find('.leaflet-control-scale').hide();
        $('.switch_group').hide();
        $('.card-div-border').hide();
        $('.marker-cluster').hide();
        map.on('resize',function () {
            map.dragging.disable();
            map.doubleClickZoom.disable();
            map.boxZoom.disable();
            map.touchZoom.disable();
            map.scrollWheelZoom.disable();
            background.setBounds(map.getBounds());

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
        $('#'+map._container.id).find('.leaflet-control-zoomslider').show();
        $('#'+map._container.id).find('.leaflet-control-minimap').show();
        $('.top_menu').show();
        $('#'+map._container.id).find('.leaflet-control-scale').show();
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
            map.dragging.disable();
            map.doubleClickZoom.disable();
            map.boxZoom.disable();
            map.touchZoom.disable();
            map.scrollWheelZoom.disable();
            background.setBounds(map.getBounds());

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
        map.on("contextmenu", function (event) {
            let latlng = event.latlng;
            let point = map.latLngToLayerPoint(latlng);
            let pointRT = L.point(point.x+50,point.y+50);
            let pointLB = L.point(point.x-50,point.y-50);
            let bounds = L.bounds(pointRT,pointLB);
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
            callBack(layers);
        });
    }
};

window.gm_minimap = {
    init(data,callBack){
        let map_container = $('#'+data.map_container);
        let id = data.map_container;
        util.adaptHeight(id,0);
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
                scrollWheelZoom: false,
                touchZoom:false,
                doubleClickZoom:false,
                dragging:false
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
