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
}

export {Location};