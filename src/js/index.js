import {map} from './basemap';
import util from './util';
import {Editbar} from './editbar';
util.adaptHeight("map",0);

let editbar = new Editbar();
editbar.init(map);



