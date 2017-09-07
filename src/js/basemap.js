/**
 * Created by gongmin on 2017/9/6.
 */
import MiniMap from 'leaflet-minimap';
import 'leaflet-fullscreen';
import {Location} from './location';
import iconLayers from 'leaflet-iconlayers';
import providers from './providers';
import './leaflet.ChineseTmsProviders';
import './L.Control.Zoomslider';
import './Control.OSMGeocoder';
import './Leaflet.LinearMeasurement'

let map = L.map('map',{
    crs:L.CRS.EPSG3857, //默认墨卡托投影 ESPG：3857
    attributionControl: false,
    fullscreenContro: true,
    zoomsliderControl: true,
    zoomControl: false
}).setView([30, 104], 5);
let osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {});
osm.addTo(map);


L.control.scale().addTo(map); //比例尺


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


let iconLayersControl = new iconLayers();
let layers = [];
for (let providerId in providers) {
    layers.push(providers[providerId]);
}
layers.push(
    {
        id:7,
        title:'天地图',
        icon: '../dist/images/cartodb_positron.png',
        layer: L.tileLayer.chinaProvider('TianDiTu.Normal.Map', {})
    }
);
layers.push({
    id:8,
    title:'高德地图',
    icon:'../dist/images/cartodb_positron.png',
    layer: L.tileLayer.chinaProvider('GaoDe.Normal.Map',{})
});
iconLayersControl.setLayers(layers);
iconLayersControl.addTo(map);
iconLayersControl.on('activelayerchange', function(e) {
    console.log('layer switched', e.layer);
});


let editableLayers = new L.FeatureGroup();
let drawnItems = editableLayers.addTo(map);


map.addControl(new L.Control.LinearMeasurement({
    unitSystem: 'imperial',
    color: '#FF0080',
    type: 'line'
}));


/**
 map.on('baselayerchange', function(e) {
    $('.leaflet-control-minimap').remove();
    switch (e.name){
    }
    let osm2 = L.tileLayer.chinaProvider('GaoDe.Normal.Map', {
        maxZoom: 13,
        minZoom: 0
    });
    new MiniMap(osm2, { toggleDisplay: true }).addTo(map);//小地图
});
 **/
export { map, osm, editableLayers, drawnItems };