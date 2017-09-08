import {map} from './basemap';
import util from './util';
import {Editbar} from './editbar';
import $ from 'jquery';
util.adaptHeight("map",0);

let editbar = new Editbar();
editbar.init(map);

window.mauna_map = {
    init(data){
        let map_container = $(data.map_container) || $('.map-container');
        let tools = data.tools || null;
        let tools_group_template = '<div class="switch_group" data-state="0"><i class="map-icon map-menu"></i></div>';
        let add_marker_template = '<div class="add_marker card-div-border"></div>';
        let zoom_group_template = '<div class="zoom_group">\
                                    <div class="zoom_button zoomin">\
                                        <i class="map-icon map-plus"></i>\
                                    </div>\
                                    <div class="zoom_button zoomout">\
                                        <i class="map-icon map-minus"></i>\
                                    </div>\
                                </div>';
        let button_group_template = '<div class="button_group"><ul id="tools"></ul></div>';
        let tool_marker_template = '<li data-placement="auto bottom" data-toggle="tooltip" title="" data-original-title="添加地图兴趣点" data-picture="0" class="make_marker"><i class="map-icon map-pushpin"></i></li>';
        let tool_view_point_template = '<li data-placement="auto bottom" data-toggle="tooltip" title="" data-original-title="我的视野" data-picture="0" class="view_point"><i class="map-icon map-view"></i>\
                                        <div class="views_window">\
                                            <div style="background-color: #EDEDED;padding: 0;margin-left: 1px;">\
                                                <div class="views_row">\
                                                    <input type="text" class="form-control view_point_name">\
                                                    <i class="views_add map_plus" ></i>\
                                                </div>\
                                            </div>\
                                            <div class="views_div">\
                                            </div>\
                                        </div>\
                                    </li>';
        let tool_view_control_template = '<li data-placement="auto bottom" data-toggle="tooltip" title="" data-original-title="显示控制" data-picture="0" class="view_control" >\
                                        <i class="map-icon map-eye"></i>\
                                        <div class="tools_window">\
                                            <label class="tools-item i-checks">\
                                                中心地址\
                                                <input type="checkbox" tool-name="center_position">\
                                            </label>\
                                            <label class="tools-item i-checks">\
                                                比例尺\
                                                <input type="checkbox" tool-name="scale">\
                                            </label>\
                                            <label class="tools-item i-checks">\
                                                级别工具\
                                                <input type="checkbox" tool-name="toolbar">\
                                            </label>\
                                            <label class="tools-item i-checks">\
                                                重叠提示\
                                                <input type="checkbox" tool-name="">\
                                            </label>\
                                            <label class="tools-item i-checks">\
                                                车辆聚合\
                                                <input type="checkbox" tool-name="cluster_car">\
                                            </label>\
                                            <label class="tools-item i-checks">\
                                                兴趣点聚合\
                                                <input type="checkbox" tool-name="cluster_marker">\
                                            </label>\
                                            <label class="tools-item i-checks">\
                                                显示兴趣点\
                                                <input type="checkbox" tool-name="marker">\
                                            </label>\
                                        </div>\
                                    </li>';
        init_tools();

        function init_tools() {
            init_tools_group(tools.tools_group);
        }

        function init_tools_group(tools_group) {
            map_container.append(tools_group_template);
            map_container.append(button_group_template);
            let button_group = map_container.find('#tools');
            if (tools_group.view_point) {
                button_group.append(tool_view_point_template);
                button_group.find('.view_point').click(function() {
                    change_icon('view_point');
                    views_window();
                });
                button_group.find('.view_point').find('.views_add').click(function() {

                });
            }
            if (tools_group.view_control) {
                button_group.append(tool_view_control_template);
                map_container.append(zoom_group_template);
                button_group.find('.view_control').click(function() {
                    change_icon('view_control');
                    show_tools_window();
                });
            }

        }
        $('.switch_group').on('click',function () {
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
        });
        function show_tools_window () {
            close_evey_window();
            if ($('.view_control').attr('data-picture') == 1) {
                $('.tools_window').show();
            } else {
                $('.tools_window').hide();
            }
        }
        function views_window() {
            close_evey_window();
            if ($('.view_point').attr('data-picture') == 1) {
                $('.views_window').show();
            } else {
                $('.views_window').hide();
            }
        }
        function close_evey_window() {
            $('.views_window').hide();
            $('.tools_window').hide();
        }

        function change_icon(cls) {
            $('#tools>li>i').removeClass('font-active');

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


    }
}
