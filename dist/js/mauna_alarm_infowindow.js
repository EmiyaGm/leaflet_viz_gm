/**
 * Created by gongmin on 2017/12/4.
 */
/**
 * Author: luxinyu
 * Date: 20170303
 */
//document.write('<script type="text/javascript" src="https://cdn.bootcss.com/echarts/3.7.2/echarts.js"></script>');
var mauna_infoWindow = function(options){

    var infoWindow, small_infowindow, big_infowindow, card_infowindow;
    var map_container = options.map_container;
    var data = options.data || {};                      //data
    var infoWindow_id = options.id;                     //
    var car_id = options.car_id;                        //
    var closeBtn = options.closeBtn || true;            // 是否有关闭按钮，默认为true
    var close_callback = options.close_callback || null;  //
    var car_icon = options.car_icon || false;           // 是否有car_icon
    var car_name = options.car_name || false;           // 是否有car_name
    var follow_icon = options.follow_icon || false;     //
    var follow_callback = options.follow_callback || null; //
    var switch_size = options.switch_size || false;       // 是否可以切换div大小，默认为false
    var switch_callback = options.switch_callback || null;
    var title = options.title || true;                  // 是否有title，默认为true
    var titleIcon = options.titleIcon || false;         // 默认无titleIcon
    var small_options = options.small_options || false;   // 小窗口配置
    var big_options = options.big_options || false;       // 大窗口配置
    var defaultOptions = {
        width: '',
        height: '',
    }
    var card_type;
    var has_map = false;
    var map_data = {};
    var infowindow_map, infowwindow_marker;
    var car_position, car_state;
    var big_table_content;

    var small_height = 240;
    var small_width = 408;

    var default_title = '<div class="mauna-infowindow-title"></div>';
    var default_content = '<div class="mauna-infowindow-content"></div>';
    var default_table = '<div class="mauna-infowindow-table"></div>';
    var default_can = '<div class="mauna-infowindow-can"></div>';
    var default_gb = '<div class="mauna-infowindow-gb"></div>';
    var default_small_content = '<div class="mauna-infowindow-row1">\
                                    <div class="mauna-infowindow-name mauna-infowindow-column1"></div>\
                                    <div class="mauna-infowindow-value mauna-infowindow-column2"></div>\
                                    <div class="mauna-infowindow-pic">\
                                        <img class="mauna-infowindow-picture" />\
                                        <div class="mauna-infowindow-nopicture">暂无图片</div>\
                                    </div>\
                                </div>\
                                <div class="mauna-infowindow-row2">\
                                    <div class="mauna-infowindow-name mauna-infowindow-column1"></div>\
                                    <div class="mauna-infowindow-value mauna-infowindow-column2"></div>\
                                    <div class="mauna-infowindow-name mauna-infowindow-column1"></div>\
                                    <div class="mauna-infowindow-value mauna-infowindow-column2"></div>\
                                </div>\
                                <div class="mauna-infowindow-row3">\
                                    <div class="mauna-infowindow-name mauna-infowindow-column1"></div>\
                                    <div class="mauna-infowindow-value mauna-infowindow-column3"></div>\
                                </div>';
    var default_content_row = '<div class="mauna-infowindow-row"></div>';
    var default_content_item = '<div class="mauna-infowindow-item"></div>';
    var default_car_icon = '<i class="icon-pl-car-normal car-card-icon running"></i>';
    var default_car_name = '<span class="mauna-infowindow-car-name"></span>';
    var default_tri = '<div class="mauna-infowindow-tri"></div>';
    var default_follow_icon = '<span class="mauna-follow-icon">跟踪车辆<i class="follow_icon map_checkbox"></i></span>';
    var default_can_icon = '<span class="mauna-can-icon" data-onlycan="0">只显示CAN数据<i class="can_icon map_checkbox"></i></span>';
    var default_can_data_icon = '<span class="mauna-can-data-icon" data-candata="0">原始数据<i class="can_icon map_checkbox"></i></span>';
    var default_close_btn = '<i class="mauna-infowindow-close" data-placement="auto bottom" data-toggle="tooltip" data-original-title="关闭"></i>';
    var default_expand = '<i class="mauna-infowindow-expand" data-placement="auto bottom" data-toggle="tooltip" data-original-title="展开"></i>';
    var default_compress = '<i class="mauna-infowindow-compress" data-placement="auto bottom" data-toggle="tooltip" data-original-title="收起"></i>';
    var default_nocan = '<div class="mauna-infowindow-nocan"><div>该车型没有配置CAN解析和展示规则</div></div>';
    var can_data_container = '<div style="display:none" class="mauna-infowindow-can-data-container"></div>';
    var can_data_title = '<div class="mauna-infowindow-can-data-title"><span>原始数据</span><div class="can-data-search-container"></div><i class="can-data-close mauna-infowindow-close"></i></div>';
    var can_data_box = '<div class="mauna-infowindow-can-data-box"></div>';
    var check_class = 'map_checkbox_checked';
    var uncheck_class = 'map_checkbox';
    var can_template;
    var gtb_template;
    var vehicle_model = new parse.model(modelConfig['vehicle']);
    var position_model = new parse.model(modelConfig['position']);
    var terminal_model = new parse.model(modelConfig['terminal']);
    var currentRules = {};

    var fields_config = {
        "plate" : "plate",
        "models" : "models",
        'name': 'name',
        "vin": "vin",
        "sim": "sim",
        "terminal_id" : "terminal_id",
        "protocol" : "protocol",
        "datetime" : "datetime",
        "state" : "state",
        "speed" : "speed",
        "total" : "mileage",
        "position" : "location",
        "address" : "address",
        "team" : "team",
        'direction':'direction',
        "mileage" : "mileage",
        "total_mileage": "total_mileage",
        "total_acc": "total_acc",
        "today_mileage": "today_mileage",
        "today_acc": "today_acc",
        "state_duration": "state_duration",
        "first_landing_time": "jtt808_first_landing_time",
        "data_time": "data_time",
        'vhc_speed': 'vhc_speed',
    }

    var small_table_data = [
        [
            {'name':'车牌号码', 'field':'plate', 'value':'', 'unit':'', 'model':'vehicle'},
            {'name':'车型', 'field':'name', 'value':'', 'unit':'', 'model': 'model'},
            {'name':'VIN', 'field':'vin', 'value':'', 'model':'vehicle'},
            {'name':'SIM 卡号', 'field':'sim', 'value':'', 'model':'terminal'},
            {'name':'终端号', 'field':'terminal_id', 'model':'terminal', 'value':'', 'unit':''},
            {'name':'终端协议', 'field':'protocol', 'value':'', 'model':'terminal', 'unit':''},
        ],
        [
            {'name':'数据时间', 'field':'datetime', 'value':'', 'model':'position', 'unit':''},
            {'name':'车辆状态', 'field':'state', 'value':'', 'model':'position', 'unit':''},
        ],
        [
            {'name':'行驶速度', 'field':'speed', 'value':'', 'model':'position', 'unit':''},
            {'name':'终端总程', 'field':'mileage', 'value':'', 'model':'position', 'unit':''},

        ],
        [
            {'name':'地理位置', 'field':'address', 'value':'', 'model':'position'},
        ],
    ];

    var big_table_data = [
        {'name': '车牌号', 'field':'plate', '_id':'plate', 'value':'', 'model':'vehicle', 'unit':''},
        {'name': '车辆分组', 'field':'name', '_id':'team_name', 'model':'team', 'unit':''},
        {'name': '厂商车型', 'field':'name', '_id':'model_name', 'value':'', 'model':'model', 'unit':''},
        {'name': '终端协议', 'field':'protocol', '_id':'protocol', 'model':'terminal', 'value':'', 'unit':''},
        {'name': '终端号', 'field':'terminal_id', '_id':'terminal_id', 'model':'terminal', 'value':'', 'unit':''},
        {'name': 'SIM 卡号', 'field':'sim', '_id':'sim', 'value':'', 'model':'terminal', 'unit':''},
        {'name': 'VIN', 'field':'vin', '_id':'vin', 'value':'', 'model':'vehicle', 'unit':''},
        {'name': '第一次上线', 'field':'first_landing_time', '_id':'first_landing_time', 'model':'vehicle', 'unit':''},
        {'name': '行驶速度', 'field':'speed', '_id':'speed', 'model':'position', 'value':'', 'unit':'km/h'},
        {'name': '当日里程', 'field':'today_mileage', '_id':'today_mileage', 'model':'position', 'value':'', 'unit':'km'},
        {'name': '当日ACC', 'field':'today_acc', '_id':'today_acc', 'model':'position','unit':''},
        {'name': '行停时长', 'field':'state_duration', '_id':'state_duration', 'model':'position', 'unit':''},
        {'name': '总ACC', 'field':'total_acc', '_id':'total_acc', 'model':'position', 'unit':''},
        {'name': '车辆状态', 'field':'state', '_id':'state', 'model':'position', 'unit':''},
        {'name': '平台总程', 'field':'total_mileage', '_id':'total_mileage', 'model':'position', 'value':'', 'unit':'km'},
        {'name': '终端总程', 'field':'mileage', '_id':'mileage', 'model':'position', 'value':'', 'unit':'km'},
        {'name': '行驶方向', 'field':'direction', '_id':'direction', 'model':'position', 'value':'', 'unit':''},
        {'name': '记录仪速度', 'field':'vhc_speed', '_id':'vhc_speed', 'model':'position', 'value':'', 'unit':'km/h'},
        {'name': '定位地址', 'field':'address', '_id':'position', 'wholeRow':true, 'model':'position', 'value':'', 'unit':''},
    ];

    this.init = function(){
        infoWindow = $('<div class="mauna-infowindow" id="'+infoWindow_id+'"></div>');
        if (follow_icon) {
            infoWindow.attr('data-follow', 0);
        }
        infoWindow.append('<div class="mauna-small-infowindow"></div>');
        map_container.parent().prepend('<div class="mauna-big-infowindow"></div>');
        init_small_infowindow();
        init_big_infowindow();
        small_infowindow.hide();
        big_infowindow.hide();
    }

    this.small_infowindow = function(){
        return small_infowindow;
    }

    this.big_infowindow = function(){
        return big_infowindow;
    }

    //小窗
    function init_small_infowindow(){
        small_infowindow = infoWindow.find('.mauna-small-infowindow');

        small_infowindow.css({
            width: small_width,
            height: small_height,
        });
        small_infowindow.append(default_title);
        small_infowindow.append(default_content);
        small_infowindow.append(default_tri);

        small_infowindow.find('.mauna-infowindow-title').append();

        small_infowindow.find('.mauna-infowindow-title').append(default_car_name);
        init_follow_icon(small_infowindow);

        small_infowindow.find('.mauna-infowindow-title').append(default_expand);
        small_infowindow.find('.mauna-infowindow-expand').on('click', function(){
            switch_callback();
            small_infowindow.hide();
            big_infowindow.show();
        });


        small_infowindow.find('.mauna-infowindow-title').append(default_close_btn);
        small_infowindow.find('.mauna-infowindow-close').on('click', function(){
            close_callback();
            small_infowindow.hide();
        });
        small_infowindow.find('.mauna-infowindow-expand').tooltip({title:'展开', placement:'bottom'});
        small_infowindow.find('.mauna-infowindow-close').tooltip({title:'关闭', placement:'bottom'});
        small_infowindow.find('.mauna-infowindow-close').on('shown.bs.tooltip', function(){
            $($(this)[0].nextSibling).width(42);
        });

        small_infowindow.find('.mauna-infowindow-content').append(default_small_content);
        for (var i=0; i<small_table_data.length; i++){
            var name_container = small_infowindow.find('.mauna-infowindow-name:eq('+i+')');
            var value_container = small_infowindow.find('.mauna-infowindow-value:eq('+i+')');
            var fields = small_table_data[i];
            for (var j=0; j<fields.length; j++){
                name_container.append('<div class="mauna-infowindow-name-item" name="'+fields[j].field+'">'+fields[j].name+'</div>');
                value_container.append('<div class="mauna-infowindow-value-item" name="'+fields[j].field+'">'+fields[j].value+'</div>');
            }
        }
    }

    // 大窗
    function init_big_infowindow(){
        big_infowindow = map_container.parent().find('.mauna-big-infowindow');

        //big_infowindow = infoWindow.find('.mauna-big-infowindow');
        big_infowindow.css({
            width: '100%', // map_container.width(),
            height: '100%', //map_container.height(),
        });
        big_infowindow.append(default_title);
        big_infowindow.append(default_content);
        big_infowindow.parent().append(can_data_container);

        big_infowindow.find('.mauna-infowindow-title').append();

        big_infowindow.find('.mauna-infowindow-title').append(default_car_name);

        init_follow_icon(big_infowindow);

        big_infowindow.find('.mauna-infowindow-title').append(default_compress);
        big_infowindow.find('.mauna-infowindow-compress').on('click', function(){
            switch_callback();
            big_infowindow.hide();
            small_infowindow.show();
        });

        big_infowindow.find('.mauna-infowindow-title').append(default_close_btn);

        big_infowindow.find('.mauna-infowindow-close').on('click', function(){
            close_callback();
            var $this = $('.mauna-big-infowindow .mauna-can-data-icon');
            var candata = $this.attr('data-candata');
            var icon = $this.find('.can_icon');
            can_data.hide();
            $this.attr('data-candata', 0);
            icon.removeClass(check_class);
            icon.addClass(uncheck_class);
            big_infowindow.hide();
        });

        big_infowindow.find('.mauna-infowindow-compress').tooltip({title:'收起', placement:'bottom'});
        big_infowindow.find('.mauna-infowindow-close').tooltip({title:'关闭', placement:'bottom'});
        big_infowindow.find('.mauna-infowindow-close').on('shown.bs.tooltip', function(){
            $($(this)[0].nextSibling).width(42);
        });
        big_infowindow.find('.mauna-infowindow-content').append(default_table);
        big_infowindow.find('.mauna-infowindow-content').append(default_can);
        big_infowindow.append(default_gb);

        var table = big_infowindow.find('.mauna-infowindow-table');
        var can = big_infowindow.find('.mauna-infowindow-can');
        var can_data = big_infowindow.parent().find('.mauna-infowindow-can-data-container');

        table.append('<div id="big-infowindow-map" class="mauna-infowindow-map"></div><div class="mauna-infowindow-nomap">未定位</div><div class="mauna-infowindow-infos detail-table"></div>');
        init_big_content($('.mauna-infowindow-infos'), big_table_data);
        $('.mauna-big-infowindow .mauna-infowindow-infos').resize(function(){
            var talbe_height = $('.mauna-infowindow-infos').height();
            $('.mauna-big-infowindow .mauna-infowindow-table').height(talbe_height);
            $('.mauna-big-infowindow .mauna-infowindow-can').height('calc(100% - '+ talbe_height+'px)');
        });

        $('.mauna-big-infowindow .mauna-infowindow-can').append('<div class="mauna-infowindow-can-content">'+default_nocan+'</div>' + default_can_data_icon + default_can_icon );

        $('.mauna-big-infowindow .mauna-can-icon').click(function(){
            var $this = $(this);
            var onlycan = $this.attr('data-onlycan');
            var icon = $this.find('.can_icon');
            if (onlycan == 0) {
                $this.attr('data-onlycan', 1);
                icon.removeClass(uncheck_class);
                icon.addClass(check_class);
                table.hide();
            } else {
                $this.attr('data-onlycan', 0);
                icon.removeClass(check_class);
                icon.addClass(uncheck_class);
                table.show();
            }
        });

        $('.mauna-big-infowindow .mauna-can-data-icon').click(function(){
            var $this = $(this);
            var candata = $this.attr('data-candata');
            var icon = $this.find('.can_icon');
            if (candata == 0) {
                $this.attr('data-candata', 1);
                icon.removeClass(uncheck_class);
                icon.addClass(check_class);
                can_data.show();
            } else {
                $this.attr('data-candata', 0);
                icon.removeClass(check_class);
                icon.addClass(uncheck_class);
                can_data.hide();
            }
        });
        /*map_container.resize(function(){
         big_infowindow.css({
         width: map_container.width(),
         height: map_container.height()
         });
         //big_infowindow.find('.mauna-infowindow-row').css('height', '100%');
         });*/
        init_map('big-infowindow-map', null);

        can_data.draggable({containment: 'body', handle: '.mauna-infowindow-can-data-title'});
        can_data.append(can_data_title + can_data_box);

        var options = {
            container: can_data.find('.can-data-search-container'),
            placeholder: '筛选 CAN ID',
            callback : search_callback,
        };
        var searchInput = new mauna.searchInput(options);
        searchInput.init();

        function search_callback(keywords, no_matches, result_list){
            var count = 0;
            var can_data_box = can_data.find('.mauna-infowindow-can-data-box');
            can_data_box.find('.mauna-infowindow-can-data-item').each(function(){
                var _this = $(this);
                var can_id = _this.find('.can-data-item-value:first').html();
                if (can_id.indexOf(keywords) > -1) {
                    _this.show();
                    count++;
                } else {
                    _this.hide();
                }
            });

            if (count == 0) {
                no_matches.show()
            } else {
                no_matches.hide();
            }
        }

        $('.mauna-infowindow-can-data-container .can-data-close').click(function(){
            var $this = $('.mauna-big-infowindow .mauna-can-data-icon');
            var candata = $this.attr('data-candata');
            var icon = $this.find('.can_icon');
            can_data.hide();
            $this.attr('data-candata', 0);
            icon.removeClass(check_class);
            icon.addClass(uncheck_class);
        });

        //big_infowindow.hide();
    }

    function init_follow_icon(container){
        container.find('.mauna-infowindow-title').append(default_follow_icon);
        container.find('.mauna-follow-icon').on('click', function(){
            follow_callback(big_infowindow, small_infowindow);
        });
    }

    function init_map(id, icon, position, vehicle_state){
        if (!infowindow_map) {
            var minimap_options = {
                map_container: 'big-infowindow-map', //id
                latlng: [30,104],
                zoom: 11
            };
            infowindow_map = new mauna_minimap.init(minimap_options, function (){});
        }

        if (vehicle_state && vehicle_state.is_position) {
            var car_position = [position.position[1], position.position[0]];
            var options = {
                html: icon,
                iconSize: [70, 21],
                className: 'marker-div',
            };
            if (!infowwindow_marker) {
                infowwindow_marker = mauna_minimap.myIcon(infowindow_map, car_position, options, null);
                infowindow_map.setView(car_position);
            } else {
                mauna_minimap.changeIcon(infowwindow_marker, car_position, options)
                infowindow_map.setView(car_position);
            }
            //var bounds = infowindow_map.getBounds();
            //infowindow_map.setMaxBounds(bounds);
            infowindow_map.on('zoomend',function () {
                infowindow_map.panTo(car_position);
            });
            infowindow_map.on('moveend',function () {
                infowindow_map.panTo(car_position);
            });
            big_infowindow.find('.mauna-infowindow-map').show();
            big_infowindow.find('.mauna-infowindow-nomap').hide();
        } else {
            big_infowindow.find('.mauna-infowindow-nomap').show();
            big_infowindow.find('.mauna-infowindow-map').hide();
        }
    }

    function init_car_state(container, car_id, car_icon, car_name){
        var follow_icon = container.find('.follow_icon');
        if (window.vehicle_map_tool) {
            if (vehicle_map_tool.follow_cars[car_id]) {
                follow_icon.addClass(check_class);
                follow_icon.removeClass(uncheck_class);
            } else {
                follow_icon.addClass(uncheck_class);
                follow_icon.removeClass(check_class);
            }
        }

        container = container.find('.mauna-infowindow-car-name');
        container.empty();
        container.append(car_icon + car_name);
        container.find('img').tooltip({title: car_state, placement:'bottom'});
    }

    function get_value(card, field, vehicle, position, terminal){
        var value = '';
        if (!vehicle || !position || !terminal) return value;
        if (field.model == 'vehicle') {
            if (field.field == 'first_landing_time' || field.field == 'data_time') {
                var date;
                if (vehicle[fields_config[field.field]] && vehicle[fields_config[field.field]].sec) {
                    date = new Date(vehicle[fields_config[field.field]].sec * 1000);
                } else if (vehicle[fields_config[field.field]] && vehicle[fields_config[field.field]].iso) {
                    date = new Date(vehicle[fields_config[field.field]].iso);
                } else {
                    value = vehicle[fields_config[field.field]];
                }
                value = date ? date.format("yyyy-mm-dd HH:MM:ss") : value;
            } else {
                vehicle[fields_config[field.field]] ? value = vehicle[fields_config[field.field]] : value = '';
            }
        } else if (field.model == 'position') {
            if (field.field == 'address') {
                if (vehicle.vehicle_state.is_position) {
                    value = position[fields_config[field.field]];
                } else if (!vehicle.vehicle_state.been_online) {
                    value = '';
                } else {
                    var last_pos_time, address;
                    vehicle.last_pos_time ? last_pos_time = transform_to_datetime(vehicle.last_pos_time) : last_pos_time = '暂无';
                    position[fields_config[field.field]] ? address = position[fields_config[field.field]] : address = '暂无';
                    if (card == 'small') {
                        value = '(最后有效位置：'+ last_pos_time + ')<br/>' + address;
                    } else {
                        value = '(最后有效位置：'+ last_pos_time + ') ' + address;
                    }
                }
                //debugger
                //console.log('最后一次更新时间还没做！！！！！！！！！！！！');
            } else if (field.field == 'state') {
                value = car_state.car_state;
            } else if (field.field == 'direction') {
                value = car_state.direction;
            } else {
                position[fields_config[field.field]] ? value = position[fields_config[field.field]] : value = '';
            }
        } else if (field.model == 'model') {
            value = vehicle['model'] ? vehicle['model'][fields_config[field.field]] : '';
        } else if (field.model == 'team') {
            value = vehicle['team'][fields_config[field.field]];
        } else if (field.model == 'terminal') {
            if (field.field == 'protocol') {
                value = Window.vehicle_state.show_options.protocol == 0 ? '部标协议' : '国标协议';
            } else {
                terminal[fields_config[field.field]] ? value = terminal[fields_config[field.field]] : value = '';
            }
        }
        if (field.field == 'state_duration') {
            position.is_running == '行驶' ? value = ('行驶-' + value) : value = ('停止-' + value);
        }
        return value;
    }

    function init_big_content(container, fields, vehicle, position, terminal){
        //container.empty();
        var detail_data = {};
        for (var i=0; i<fields.length; i++){
            var item = fields[i];
            detail_data[item['_id']] = get_value('big', item, vehicle, position, terminal);
        }
        if (!big_table_content) {
            big_table_content = container.maunaDetailTable({
                cols: 4,
                fields: fields,
            });
            big_table_content.init();
        } else {
            big_table_content.refreshData(detail_data);
        }
    }

    function init_small_data(vehicle, position, terminal){
        //debugger
        var car_id = vehicle._id || vehicle.objectId;
        var car_icon = '<img class="car-map-icon" style="transform:rotate('+car_state.direction+'deg)" src="'+car_state.car_map_icon+'" />';
        vehicle.telematics_box = [terminal];
        var car_name = Window.vehicle_state.set_child_text({original: vehicle});
        init_car_state(small_infowindow, car_id, car_icon, car_name);
        for (var i=0; i<small_table_data.length; i++){
            var fields = small_table_data[i];
            for (var j=0; j<fields.length; j++) {
                var field = fields[j];
                var value_container = $('.mauna-infowindow-value-item[name="'+field.field+'"]');
                value = get_value('small', field, vehicle, position, terminal);
                value_container.html(value);
                value_container.attr('data-original-title', value);
                value_container.tooltip({html: true});
                if (field.field == 'state') {
                    small_infowindow.find('.mauna-infowindow-row2').height('46px');
                    small_infowindow.height(small_height);
                    value_container.height('20px');
                    if (value.length > 22) {
                        var row_height = small_infowindow.find('.mauna-infowindow-row2').height();
                        small_infowindow.find('.mauna-infowindow-row2').height(row_height + 28);
                        small_infowindow.height(small_infowindow.height() + 28);
                        value_container.height(value_container.height() + 28);
                    } else if (value.length > 12) {
                        var row_height = small_infowindow.find('.mauna-infowindow-row2').height();
                        small_infowindow.find('.mauna-infowindow-row2').height(row_height + 14);
                        small_infowindow.height(small_infowindow.height() + 14);
                        value_container.height(value_container.height() + 14);
                    }
                }
            }
        }

        if (vehicle.model && vehicle.model.image) {
            var src = small_infowindow.find('img.mauna-infowindow-picture').attr('src');
            var url = vehicle.model.image.url || vehicle.model.image.path;
            if (src != url) {
                small_infowindow.find('img.mauna-infowindow-picture').attr('src', url);
            }
            small_infowindow.find('.mauna-infowindow-nopicture').hide();
            small_infowindow.find('img.mauna-infowindow-picture').show();
            small_infowindow.find('img.mauna-infowindow-picture').css('display', 'block');
        } else {
            small_infowindow.find('img.mauna-infowindow-picture').hide();
            small_infowindow.find('.mauna-infowindow-nopicture').show();
        }
    }

    function init_big_data(vehicle, position, terminal, protocol, refresh){
        var car_id = vehicle._id || vehicle.objectId;
        var car_icon = '<img class="car-map-icon" style="transform:rotate('+car_state.direction+'deg)" src="'+car_state.car_map_icon+'" />';
        //var car_name = vehicle.name + ' ' + car_state.car_state ;
        vehicle.telematics_box = [terminal];
        var car_name = Window.vehicle_state.set_child_text({original: vehicle});
        init_car_state(big_infowindow, car_id, car_icon, car_name);
        if (protocol == 0) {
            init_big_content($('.mauna-infowindow-infos'), big_table_data, vehicle, position, terminal);
            init_map(car_id, car_icon, position, vehicle.vehicle_state);
            if (card_type != 'position_card') {
                if (refresh) {
                    refresh_can_data(vehicle);
                } else {
                    init_can_data(vehicle);
                }
            }
            if(refresh) {
                refresh_can(vehicle);
            } else {
                init_can(vehicle);
            }
            var talbe_height = $('.mauna-infowindow-infos').height();
            $('.mauna-big-infowindow .mauna-infowindow-table').height(talbe_height);
            $('.mauna-big-infowindow .mauna-infowindow-can').height('calc(100% - '+ talbe_height+'px)');
            big_infowindow.find('.mauna-infowindow-content').show();
            big_infowindow.find('.mauna-infowindow-gb').hide();
        }  else {
            if(refresh) {
                refresh_gb(vehicle);
            }else {
                init_gb(vehicle);
            }

            big_infowindow.find('.mauna-infowindow-content').hide();
            big_infowindow.find('.mauna-infowindow-gb').show();
        }
    }

    function refresh_can_data(vehicle) {
        var can_data = big_infowindow.parent().find('.mauna-infowindow-can-data-container');
        var can_data_box = can_data.find('.mauna-infowindow-can-data-box');
        var url = '?app=data&controller=object&action=find';
        var datetime = new Date();
        var data = {
            'class': 'jtt808_can',
            'where': {
                'createAt': {
                    '$gt': {
                        '__type': 'Date',
                        'iso': datetime.toISOString(),
                    }
                },
                'vehicle' : {
                    '__type':'Pointer',
                    'className':'vehicle',
                    'objectId': vehicle._id,
                },
            },
            'page': 1, //Number.MAX_SAFE_INTEGER,
            'pageSize': Number.MAX_SAFE_INTEGER,
        }
        $.ajaxSettings.global = false;
        $.ajax({
            url: url,
            type: 'POST',
            dataType: 'json',
            data: JSON.stringify(data),
            success: function(res){
                if (res.state) {
                    var data = res.data;
                    if (!data || !$.isArray(data)) return;
                    for (var j=0; j<data.length; j++){
                        var intermediate_data = data[j].intermediate_data;
                        if (!intermediate_data) continue;
                        var datetime = transform_to_datetime(intermediate_data.date);
                        var items = intermediate_data.items;
                        for (var i=0; i<items.length; i++){
                            var html = '<div class="mauna-infowindow-can-data-item">';
                            html += '<div><span class="can-data-item-name">CAN ID ：</span><span class="can-data-item-value">'+items[i].can_id+'</span></div>';
                            html += '<div><span class="can-data-item-name">DATA ：</span><span class="can-data-item-value">'+items[i].can_data+'</span></div>';
                            html += '<div><span class="can-data-item-name">'+datetime+'</span></div>';
                            html += '</div>';
                            can_data_box.append(html);
                        }
                    }
                } else {

                }
            },
        });

        $.ajaxSettings.global = true;

        /*var can = vehicle.jtt808_can;
         if (!can) return;
         var intermediate_data = can.intermediate_data;
         if (!intermediate_data) return;
         var datetime = transform_to_datetime(intermediate_data.date);
         var items = intermediate_data.items;
         for (var i=0; i<items.length; i++){
         var html = '<div class="mauna-infowindow-can-data-item">';
         html += '<div><span class="can-data-item-name">CAN ID ：</span><span class="can-data-item-value">'+items[i].can_id+'</span></div>';
         html += '<div><span class="can-data-item-name">DATA ：</span><span class="can-data-item-value">'+items[i].can_data+'</span></div>';
         html += '<div><span class="can-data-item-name">'+datetime+'</span></div>';
         html += '</div>';
         can_data_box.append(html);
         }*/
    }

    function init_can_data(vehicle) {
        var can_data = big_infowindow.parent().find('.mauna-infowindow-can-data-container');
        var $this = $('.mauna-big-infowindow .mauna-can-data-icon');
        var candata = $this.attr('data-candata');
        var icon = $this.find('.can_icon');
        $this.attr('data-candata', 0);
        icon.removeClass(check_class);
        icon.addClass(uncheck_class);
        can_data.hide();
        can_data.find('.mauna-infowindow-can-data-box').empty();
        refresh_can_data(vehicle);
    }

    function init_can(data) {
        var html = $('.mauna-big-infowindow .mauna-infowindow-content').find('.mauna-infowindow-can-content');
        var options = {
            car_model: data.model._id,
            can_template_container: html
        };
        var _data = data&&data.jtt808_can?data.jtt808_can:{};
        getRules(data.model._id).then(function(rules) {
            options.data = decode_data(_data, rules);
            can_template = new can(options);
            can_template.init();
            if (JSON.stringify(rules) == '{}') {
                big_infowindow.find('.mauna-infowindow-nocan').show();
            } else {
                big_infowindow.find('.mauna-infowindow-nocan').hide();
            }
        });
    }

    function decode_data(data, rules) {
        for(var key in data) {
            var _rule = rules[key];
            if(_rule) {
                if(typeof(data[key]) == 'number'){
                    var value = data[key];
                    data[key] = data[key]*(_rule['coefficient']?_rule['coefficient']:1)+(_rule['offset']?_rule['offset']:0)+(_rule['unit']?' '+_rule['unit']:'')
                    /*
                     if(!$.isEmpty(value)) {
                     if(value > _rule['max'] || value < _rule['min']) {
                     data[key] = '非法数据('+value+')';
                     }else {
                     var coefficient = _rule['coefficient']?_rule['coefficient']:1;
                     value = value * coefficient;
                     if(_rule['offset']) {
                     value += parseInt(_rule['offset']);
                     }
                     if((coefficient+'').indexOf('.') != -1) {
                     value = value.toFixed((coefficient+'').length - (coefficient+'').indexOf('.')-1);
                     }
                     data[key] = value +(_rule['unit']?' '+_rule['unit']:'');
                     }
                     }
                     */

                }
                if(_rule['displayrule']) {
                    var displayrule = null;
                    try{
                        //console.log(_rule['displayrule']);
                        displayrule = $.parseJSON(_rule['displayrule']);
                    }catch(e) {
                        //console.log(e);
                    }
                    if(displayrule) {
                        data[key] = displayrule[data[key]]?displayrule[data[key]]:data[key]
                    }
                }
            }
        }
        return data;
    }

    function refresh_can(data){
        if(can_template && currentRules) {
            var data = data&&data.jtt808_can?data.jtt808_can:{};
            data = decode_data(data, currentRules);
            can_template.refresh(data);
            if (JSON.stringify(currentRules) == '{}'){
                big_infowindow.find('.mauna-infowindow-nocan').show();
            } else {
                big_infowindow.find('.mauna-infowindow-nocan').hide();
            }
        }
    }

    function init_gb(data){
        var html = $('.mauna-big-infowindow').find('.mauna-infowindow-gb');
        var gtb_data = data&&data.gbt32960_decode_position?$.extend(true, {}, data.gbt32960_decode_position):{};
        var alarm_data = data&&data.gbt32960_decode_warning_data?$.extend(true, {}, data.gbt32960_decode_warning_data):{};
        gtb_data = $.extend(true, {}, gtb_data, alarm_data, data);
        var options = {
            container: html,
            data:gtb_data
        };
        gtb_template = new national_standard(options);
        gtb_template.init();
    }

    function refresh_gb(data){
        if(gtb_template) {
            var gtb_data = data&&data.gbt32960_decode_position?$.extend(true, {}, data.gbt32960_decode_position):{};
            var alarm_data = data&&data.gbt32960_decode_warning_data?$.extend(true, {}, data.gbt32960_decode_warning_data):{};
            gtb_data = $.extend(true, {}, gtb_data, alarm_data, data);
            gtb_template.refresh(gtb_data);
        }
    }

    function getCanData(vehicle) {
        var candata_model = new parse.model('can');
        var defer = $.Deferred();
        candata_model.get_list({"post_data":{
            'where': {
                'vehicle' : {
                    '__type':'Pointer',
                    'className':'vehicle',
                    'objectId': vehicle,
                },
            },
            limit: 1,
        }}).done(function(res){
            if (res.state) {
                model_data = res.data;
                //model_data = candata_model.decode_data(model_data, true);
                defer.resolve(model_data);
            } else {
                mauna.tips('获取车型列表失败', 'error');
            }
        });
        return defer.promise();
    }

    function getGtbData(vehicle) {
        var gtbdata_model = new parse.model('gbt32960_data');
        var defer = $.Deferred();
        gtbdata_model.get_list({"post_data":{
            'where': {
                'vehicle' : {
                    '__type':'Pointer',
                    'className':'vehicle',
                    'objectId': vehicle,
                },
            },
            limit: 1,
        }}).done(function(res){
            if (res.state) {
                model_data = res.data?res.data[0]:{};
                //model_data = gtbdata_model.decode_data(model_data, true);
                defer.resolve(model_data);
            } else {
                mauna.tips('获取车型列表失败', 'error');
            }
        });
        return defer.promise();
    }

    function getRules(model, type) {
        var _class = 'jtt808_can_rule';
        var rule_model = new parse.model(_class);
        var defer = $.Deferred();
        rule_model.get_list({"post_data":{
            'where': {
                'model' : {
                    '__type':'Pointer',
                    'className':'vehicle_models',
                    'objectId': model,
                },
            },
            limit: Number.MAX_SAFE_INTEGER,
        }}).done(function(res){
            if (res.state) {
                var rules = res.data?res.data:[];
                var _len = rules.length;
                currentRules = {};
                for(var i = 0; i < _len; i++) {
                    var _rule = rules[i];
                    currentRules[_rule.signalnameid] = _rule;
                }
                defer.resolve(currentRules);
            } else {
                mauna.tips('获取规则列表失败', 'error');
            }
        });
        return defer.promise();
    }

    this.get_content = function(options){
        //debugger
        card_type = options.card_type || 'small';
        var car_id = options.car_id;
        var position_id = options.position_id;
        var protocol = options.protocol;
        var refresh = options.refresh;
        var data = options.data;
        var defer = $.Deferred();

        if (card_type == 'position_card') {
            if (data) {
                var terminal = data['terminal']?data['terminal']:{};
                var vehicle = data[modelConfig['vehicle']];
                var position = data['position'];
                big_infowindow.find('.mauna-follow-icon').hide();
                small_infowindow.find('.mauna-follow-icon').hide();
                car_state = vehicle.vehicle_state;
                var position_id = position.id;
                if (car_state.is_position) {
                    if (position) {
                        var location;
                        if (position.location) location = position.location;
                        if (position.position) location = position.position;
                        if (location) {
                            car_position = [(location[1]).toFixed(6), (location[0]).toFixed(6)];
                        }
                    }

                    setTimeout(function(){init_small_data(vehicle, position, terminal)}, 0);
                    setTimeout(function(){init_big_data(vehicle, position, terminal, protocol, refresh)}, 0);
                    small_infowindow.show();

                    defer.resolve({content: infoWindow[0], position: car_position, state: car_state, name: vehicle.name, position_id: position_id});
                } else {
                    mauna.tips('车辆无可用位置', 'warn');
                    small_infowindow.hide();
                    big_infowindow.hide();
                    close_callback();
                    defer.reject();
                }
            }

        } else {
            if (card_type == 'small') {
                small_infowindow.show();
            } else if (card_type == 'big') {
                big_infowindow.show();
            }
            if (window.cars_info[car_id]) {
                var data = monitor.getCarsInfo(car_id);
                var terminal = data['terminal']?data['terminal']:{};
                var vehicle = data[modelConfig['vehicle']];
                big_infowindow.find('.mauna-follow-icon').show();
                small_infowindow.find('.mauna-follow-icon').show();
                var position = data['position'];
                car_state = vehicle.vehicle_state;
                if (position) {
                    var location;
                    if (position.location) location = position.location;
                    if (position.position) location = position.position;
                    if (location) {
                        car_position = [(location[0]).toFixed(6), (location[1]).toFixed(6)];
                    }
                }
                var first_landing;
                if (Window.vehicle_state.show_options.protocol == 0) {
                    vehicle.jtt808_first_landing_time ? first_landing = true : first_landing = false;
                } else {
                    vehicle.gbt32960_first_landing_time ? first_landing = true : first_landing = false;
                }
                setTimeout(function(){init_small_data(vehicle, position, terminal)}, 0);
                setTimeout(function(){init_big_data(vehicle, position, terminal, protocol, refresh)}, 0);
                defer.resolve({content: infoWindow[0], position: car_position, state: car_state, name: vehicle.name, first_landing: first_landing});
            } else {
                mauna.tips('加载车辆信息失败', 'warn');
                defer.reject();
            }
        }


        return defer.promise();
    }
    /////　点击未勾选的车辆，打开信息卡片，卡片位置如何确定？
    this.init();

    this.hide_all = function(){
        small_infowindow.hide();
        big_infowindow.hide();
    }

    return this;
}