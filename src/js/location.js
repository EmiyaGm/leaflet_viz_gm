/**
 * Created by gongmin on 2017/9/6.
 */
import $ from 'jquery';

class Location{
    init(type,LatLng){
        let $this = this;
        let location = '';
        //script.id = this._callbackId;
        switch (type){
            case 'OpenStreetMap' : break;
            case 'Google地图' : break;
            case 'Google卫星' : break;
            case '天地图' : break;
            case '天地图影像' : break;
            case '高德地图' : location = $this.initGaode(LatLng);break;
        }
        return location;

    }
    initGaode(LatLng){
        let location = '';
        let url = 'https://restapi.amap.com/v3/geocode/regeo?output=xml&location='+LatLng.lng+','+LatLng.lat+'&key=3ee09e2462ad937d972b825e3624a89a&radius=1000&extensions=all';
        $.ajax({
            url: url,
            async: false,
            success: function(data){
                location = $(data).find('formatted_address').eq(0).text();
            }
        });
        return location;

    }
    getAddress(LatLng,type){
        let location = '';
        let url = 'https://restapi.amap.com/v3/geocode/regeo?output=xml&location='+LatLng.lng+','+LatLng.lat+'&key=3ee09e2462ad937d972b825e3624a89a&radius=1000&extensions=all';
        $.ajax({
            url: url,
            success: function(data){
                let dataJson = eval('(' + data + ')');
                location = dataJson.addressComponent[type];
            }
        });
        return location;
    }
    getInputtips(keywords,city,LatLng){
        let tips = '';
        let url = 'https://restapi.amap.com/v3/assistant/inputtips?keywords='+keywords+'&key=9a7983cc299b135b084ca6b8eff28012&datatype=all';
        if(city){
            url = url + '&city='+city;
        }
        if(LatLng){
            url = url + '&location='+LatLng.lng+','+LatLng.lat;
        }
        $.ajax({
            url: url,
            async: false,
            success: function(data){
                tips = data.tips;
            }
        });
        return tips;
    }
    getSearch(keywords,city){
        let search = '';
        let url = 'https://restapi.amap.com/v3/place/text?keywords='+keywords+'&key=9a7983cc299b135b084ca6b8eff28012&offset=10&page=1&extensions=all&children=1';
        if(city){
            url = url + '&city='+city;
        }
        $.ajax({
            url: url,
            async: false,
            success: function(data){
                search = data;
            }
        });
        return search;
    }
    getLatlng(address){
        let latlng = '';
        let url = 'https://restapi.amap.com/v3/config/district?keywords='+address+'&key=9a7983cc299b135b084ca6b8eff28012&subdistrict=0';
        $.ajax({
            url: url,
            async: false,
            success: function(data){
                latlng = data.districts[0].center;
            }
        });
        return latlng;
    }
    getSubdistrict(address){
        let subdistrict = {};
        let url = 'https://restapi.amap.com/v3/config/district?keywords='+address+'&key=9a7983cc299b135b084ca6b8eff28012&subdistrict=1';
        $.ajax({
            url: url,
            async: false,
            success: function(data){
                subdistrict = data;
            }
        });
        return subdistrict;
    }
}

export {Location};