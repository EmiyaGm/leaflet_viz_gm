/**
 * Created by gongmin on 2017/9/6.
 */
(function(factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(require('leaflet'));
    } else {
        window.providers = factory(window.L);
    }
})(function(L) {
    var providers = {};
    providers['OpenStreetMap_Mapnik'] = {
        id:2,
        title: 'osm',
        icon: '../dist/images/openstreetmap_mapnik.png',
        layer: L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
        })
    };

    providers['OpenStreetMap_BlackAndWhite'] = {
        id:3,
        title: 'osm bw',
        icon: '../dist/images/openstreetmap_blackandwhite.png',
        layer: L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
            maxZoom: 18
        })
    };

    providers['OpenStreetMap_DE'] = {
        id:4,
        title: 'osm de',
        icon: '../dist/images/openstreetmap_de.png',
        layer: L.tileLayer('http://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
            maxZoom: 18
        })
    }

    providers['Stamen_Toner'] = {
        id:5,
        title: 'toner',
        icon: '../dist/images/stamen_toner.png',
        layer: L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
            subdomains: 'abcd',
            minZoom: 0,
            maxZoom: 20,
            ext: 'png'
        })
    };

    providers['Esri_OceanBasemap'] = {
        id:6,
        title: 'esri ocean',
        icon: '../dist/images/esri_oceanbasemap.png',
        layer: L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 13
        })
    };


    providers['CartoDB_Positron'] = {
        id:7,
        title: 'positron',
        icon: '../dist/images/cartodb_positron.png',
        layer: L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
            subdomains: 'abcd',
            maxZoom: 19
        })
    };

    return providers;
});