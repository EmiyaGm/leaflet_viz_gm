var mauna_infoWindow = function(options){
    var infoWindow, small_infowindow, big_infowindow, card_infowindow, can_data, gb_data;
    var tree = options.tree;
    var map_container = options.map_container;
    var data = options.data || {};                      //data
    var infoWindow_id = options.id;                     //
    var car_id = options.car_id;
    var protocol = options.protocol;                        //
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
    var jtt_infowindow_map, gb_infowindow_map, infowwindow_marker;
    var car_position, car_state;
    var big_table_content;
    var gb_big_table_content;
    var active_tab = 'car-name';
    const POSITION_CARD = 'position_card';

    var small_height = 240;
    var small_width = 408;
    var _gtb_infowindow_content;
    
    var default_title = '<div class="mauna-infowindow-title"></div>';
    var default_content = '<div class="mauna-infowindow-content"></div>';
    var default_table = '<div class="mauna-infowindow-table"></div>';
    var default_can = '<div class="mauna-infowindow-can"></div>';
    var default_gb = '<div class="mauna-infowindow-gb"></div>';
    var default_gb_content = '<div class="mauna-infowindow-gb-content"></div>';
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
    var default_shortcut_content = '<div class="mauna-infowindow-shortcut-content"></div>';
    var default_content_row = '<div class="mauna-infowindow-row"></div>';
    var default_content_item = '<div class="mauna-infowindow-item"></div>';
    var default_car_icon = '<i class="icon-pl-car-normal car-card-icon running"></i>';
    var default_car_name = '<span class="mauna-infowindow-car-name"></span>';
    var default_shortcut_title = '<div class="mauna-infowindow-shortcut-title">\
                                    <i class="icon-shortcut"></i>常用快捷\
                                </div>';
    var default_tri = '<div class="mauna-infowindow-tri"></div>';
    var default_follow_icon = '<span class="mauna-follow-icon">跟踪车辆<i class="follow_icon map_checkbox"></i></span>';
    var default_can_icon = '<span class="mauna-can-icon" data-onlycan="0">只显示CAN数据<i class="can_icon map_checkbox"></i></span>';
    var default_can_data_icon = '<span class="mauna-can-data-icon" data-candata="0">原始数据<i class="can_icon map_checkbox"></i></span>';
    var default_gb_data_icon = '<span class="mauna-gb-data-icon" data-gbdata="0">原始数据<i class="can_icon map_checkbox"></i></span>';
    var default_close_btn = '<div class="mauna-title-icon mauna-infowindow-close"><i data-placement="auto bottom" data-toggle="tooltip" data-original-title="关闭"></i></div>';
    var default_expand = '<div class="mauna-title-icon mauna-infowindow-expand"><i data-placement="auto bottom" data-toggle="tooltip" data-original-title="展开"></i></div>';
    var default_compress = '<div class="mauna-title-icon mauna-infowindow-compress"><i data-placement="auto bottom" data-toggle="tooltip" data-original-title="收起"></i></div>';
    var default_nocan = '<div class="mauna-infowindow-nocan"><div>该车型没有配置CAN解析和展示规则</div></div>';
    var can_data_container = '<div style="display:none" class="mauna-infowindow-can-data-container"></div>';
    var can_data_title = '<div class="mauna-infowindow-can-data-title"><span>原始数据</span><div class="can-data-search-container"></div><div class="can-data-close mauna-title-icon mauna-infowindow-close"><i data-placement="auto bottom" data-toggle="tooltip" data-original-title="关闭"></i></div></div>';
    var can_data_box = '<div class="mauna-infowindow-can-data-box"></div>';
    var gb_data_container = '<div style="display:none" class="mauna-infowindow-gb-data-container"></div>';
    var gb_data_title = '<div class="mauna-infowindow-gb-data-title"><span>原始数据</span><div class="gb-data-search-container"></div><div class="gb-data-close mauna-title-icon mauna-infowindow-close"><i data-placement="auto bottom" data-toggle="tooltip" data-original-title="关闭"></i></div></div>';
    var gb_data_box = '<div class="mauna-infowindow-gb-data-box"></div>';
    var gb_slice_data_box = '<div class="mauna-infowindow-gb-slice-data-box"></div>';
    var check_class = 'map_checkbox_checked';
    var title_active_class = "mauna-infowindow-title-active";
    var uncheck_class = 'map_checkbox';


    var gb_content_template = '<div class="gb mauna-tab-container">\
                                    <div class="mauna-tab" target="#gb_car_info"><span>车辆信息</span></div>\
                                    <div class="mauna-tab" target="#gb_info"><span>国标数据</span></div>\
                                    <div class="mauna-tab" target="#login_logout"><span>登入 / 登出</span></div>\
                                    <div class="mauna-tab" target="#statistics"><span>统计分析</span></div>\
                                    <!--div class="mauna-tab" target="#gb_can"><span>CAN</span></div-->\
                                </div>\
                                <div class="gtb mauna-can-content">\
                                    <div id="gb_car_info" class="mauna-tab-content"></div>\
                                    <div id="gb_info" class="mauna-tab-content"></div>\
                                    <div id="login_logout" class="mauna-tab-content"></div>\
                                    <div id="statistics" class="mauna-tab-content"></div>\
                                    <!--div id="gb_can" class="mauna-tab-content"></div-->\
                                </div>'

    var can_template;
    var gtb_template;
    var vehicle_model = new parse.model(modelConfig['vehicle']);
    var position_model = new parse.model(modelConfig['position']);
    var terminal_model = new parse.model(modelConfig['terminal']);
    var currentRules = {};
    var show_rules = [];
    var gb_data_cache = {};
    var has_tab = false;
    var interval_refresh;
    var last_can_datetime, last_gb_datetime;
    var can_keywords = "", gb_keywords = "";    
    var search_result_class = 'search-result';

    var null_value = '-';
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
            {'name':'终端链路', 'field':'protocol', 'value':'', 'model':'terminal', 'unit':''},
        ],
        [
            {'name':'数据时间', 'field':'datetime', 'value':'', 'model':'position', 'unit':''},
            {'name':'综合状态', 'field':'state', 'value':'', 'model':'position', 'unit':''},            
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
        {'name': '终端链路', 'field':'protocol', '_id':'protocol', 'model':'terminal', 'value':'', 'unit':''},
        {'name': '终端号', 'field':'terminal_id', '_id':'terminal_id', 'model':'terminal', 'value':'', 'unit':''},
        {'name': 'SIM 卡号', 'field':'sim', '_id':'sim', 'value':'', 'model':'terminal', 'unit':''},
        {'name': 'VIN', 'field':'vin', '_id':'vin', 'value':'', 'model':'vehicle', 'unit':''},
        {'name': '首次上线', 'field':'first_landing_time', '_id':'first_landing_time', 'model':'vehicle', 'unit':''},
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

    var gb_big_table_data;
    
    var small_infowindow_shortcut_config = [
        {
            "title": "常用报表",
            "icon": "icon-stat",
            "url": "?app=vehicle&controller=vehicle&action=minichartInquire",
            "data": [
                {
                    "title": "历史数据",
                    "type": "trajectory",
                },                
                {
                    "title": "统计里程",
                    "type": "mileage",
                },
            ],
        },
        {
            "title": "常用指令",
            "icon": "icon-text",
            "url": "?app=vehicle&controller=params&action=set_mini_terminal_view",
            "data": [
                {
                    "title": "终端属性查询",
                    "type": "157",
                },
                {
                    "title": "通信连接参数",
                    "type": "177",
                },
                {
                    "title": "服务器参数",                    
                    "type": "178",
                },
                {
                    "title": "电话号码参数",                    
                    "type": "179",
                },
                {
                    "title": "位置汇报参数",                    
                    "type": "180",
                },
                {
                    "title": "报警参数",                    
                    "type": "181",
                },                
                {
                    "title": "车辆参数",                    
                    "type": "184",
                },
                {
                    "title": "国标参数",
                    "type": "191",                    
                },
                {
                    "title": "车联网参数",
                    "type": "192",                    
                },
                {
                    "title": "连接服务器",
                    "type": "187",                    
                },
                {
                    "title": "终端开关控制",
                    "type": "188",                    
                },
                {
                    "title": "远程控制",
                    "type": "212",                    
                },
                {
                    "title": "CAN 参数设置",
                    "type": "190",                    
                },
            ]
        }
    ];

    var big_infowindow_tab_config = [
        
        {
            "title": "报表",
            "name": "chart",
            "url": "?app=vehicle&controller=vehicle&action=minichartInquireTab",
        }, 
           
        {
            "title": "指令",
            "name": "terminal",
            "url": "?app=vehicle&controller=params&action=set_terminal_view",
        },
        {
            "title": "液位统计",
            "name": "liquid",
            "url": "?app=vehicle&controller=vehicle&action=liquid_chart",
        },
        {
            "title": "报警",
            "name": "alarm",
            "url": "?app=vehicle&controller=vehicle&action=miniAlarmTab",
        },

    ];

    var gb_raw_data_config = {
        "0x01": "整车数据",
        "0x02": "驱动电机数据",
        "0x03": "燃料电池数据",
        "0x04": "发动机数据",
        "0x05": "车辆位置",
        "0x06": "极值数据",
        "0x07": "报警数据",
        "0x08": "可充电储能装置电压数据",
        "0x09": "可充电储能装置温度数据",
        "0x0A~0x2F": "平台交换协议数据",
        "0x30~0x7E": "预留",
        "0x80~0xFE": "自定义",
    }

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

        $(infoWindow).on('contextmenu', function(){
            return false;
        })
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
        small_infowindow.append(default_shortcut_content);        
        //small_infowindow.append(default_tri);

        small_infowindow.find('.mauna-infowindow-title').append();

        small_infowindow.find('.mauna-infowindow-title').append(default_car_name + default_shortcut_title);
        init_follow_icon(small_infowindow);

        small_infowindow.find('.mauna-infowindow-title').append(default_expand);
        small_infowindow.find('.mauna-infowindow-expand').on('click', function(){
            switch_callback();
            small_infowindow.hide();
            big_infowindow.show();
        });

        small_infowindow.find('.mauna-infowindow-title').append(default_close_btn);
        small_infowindow.find('.mauna-infowindow-close').on('click', function(){
            if (interval_refresh) {
                clearInterval(interval_refresh);
                last_can_datetime = null;
            }
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

        init_shortcut_content();

        small_infowindow.find('.mauna-infowindow-car-name').addClass(title_active_class);
        var content = small_infowindow.find('.mauna-infowindow-content');
        var shortcut_content = small_infowindow.find('.mauna-infowindow-shortcut-content');

        small_infowindow.find('.mauna-infowindow-shortcut-title').click(function(){
            content.hide();
            shortcut_content.show();
            small_infowindow.find('.mauna-infowindow-shortcut-title').addClass(title_active_class);
            small_infowindow.find('.mauna-infowindow-car-name').removeClass(title_active_class);
        });

         small_infowindow.find('.mauna-infowindow-car-name').click(function(){
            content.show();
            shortcut_content.hide();
            small_infowindow.find('.mauna-infowindow-shortcut-title').removeClass(title_active_class);
            small_infowindow.find('.mauna-infowindow-car-name').addClass(title_active_class);
        });
    }

    // 大窗
    function init_big_infowindow(){
        
        big_infowindow = map_container.parent().find('.mauna-big-infowindow');

        //big_infowindow = infoWindow.find('.mauna-big-infowindow');
        big_infowindow.css({
            width: '100%', // map_container.width(),
            height: '100%', //map_container.height(),
        });
         
        make_infowindow_header();
        big_infowindow.append(default_gb);
        big_infowindow.append(default_content);
        make_can_data();
        make_gb_data();

        init_big_infowindow_content();
        

        //big_infowindow.find('.mauna-infowindow-gb').append(default_gb_data_icon);

        /*map_container.resize(function(){
            big_infowindow.css({
                width: map_container.width(),
                height: map_container.height()
            });
            //big_infowindow.find('.mauna-infowindow-row').css('height', '100%');
        });*/
        
        //big_infowindow.hide();
    }

    function make_infowindow_header() { 
        big_infowindow.append(default_title);
        
        big_infowindow.find('.mauna-infowindow-title').append(default_car_name);

        init_follow_icon(big_infowindow);

        for (var i=0; i<big_infowindow_tab_config.length; i++) {
            var item = big_infowindow_tab_config[i];
            var title_html = '<div class="mauna-infowindow-tab-title" name="'+item.name+'">'+item.title+'</div>';
            var _title_html = $(title_html);
            big_infowindow.find('.mauna-infowindow-title').append(_title_html);
            var content_html = '<div class="mauna-infowindow-tab-content" name="'+item.name+'"  style="display:none">\
                                                <div  id="div_'+item.name+'" data-url="'+item.url+'"></div>\
                                        </div>';
            big_infowindow.append(content_html);
        }

        big_infowindow.find('.mauna-infowindow-tab-title').click(function(){
            var name = $(this).attr('name');
            active_tab = name;
            big_infowindow.find('.mauna-infowindow-tab-content').hide();
            big_infowindow.find('.mauna-infowindow-content').hide();
            big_infowindow.find('.mauna-infowindow-gb').hide();
            big_infowindow.find('.mauna-infowindow-tab-content[name='+name+']').show();

            big_infowindow.find('.mauna-infowindow-tab-title').removeClass(title_active_class);
            big_infowindow.find('.mauna-infowindow-car-name').removeClass(title_active_class);
            big_infowindow.find('.mauna-infowindow-tab-title[name='+name+']').addClass(title_active_class);
        });

        big_infowindow.find('.mauna-infowindow-car-name').click(function(){
            active_tab = 'car-name';
            big_infowindow.find('.mauna-infowindow-tab-content').hide();
            var _protocol = $('.mauna-big-infowindow').data('protocol');
            if (_protocol == 'jtt808') {
                big_infowindow.find('.mauna-infowindow-content').show();
                big_infowindow.find('.mauna-infowindow-gb').hide();
            }else if(_protocol == 'gbt32960'){
                big_infowindow.find('.mauna-infowindow-content').hide();
                big_infowindow.find('.mauna-infowindow-gb').show();
            }
            
            big_infowindow.find('.mauna-infowindow-tab-title').removeClass(title_active_class);
            big_infowindow.find('.mauna-infowindow-car-name').addClass(title_active_class);
        });
        
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

            var $this = $('.mauna-big-infowindow .mauna-gb-data-icon');
            var gbdata = $this.attr('data-gbdata');
            var icon = $this.find('.can_icon');
            gb_data.hide();
            $this.attr('data-gbdata', 0);
            icon.removeClass(check_class);
            icon.addClass(uncheck_class);

            if (interval_refresh) {
                clearInterval(interval_refresh);
                last_can_datetime = null;
                last_gb_datetime = null;
            }
            big_infowindow.hide();
        });

        big_infowindow.find('.mauna-infowindow-compress').tooltip({title:'收起', placement:'bottom'});
        big_infowindow.find('.mauna-infowindow-close').tooltip({title:'关闭', placement:'bottom'});
        big_infowindow.find('.mauna-infowindow-close').on('shown.bs.tooltip', function(){
            $($(this)[0].nextSibling).width(42);
        });
    }
    
    function make_gb_data() { 

        big_infowindow.parent().append(gb_data_container);

        gb_data = big_infowindow.parent().find('.mauna-infowindow-gb-data-container');
        
        gb_data.draggable({containment: 'body', handle: '.mauna-infowindow-gb-data-title'});
        gb_data.append(gb_data_title + gb_data_box + gb_slice_data_box);
        var gb_slice_data = gb_data.find('.mauna-infowindow-gb-slice-data-box');
        
        $('.mauna-infowindow-gb-data-container .gb-data-close').click(function(){
            var $this = $('.mauna-big-infowindow .mauna-gb-data-icon');
            var gbdata = $this.attr('data-gbdata');
            var icon = $this.find('.can_icon');
            gb_data.hide();
            $this.attr('data-gbdata', 0);
            icon.removeClass(check_class);
            icon.addClass(uncheck_class);
        });

        var active_class = 'mauna-infowindow-gb-data-item-active';

        gb_data.on('click', '.mauna-infowindow-gb-data-item', function(){
            $('.mauna-infowindow-gb-data-item').each(function(){
                $(this).removeClass(active_class);
            })

            $(this).addClass(active_class);
            var data_id = $(this).attr('data-id');

            var raw_slice_data = gb_data_cache[data_id];
            gb_slice_data.empty();
            for (var name in gb_raw_data_config){
                var _name = gb_raw_data_config[name];
                var _value = raw_slice_data[name] || "无";
                var html = '<div class="mauna-infowindow-gb-slice-data-item">';
                html += '<div class="mauna-infowindow-gb-slice-data-name">'+name + ' ' + _name +'：</div>';
                html += '<div class="mauna-infowindow-gb-slice-data-value">'+_value+'</div>';
                html += '</div>';
                gb_slice_data.append(html);
            }
        });

        var gb_options = {
            container: gb_data.find('.gb-data-search-container'),
            placeholder: '关键词',
            callback : gb_search_callback,
        };
        var gb_searchInput = new mauna.searchInput(gb_options);
        gb_searchInput.init();

        function gb_search_callback(keywords, no_matches, result_list){
            keywords = keywords.toUpperCase();
            gb_keywords = keywords;            
            var count = 0;
            var gb_data_box = gb_data.find('.mauna-infowindow-gb-data-box');
            if (keywords.length > 0) {
                gb_data_box.find('.mauna-infowindow-gb-data-item').each(function(){
                    var _this = $(this);
                    var gb_id = _this.find('.gb-data-item-value:first').html();
                    if (gb_id.indexOf(keywords) > -1) {
                        _this.show();
                        _this.addClass(search_result_class);
                        count++;
                    } else {
                        _this.removeClass(search_result_class);
                        _this.hide();
                    }
                });
            } else {
                gb_data_box.find('.mauna-infowindow-gb-data-item').each(function(){
                    var _this = $(this);   
                    _this.show();                 
                    _this.removeClass(search_result_class);
                });
            }

            if (count == 0) {
                no_matches.show() 
            } else {
                no_matches.hide();
            }
        }
    }

    function make_can_data() {
        big_infowindow.parent().append(can_data_container); 
        can_data = big_infowindow.parent().find('.mauna-infowindow-can-data-container');
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
        
        can_data.draggable({containment: 'body', handle: '.mauna-infowindow-can-data-title'});
        can_data.append(can_data_title + can_data_box);

        var can_options = {
            container: can_data.find('.can-data-search-container'),
            placeholder: '筛选 CAN ID',
            callback : can_search_callback,
        };
        var can_searchInput = new mauna.searchInput(can_options);
        can_searchInput.init();

        function can_search_callback(keywords, no_matches, result_list){
            keywords = keywords.toUpperCase();
            can_keywords = keywords;
            var count = 0;
            var can_data_box = can_data.find('.mauna-infowindow-can-data-box');
            if (keywords.length > 0) {
                can_data_box.find('.mauna-infowindow-can-data-item').each(function(){
                    var _this = $(this);
                    var can_id = _this.find('.can-data-item-value:first').html();
                    if (can_id.indexOf(keywords) > -1) {
                        _this.show();
                        _this.addClass(search_result_class);
                        count++;
                    } else {
                        _this.hide();
                        _this.removeClass(search_result_class);                    
                    }
                });
            } else {
                can_data_box.find('.mauna-infowindow-can-data-item').each(function(){
                    var _this = $(this);
                    _this.show();
                    _this.removeClass(search_result_class);             
                });
            }
            
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
    }

    function init_big_infowindow_content() { 
        destroy_big_infowindow_content();
        init_jtt808_big_infowindow();
        init_gbt_big_infowindow();
    }

    function destroy_big_infowindow_content() { 
        big_infowindow.parent().find('.mauna-infowindow-can-data-container').remove();
        big_infowindow.find('.mauna-infowindow-content').empty();
    }

    function init_jtt808_big_infowindow(_model) { 
        /*
        var last_model = big_infowindow.find('.mauna-infowindow-content').attr('model');
        if(!_model) { 
            _model = 'default';
            if(last_model == _model) { 
                return;
            }else { 
                big_infowindow.parent().find('.mauna-infowindow-can-data-container').remove();
                big_infowindow.find('.mauna-infowindow-content').empty();
            }
        }else { 
            if(_model._id == _model || !can_card_setting[_model._id]) { 
                return;
            }else { 
                big_infowindow.parent().find('.mauna-infowindow-can-data-container').remove();
                big_infowindow.find('.mauna-infowindow-content').empty();
            }
        }
        */
        
        big_infowindow.find('.mauna-infowindow-content').append(default_table);
        big_infowindow.find('.mauna-infowindow-content').append(default_can);

        var table = big_infowindow.find('.mauna-infowindow-content .mauna-infowindow-table');
        
        var can = big_infowindow.find('.mauna-infowindow-can');
        

        table.append('<div id="big-infowindow-map" class="mauna-infowindow-map"></div><div class="mauna-infowindow-nomap">未定位</div><div class="mauna-infowindow-infos detail-table"></div>');

        
        
        init_big_content(table.find('.mauna-infowindow-infos'), big_table_data);

        jtt_infowindow_map = init_map('big-infowindow-map');
        $('.mauna-big-infowindow .mauna-infowindow-can').append('<div class="mauna-infowindow-can-content">'+default_nocan+'</div>' + default_can_data_icon + default_can_icon );

        // 部标原始数据
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

        $('.mauna-infowindow-content .mauna-infowindow-infos').resize(function(){
            var talbe_height = $(this).height();
            $(this).parent().height(talbe_height);       
            $(this).parent().next().height('calc(100% - '+ talbe_height +'px)');
        });

    }

    function init_gbt_big_infowindow(_model) { 
        
        var last_model = big_infowindow.find('.mauna-infowindow-gb').attr('model');
        if(!_model) { 
            _model = 'default';
            if(last_model == _model) { 
                return;
            }else { 
                big_infowindow.find('.mauna-infowindow-gb').empty();
            }
        }else { 
            if(!gb_card_setting[_model._id]) { 
                _model = 'default';
            }else { 
                _model = _model._id;
            }
            if(_model == last_model) { 
                return;
            }else { 
                big_infowindow.find('.mauna-infowindow-gb').empty();
            }
        }
        
        big_infowindow.find('.mauna-infowindow-gb').attr('model', _model);
        var _gb_card_setting = gb_card_setting[_model];

        
        big_infowindow.find('.mauna-infowindow-gb').append(default_table);

        big_infowindow.find('.mauna-infowindow-gb').append(default_gb_content);
        
        _gtb_infowindow_content = new gtb_infowindow_content({
            container: big_infowindow.find('.mauna-infowindow-gb .mauna-infowindow-gb-content'),
            setting: _gb_card_setting
        });
        
        big_infowindow.find('.mauna-infowindow-gb').append(default_gb_data_icon);

        _gtb_infowindow_content.init();

        var gb_table = big_infowindow.find('.mauna-infowindow-gb .mauna-infowindow-table');
        gb_table.append('<div id="gb-big-infowindow-map" class="mauna-infowindow-map"></div><div class="mauna-infowindow-nomap">未定位</div><div class="mauna-infowindow-infos detail-table"></div>');
        
        init_gb_big_content(gb_table.find('.mauna-infowindow-infos'), _gb_card_setting['gb_big_table_data']);
        gb_infowindow_map = init_map('gb-big-infowindow-map');
        // 国标原始数据
        $('.mauna-infowindow-gb .mauna-infowindow-infos').resize(function(){
            var talbe_height = $(this).height();
            $(this).parent().height(talbe_height);       
            $(this).parent().next().height('calc(100% - '+ talbe_height +'px)');
        });
        

        $('.mauna-infowindow-gb .mauna-gb-data-icon').click(function(){
            var $this = $(this);
            var gbdata = $this.attr('data-gbdata');
            var icon = $this.find('.can_icon');
            if (gbdata == 0) {
                $this.attr('data-gbdata', 1);
                icon.removeClass(uncheck_class);
                icon.addClass(check_class);
                gb_data.show();
            } else {
                $this.attr('data-gbdata', 0);
                icon.removeClass(check_class);
                icon.addClass(uncheck_class);
                gb_data.hide();
            }
        });
    }

    // 常用快捷
    function init_shortcut_content(){
        var shortcut_content = small_infowindow.find('.mauna-infowindow-shortcut-content');
        var _html = '<div class="mauna-infowindow-shortcut-column"></div>';
        var _title = '<div class="mauna-infowindow-shortcut-column-title"></div>';
        var _content = '<div class="mauna-infowindow-shortcut-column-content"></div>';
        var _item = '<div class="mauna-infowindow-shortcut-column-item"></div>';
        for (var i=0; i<small_infowindow_shortcut_config.length; i++){
            var _config = small_infowindow_shortcut_config[i];
            var _icon = _config.icon;
            var _data = _config.data;
            var html = $(_html);
            var title = $(_title);
            var content = $(_content);
            for (var j=0; j<_data.length; j++){
                var item ='';
                item += '<div class="mauna-infowindow-shortcut-column-item" data-url="'+_config.url+'" data-type="'+_data[j].type+'" data-title="'+_data[j].title+'">';
                item += '<i class="mauna-infowindow-shortcut-column-item-icon '+_icon+'"></i>';
                item += _data[j].title;
                item += '</div>';
                content.append(item);
            }
            html.addClass('mauna-infowindow-shortcut-column-' + small_infowindow_shortcut_config.length );
            title.html(_config.title);
            html.append(title);
            html.append(content);
            shortcut_content.append(html); 
        }
        shortcut_content.find('.mauna-infowindow-shortcut-column-item').click(function(){
            //debugger
            var url = $(this).attr('data-url');
            var type = $(this).attr('data-type');
            var title = $(this).attr('data-title');
            open_shortcut_popup(url, type, title);
        });
    }

    function open_shortcut_popup(url, type, title){
        //console.log(url, type, car_id);
        var _url = url + "&type=" + type + "&ids=" + car_id + "&protocol=" + tree.getProtocol();
        var dialog = mauna.lavaDialog({
            title: title, //标题
            url: _url , //地址
            iframe: true,
            width: $(document).width() * 0.9, //宽度
            height: $(document).height() * 0.7, //高度
            overflow:'hidden',//隐藏
            buttons: [],
            modalInited:function(formDialog) {

            },
            callback: function(dialogobj){

            },
            cancel: function(){
                return false;
            },
        });
    }

    function init_follow_icon(container){
        container.find('.mauna-infowindow-title').append(default_follow_icon);
        container.find('.mauna-follow-icon').on('click', function(){
            follow_callback(big_infowindow, small_infowindow);
        });
    }

    function init_map(container){
        var infowindow_map;
        
        var minimap_options = {
            map_container: container, //id
            latlng: [30,104],
            zoom: 11
        };
        infowindow_map = new mauna_minimap.init(minimap_options, function (){});
        return infowindow_map;
    }

    function refresh_map(infowindow_map, icon, position, vehicle_state) { 
        if (vehicle_state && (vehicle_state.is_position || (position && position.lc))) {
            
            infowindow_map.off('zoomend');
            infowindow_map.off('moveend');
            var car_position = [position.position[1], position.position[0]];
            if(!vehicle_state.is_position) { 
                car_position = [position.lc[1], position.lc[0]];
            }
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
            var is_panto = false;
            infowindow_map.on('moveend',function () {
                !is_panto &&
                setTimeout(function(){
                    infowindow_map.panTo(car_position);
                    is_panto = true;
                    setTimeout(function(){
                        is_panto = false;
                    }, 500);
                }, 500);
            });
            big_infowindow.find('.mauna-infowindow-map').show();
            big_infowindow.find('.mauna-infowindow-nomap').hide();
        } else {            
            big_infowindow.find('.mauna-infowindow-nomap').show();
            big_infowindow.find('.mauna-infowindow-map').hide();
        }
    }

    function init_car_state(container, car_id, car_icon, car_name, car_state){
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
        var value = null_value;
        //if (!vehicle || !position || !terminal) return value;
        var _field = fields_config[field.field];
        _field = fields_config[field.field]||field.field;
        if (field.model == 'vehicle') {
            if (!vehicle) return value;
            if (field.field == 'first_landing_time' || field.field == 'data_time') {
                var date;
                if (vehicle[_field] && vehicle[_field].sec) {
                    date = new Date(vehicle[_field].sec * 1000);
                } else if (vehicle[_field] && vehicle[_field].iso) {
                    date = new Date(vehicle[_field].iso);
                } else {
                    value = vehicle[_field] ? vehicle[_field] : null_value;
                }
                value = date ? date.format("yyyy-mm-dd HH:MM:ss") : null_value;
            } else {                
                value = vehicle[_field] ? vehicle[_field] : null_value;
            }
        } else if (field.model == 'position') {
            if (!position) return value;            
            if (field.field == 'address') {
                if (vehicle.vehicle_state.is_position) {
                    value = position[_field];
                } else {
                    var last_pos_time, address;
                    
                    vehicle[tree.getProtocol()+"_last_pos_time"] ? last_pos_time = transform_to_datetime(vehicle[tree.getProtocol()+"_last_pos_time"]) : last_pos_time = false;
                    //vehicle.last_pos_time ? last_pos_time = transform_to_datetime(vehicle.last_pos_time) : last_pos_time = false;
                    position[_field] ? address = position[_field] : address = '';
                    if (last_pos_time) {
                        if (card == 'small') {
                            value = '(最后有效定位时间：'+ last_pos_time + ')<br/>' + address;
                        } else {
                            value = '(最后有效定位时间：'+ last_pos_time + ') ' + address;
                        }
                    } else {
                        value = null_value;
                    }
                    
                }
                //debugger
                //console.log('最后一次更新时间还没做！！！！！！！！！！！！');
            } else if (field.field == 'state') {
                value = car_state.car_state;
            } else if (field.field == 'direction') {
                if (position[field.field] == undefined || position[field.field] == null) {
                    value = null_value;
                } else {
                    value = transform_direction(position[field.field]);
                }
            } else {
                position[_field] ? value = position[_field] : value = null_value;
            }
        } else if (field.model == 'model') {
            if (!vehicle) return value;            
            value = vehicle['model'] ? vehicle['model'][_field] : '';
        } else if (field.model == 'team') {
            if (!vehicle) return value;            
            value = vehicle['team'][_field];
        } else if (field.model == 'terminal') {
            if (!terminal) return value;            
            if (field.field == 'protocol') {
                //value = Window.vehicle_state.show_options.protocol == 0 ? '部标协议' : '国标协议';
                if(tree.getProtocol() == 'mix') { 
                    value = vehicle.mix_protocol;
                }else { 
                    value = (tree.getProtocol() == 'jtt808'?'企标' : '国标');
                }
            } else {                
                value = terminal[_field] ? terminal[_field] : null_value;
            }
        }
        if (field.field == 'state_duration') {
            if (position && position[_field]) {
                position.is_running == '行驶' ? value = ('行驶-' + value) : value = ('停止-' + value);
            } else {
                value = null_value;
            }
        }
        return value;
    }

    function init_big_content(container, fields, position, terminal){
        if (!big_table_content) {
            big_table_content = container.maunaDetailTable({
                cols: 4,
                fields: fields,
            });
            big_table_content.init();
        }
    }
    
    function refresh_big_content(container, fields, vehicle, position, terminal, protocol){
        //container.empty();
        var detail_data = {};
        for (var i=0; i<fields.length; i++){
            var item = fields[i];
            detail_data[item['_id']] = get_value('big', item, vehicle, position, terminal, protocol);                
        }
        if (big_table_content) {
            big_table_content.refreshData(detail_data);
        }
    }

    function init_gb_big_content(container, fields, position, terminal){
        //container.empty();
        gb_big_table_data = fields;
        gb_big_table_content = container.maunaDetailTable({
            cols: 4,
            fields: fields,
        });
        gb_big_table_content.init();
        
    }

    function refresh_gb_big_content(container, fields, vehicle, position, terminal, protocol){
        //container.empty();
        var detail_data = {};
        for (var i=0; i<fields.length; i++){
            var item = fields[i];
            detail_data[item['_id']] = get_value('big', item, vehicle, position, terminal, protocol);                
        }
        if (gb_big_table_content) {
            gb_big_table_content.refreshData(detail_data);
        }
    }

    
    function init_small_data(vehicle, position, terminal, protocol){
        //debugger
        var car_id = vehicle._id || vehicle.objectId;
        var car_icon = '<div class="car-map-icon-bg"></div><img class="car-map-icon" style="transform:rotate('+car_state.direction+'deg)" src="'+car_state.car_map_icon+'" />';
        vehicle.telematics_box = [terminal];
        var car_name = Window.vehicle_state.set_child_text({original: vehicle}, tree.get_show_options());
        init_car_state(small_infowindow, car_id, car_icon, car_name, car_state.car_state);
        for (var i=0; i<small_table_data.length; i++){
            var fields = small_table_data[i];
            for (var j=0; j<fields.length; j++) {
                var field = fields[j];
                var value_container = $('.mauna-infowindow-value-item[name="'+field.field+'"]');
                value = get_value('small', field, vehicle, position, terminal, protocol);
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
        //$('.mauna-infowindow-value-item').tooltip();

        if (vehicle.image || (vehicle.model && vehicle.model.image)) {
            var src = small_infowindow.find('img.mauna-infowindow-picture').attr('src');
            var image_url = vehicle.image?(vehicle.image.url || vehicle.image.path):'';
            var model_url = vehicle.model.image?(vehicle.model.image.url || vehicle.model.image.path):'';
            var url;
            image_url ? url = image_url : url = model_url;
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
        console.log(vehicle, position, terminal);
        var car_id = vehicle._id || vehicle.objectId;
        var car_icon = '<div class="car-map-icon-bg"></div><img class="car-map-icon" style="transform:rotate('+car_state.direction+'deg)" src="'+car_state.car_map_icon+'" />';
        //var car_name = vehicle.name + ' ' + car_state.car_state ;
        vehicle.telematics_box = [terminal];
        var car_name = Window.vehicle_state.set_child_text({original: vehicle}, tree.get_show_options());
        init_car_state(big_infowindow, car_id, car_icon, car_name, car_state.car_state);
        var chart_div = $('#div_chart');
        var chart_url = chart_div.attr('data-url');
        var terminal_div = $('#div_terminal');
        var terminal_url = terminal_div.attr('data-url');
        var alarm_div = $('#div_alarm');
        var alarm_url = alarm_div.attr('data-url');
        var liquid_div = $('#div_liquid');
        var liquid_url = liquid_div.attr('data-url');
        var methanol_vehicle_ext = vehicle.model.methanol_vehicle_ext;
        
        if(protocol == 'jtt808') { 
            gb_data.hide();      
            big_infowindow.find('.mauna-infowindow-gb').hide();
        }else { 
            can_data.hide();
            big_infowindow.find('.mauna-infowindow-content').hide();
        }
        
        if (!refresh) {
            $.ajaxSettings.global = false; 
            if (!window.inquireTableInited) {
                chart_div.load(chart_url, function(res, status, xhr){
                    if (!window.inquireTableInited && window.initInquireTable) {
                        window.initInquireTable(tree);
                    }

                });
            } 
            if (window.inquireTableInited && window.setInquierVehicle) {
                
                window.setInquierVehicle(vehicle);
            } else {
                var chart_interval = setInterval(function(){
                    if (window.inquireTableInited && window.setInquierVehicle) {
                        clearInterval(chart_interval);
                        window.setInquierVehicle(vehicle);
                    }
                }, 200);
            }

            if (!window.terminalInited) {
                terminal_div.load(terminal_url, function(res, status, xhr){
                    if (!window.terminalInited && window.setTerminalVehicle) { 
                        window.setTerminalVehicle(vehicle);
                    }
                });
            }
            if (window.terminalInited && window.setTerminalVehicle) {                   
                window.setTerminalVehicle(vehicle);
            } else {
                var terminal_interval = setInterval(function(){
                    if (window.terminalInited && window.setTerminalVehicle) {
                        clearInterval(terminal_interval);
                        window.setTerminalVehicle(vehicle);
                    }
                }, 200);
            }
            
            if (!window.alarmTableInited) {
                alarm_div.load(alarm_url, function(res, status, xhr){
                    if (!window.alarmTableInited && window.initAlarmTable){
                        window.initAlarmTable();
                    }
                });
            } 
            if (window.alarmTableInited && window.setAlarmVehicle){
                window.setAlarmVehicle(vehicle);
            } else {
                var alarm_interval = setInterval(function(){
                    if (window.alarmTableInited && window.setAlarmVehicle){
                        clearInterval(alarm_interval);
                        window.setAlarmVehicle(vehicle);
                    }
                }, 200);
            }           

            if (methanol_vehicle_ext) {
                $('.mauna-big-infowindow').find('.mauna-infowindow-tab-title[name=liquid]').show();
                if (!window.liquidInited) {
                    liquid_div.load(liquid_url, function(){
                        if(window.liquidInited && window.setLiquidVehicle) {
                            window.setLiquidVehicle(vehicle);
                        }
                    });
                }
                if (window.liquidInited && window.setLiquidVehicle) {
                    window.setLiquidVehicle(vehicle);
                } else {
                    var liquid_interval = setInterval(function(res, status, xhr){
                        if (window.liquidInited && window.setLiquidVehicle){
                            clearInterval(liquid_interval);
                            window.setLiquidVehicle(vehicle);
                        }
                    }, 200);
                }
            } else {
                $('.mauna-big-infowindow').find('.mauna-infowindow-tab-title[name=liquid]').hide();
            }

            
            $.ajaxSettings.global = true; 
            //big_infowindow.find('.mauna-infowindow-car-name').trigger('click');
        }
        $('.mauna-big-infowindow').data('protocol', protocol);

        if (protocol == 'jtt808') {
            refresh_big_content($('.mauna-infowindow-content .mauna-infowindow-infos'), big_table_data, vehicle, position, terminal, protocol);
            refresh_map(jtt_infowindow_map, car_icon, position, vehicle.vehicle_state);
            if (refresh) {
                refresh_can_data(vehicle);
            } else {
                init_can_data(vehicle);
            }
            if (methanol_vehicle_ext) {
                if (window.addPoint) {
                    window.addPoint(vehicle.jtt808_position);
                } else {
                    var add_point_interval = setInterval(function(){
                        if (window.addPoint) {
                            clearInterval(add_point_interval);
                            window.addPoint(vehicle.jtt808_position);
                        }
                    }, 200);
                }
            }

                //init_can_data(vehicle);
            /*if(refresh) { 
                refresh_can(vehicle);
            } else { 
                init_can(vehicle);
            }*/
            $('.mauna-big-infowindow .mauna-infowindow-content .mauna-infowindow-infos').resize();

            //big_infowindow.find('.mauna-infowindow-content').show();
            //big_infowindow.find('.mauna-infowindow-gb').hide();
        }  else {
            refresh_gb_big_content($('.mauna-big-infowindow .mauna-infowindow-gb .mauna-infowindow-infos'), gb_big_table_data, vehicle, position, terminal, protocol);
            refresh_map(gb_infowindow_map, car_icon, position, vehicle.vehicle_state);
            if(refresh) { 
                refresh_gb(vehicle);
            }else { 
                init_gb(vehicle);
            }
            
            $('.mauna-big-infowindow .mauna-infowindow-gb .mauna-infowindow-infos').resize();
            //big_infowindow.find('.mauna-infowindow-content').hide();
            //big_infowindow.find('.mauna-infowindow-gb').show();
        }
        /*
        if (active_tab == 'car-name') {
            big_infowindow.find('.mauna-infowindow-car-name').trigger('click');
        } else {
            if (big_infowindow.find('.mauna-infowindow-title-active').attr('name') == active_tab) {
                if (protocol == 'jtt808') {
                    big_infowindow.find('.mauna-infowindow-content').hide();
                }else { 
                    big_infowindow.find('.mauna-infowindow-gb').hide();
                }
            } else {
                big_infowindow.find('.mauna-infowindow-tab-title[name='+active_tab+']').trigger('click');                
            }
        }
        */
    }

    function refresh_can_data(vehicle, action) {
        var can_data_box = can_data.find('.mauna-infowindow-can-data-box');
        if (action == 'refresh') {
            var url = '?app=vehicle&controller=can&action=getLast';
            var get_url = url + '&id=' + vehicle._id + '&protocol=0';
        } else if (action == 'init') {
            if (!vehicle.jtt808_can) return;
            var url = '?app=vehicle&controller=can&action=getJtt808RawSlice';
            var get_url = url + '&id=' + vehicle.jtt808_can._id;
        }
        $.ajaxSettings.global = false;
        $.ajax({
            url: get_url,
            type: 'POST',
            dataType: 'json',
            success: function(res){
                if (res.state) {
                    var data = res.data;
                    if (!res.state) return;
                    if (!data) return;
                    if(can_template && currentRules) { 
                        data = decode_data(data, currentRules);
                        can_template.refresh(data);
                        if (JSON.stringify(currentRules) == '{}' || !has_tab){
                            big_infowindow.find('.mauna-infowindow-nocan').show();                
                        } else {
                            big_infowindow.find('.mauna-infowindow-nocan').hide();
                        }
                    }
                    var intermediate_data = data.intermediate_data;
                    if (!intermediate_data) return;
                    var datetime = transform_to_datetime(intermediate_data.date);
                    if (last_can_datetime == datetime) return;
                    last_can_datetime = datetime;
                    var items = intermediate_data.items;
                    for (var i=0; i<items.length; i++){
                        var html = '<div class="mauna-infowindow-can-data-item">';
                        html += '<div><span class="can-data-item-name">CAN ID ：</span><span class="can-data-item-value">'+items[i].can_id+'</span></div>';
                        html += '<div><span class="can-data-item-name">DATA ：</span><span class="can-data-item-value">'+items[i].can_data+'</span></div>';
                        html += '<div><span class="can-data-item-name">'+datetime+'</span></div>';
                        html += '</div>';
                        var _html = $(html);
                        can_data_box.append(_html);
                        if (can_keywords.length > 0) {
                            if (items[i].can_id.indexOf(can_keywords) > -1) {
                                _html.show();
                                _html.addClass(search_result_class);
                            } else {
                                _html.hide();
                                _html.removeClass(search_result_class);
                            }
                        }
                    }
                } else {

                }
            },
        });

        $.ajaxSettings.global = true;
    }

    function init_can_data(vehicle, position) {  
        gb_data.hide();      
        big_infowindow.find('.mauna-infowindow-gb').hide();
        if (active_tab == 'car-name') {
            big_infowindow.find('.mauna-infowindow-car-name').trigger('click');
            big_infowindow.find('.mauna-infowindow-content').show();
        } else {
            if (big_infowindow.find('.mauna-infowindow-title-active').attr('name') == active_tab) {

            } else {
                big_infowindow.find('.mauna-infowindow-tab-title[name='+active_tab+']').trigger('click');                
            }
        }
        var $this = $('.mauna-big-infowindow .mauna-can-data-icon');
        var candata = $this.attr('data-candata');
        var icon = $this.find('.can_icon');
        $this.attr('data-candata', 0);
        icon.removeClass(check_class);
        icon.addClass(uncheck_class);
        //can_data.hide();
        can_data.find('.mauna-infowindow-can-data-box').empty();
        init_can(vehicle);

        if (interval_refresh) {
            clearInterval(interval_refresh);
            last_can_datetime = null;
        }
        setTimeout(refresh_can_data(vehicle, 'init') ,0);
        if (card_type != POSITION_CARD) {
            interval_refresh = setInterval(function(){
                refresh_can_data(vehicle, 'refresh');
            }, 5000);
        }
    }

    function init_can(data) {
        var html = $('.mauna-big-infowindow .mauna-infowindow-content').find('.mauna-infowindow-can-content');    
        var car_model = data.model ? data.model._id : '';
        var options = {
            car_model: car_model,
            can_template_container: html
        };
        var _data = data&&data.jtt808_can?data.jtt808_can:{};
        //debugger
        $.when(getRules(car_model), get_show_rules(car_model)).then(function(_current_rules, _has_tab){
            options.data = decode_data(_data, _current_rules);
            can_template = new can(options);
            can_template.init();
            if (JSON.stringify(_current_rules) == '{}' || !_has_tab) {
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
            if (JSON.stringify(currentRules) == '{}' || !has_tab){
                big_infowindow.find('.mauna-infowindow-nocan').show();                
            } else {
                big_infowindow.find('.mauna-infowindow-nocan').hide();
            }
        }
    }

    function init_gb(data){
        
        if (active_tab == 'car-name') {
            big_infowindow.find('.mauna-infowindow-car-name').trigger('click');
            big_infowindow.find('.mauna-infowindow-gb').show();
        } else {
            if (big_infowindow.find('.mauna-infowindow-title-active').attr('name') == active_tab) {

            } else {
                big_infowindow.find('.mauna-infowindow-tab-title[name='+active_tab+']').trigger('click');                
            }
        }

        refresh_gb(data);
        /*
        var html = $('.mauna-big-infowindow').find('.mauna-infowindow-gb .mauna-infowindow-gb-content #gb_info');

        var gtb_data = data&&data.gbt32960_decode_position?$.extend(true, {}, data.gbt32960_decode_position):{};
        var alarm_data = data&&data.gbt32960_decode_warning_data?$.extend(true, {}, data.gbt32960_decode_warning_data):{};
        var login_logout = {};
        if(data&&data.gbt32960_decode_login_logout) { 
            login_logout = data.gbt32960_decode_login_logout;
            login_logout.login_logout_datetime = login_logout.datetime;
            if(login_logout.reess&&login_logout.reess.length) { 
                var _values = [];
                for(var i = 0; i < login_logout.reess.length; i ++) { 
                    _values[i] = {'id': i+1, 'number': login_logout.reess[i]};
                }
                login_logout.decode_reess = _values;
            }
        }
        gtb_data = $.extend(true, {}, login_logout, gtb_data, alarm_data, data);
        if(gtb_data.reess) { 
            gtb_data.reess = login_logout.decode_reess;
        }
        */
        /*
        var options = {
                container: html,
                data:gtb_data
            };
            
        var activeTab = null;
        if(gtb_template) { 
            activeTab = gtb_template.getActiveTab();
        }
        gtb_template = new national_standard(options);

        gtb_template.init(activeTab); 
        */
        init_gb_data(data);
    }

    function refresh_gb(data){
         
        var gtb_data = data&&data.gbt32960_decode_position?$.extend(true, {}, data.gbt32960_decode_position):{};
        var alarm_data = data&&data.gbt32960_decode_warning_data?$.extend(true, {}, data.gbt32960_decode_warning_data):{};
        var login_logout = {};
        if(data&&data.gbt32960_decode_login_logout) { 
            login_logout = data.gbt32960_decode_login_logout;
            login_logout.login_logout_datetime = login_logout.datetime;
            if(login_logout.reess&&login_logout.reess.length) { 
                var _values = [];
                for(var i = 0; i < login_logout.reess.length; i ++) { 
                    _values[i] = {'id': i+1, 'number': login_logout.reess[i]};
                }
                login_logout.decode_reess = _values;
            }
        }
        var res_data = $.extend(true, {}, login_logout, gtb_data, alarm_data, data);

        res_data.today_mileage = gtb_data.today_mileage;
        res_data.total_mileage = gtb_data.total_mileage;

        if(res_data.reess) { 
            res_data.reess = login_logout.decode_reess;
        }

        _gtb_infowindow_content.refresh(res_data);
        
    }

    function init_gb_data(vehicle){
        var $this = $('.mauna-big-infowindow .mauna-gb-data-icon');
        var gbdata = $this.attr('data-candata');
        var icon = $this.find('.can_icon');
        // $this.attr('data-candata', 0);
        // icon.removeClass(check_class);
        // icon.addClass(uncheck_class);
        //gb_data.hide();
        gb_data.find('.mauna-infowindow-gb-data-box').empty();
        gb_data.find('.mauna-infowindow-gb-slice-data-box').empty();
        gb_data_cache = {};
        if (interval_refresh) {
            clearInterval(interval_refresh);
            last_gb_datetime = null;
        }
        setTimeout(refresh_gb_data(vehicle, 'init'), 0);
        if (card_type != POSITION_CARD) {
            interval_refresh = setInterval(function(){
                refresh_gb_data(vehicle, 'refresh');
            }, 5000);
        }        
    }

    function refresh_gb_data(vehicle, action){
        var gb_data_box = gb_data.find('.mauna-infowindow-gb-data-box');
        if (action == 'refresh') {
            var url = '?app=vehicle&controller=can&action=getLast';
            var get_url = url + '&id=' + vehicle._id + '&protocol=1';
        } else if (action == 'init') {
            if (!vehicle.gbt32960_data) return;
            var url = '?app=vehicle&controller=can&action=getGbt32960RawSlice';
            var get_url = url + '&id=' + vehicle.gbt32960_data._id;
        }
        $.ajaxSettings.global = false;
        $.ajax({
            url: get_url,
            type: 'POST',
            dataType: 'json',
            success: function(res){
                if (res.state) {
                    var data = res.data;
                    if (!res.state) return;
                    if (!data) return;
                    var gb_data_id = data._id;
                    var datetime = transform_to_datetime(data.datetime);
                    if (last_gb_datetime == datetime) return;
                    if (gb_data_cache[gb_data_id]) return;
                    last_gb_datetime = datetime;
                    var html = '<div class="mauna-infowindow-gb-data-item" data-id="'+gb_data_id+'">';
                    html += '<div class="gb-data-item-name">'+datetime+'</div>';
                    html += '<div class="gb-data-item-value" title="'+data.raw_data+'">'+data.raw_data+'</div>';
                    html += '</div>';
                    gb_data_box.append(html);
                    var _this = gb_data_box.find('[data-id="'+gb_data_id+'"]');
                    if (gb_keywords.length > 0) {
                        if (data.raw_data.indexOf(gb_keywords) > -1) {
                            _this.show();
                            _this.addClass(search_result_class);
                        } else {
                            _this.hide();
                            _this.removeClass(search_result_class);
                        }
                    } 
                    gb_data_cache[gb_data_id] = data.raw_slice || {};
                } else {

                }
            },
        });

        $.ajaxSettings.global = true;
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

    function get_show_rules(car_model) {
        var model =  new parse.model('can_show_setting');
        var defer = $.Deferred();
         model.get_list({"deepFind":true, "post_data":{"where": { 
            'vehicle_model':{
                '__type':'Pointer',
                'className':modelConfig['car_models'],
                'objectId': car_model,
            }
        }, include:['rule'], limit: Number.MAX_SAFE_INTEGER,'order': ['sort', 'createAt']}}).done(function(data) {
                if(data.state || data.status) { 
                    show_rules = [];
                    if ($.isArray(data.data)) {
                        show_rules = data.data;
                        has_tab = false;
                        for (var i=0; i<show_rules.length; i++) {
                            if (show_rules[i].level == 1) {
                                has_tab = true;
                                break;
                            }
                        }
                        defer.resolve(has_tab);
                    }
                }else { 
                    mauna.tips(data.message?data.message:'加载选项卡列表失败', 'error');
                }
        });
        return defer.promise();
    }

    this.get_content = function(options){
        //debugger
        card_type = options.card_type || 'small';
        car_id = options.car_id;
        var position_id = options.position_id;
        protocol = options.protocol;
        var refresh = options.refresh;
        var data = options.data;
        var defer = $.Deferred();
        if(!protocol) { 
            if(tree.getProtocol() == 'mix') { 
                protocol = data.vehicle.protocol_to_data;
            }else { 
                protocol = tree.getProtocol();
            }
        }
        
        if (card_type == POSITION_CARD) { 
            small_infowindow.show();
            big_infowindow.find('.mauna-follow-icon').hide();
            small_infowindow.find('.mauna-follow-icon').hide(); 
        } else {
            if (card_type == 'small') {
                small_infowindow.show();
            } else if (card_type == 'big') {
                big_infowindow.show();
            }   
            big_infowindow.find('.mauna-follow-icon').show();
            small_infowindow.find('.mauna-follow-icon').show();      
        }

        if (data) {
            var terminal = data['terminal']?data['terminal']:{};
            var vehicle = data[modelConfig['vehicle']];
            var position = data['position'];      
            car_state = vehicle.vehicle_state;
            var position_id;
            var first_landing, last_pos_time;

            vehicle[protocol+'_first_landing_time'] ? first_landing = true : first_landing = false;
            vehicle[protocol+'_last_pos_time'] ? last_pos_time = true : last_pos_time = false;

            //if (car_state.is_position) {
            if (position) {
                position_id = position.id;
                /*
                var location;
                if (position.location) location = position.location;
                if (position.position) location = position.position;
                if (location) {
                    car_position = [(location[1]).toFixed(6), (location[0]).toFixed(6)];                        
                }
                */
                if (car_state.is_position) {
                    car_position = [position.position[1], position.position[0]];
                } else {
                    if (position.lc){ 
                        car_position = [position.lc[1], position.lc[0]];
                    }
                }
            }

            setTimeout(function(){
                init_small_data(vehicle, position, terminal, protocol);
                if(protocol == 'gbt32960') { 
                    init_gbt_big_infowindow(vehicle.model);
                }else { 
                    //init_jtt808_big_infowindow(vehicle.model);
                }
                

                init_big_data(vehicle, position, terminal, protocol, refresh);
            }, 0);
            defer.resolve({content: infoWindow[0], position: car_position, state: car_state, name: vehicle.name, position_id: position_id, first_landing: first_landing, last_pos_time: last_pos_time});
        }
        
        return defer.promise();
    }
    /////　点击未勾选的车辆，打开信息卡片，卡片位置如何确定？
    this.init();

    this.hide_all = function(){
        small_infowindow.hide();
        big_infowindow.hide();
        can_data.hide();
        gb_data.hide();
    }

    return this;
}