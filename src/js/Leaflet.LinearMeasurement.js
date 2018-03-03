!function () {
    L.Control.LinearMeasurement = L.Control.extend({
        options: {
            position: "topleft",
            unitSystem: "imperial",
            color: "#4D90FE",
            contrastingColor: "#fff",
            show_last_node: !1,
            show_azimut: !1
        },
        clickSpeed: 200,
        onAdd: function (t) {
            function i(t) {
                return s(t) >= 165 ? "000" : "fff"
            }

            function s(t) {
                var i = "string" == typeof t ? a(t) : t;
                return .2126 * i[0] + .7152 * i[1] + .0722 * i[2]
            }

            function a(t) {
                if (3 === t.length) t = t.charAt(0) + t.charAt(0) + t.charAt(1) + t.charAt(1) + t.charAt(2) + t.charAt(2); else if (6 !== t.length)throw"Invalid hex color: " + t;
                for (var i = [], s = 0; s <= 2; s++)i[s] = parseInt(t.substr(2 * s, 2), 16);
                return i
            }

            var o = L.DomUtil.create("div", "leaflet-control leaflet-bar"), e = L.DomUtil.create("a", "icon-ruler", o),
                n = t.getContainer(), l = this;
            o.style = "display:none";
            e.href = "#",
                e.title = "Toggle measurement tool",
                L.DomEvent.on(e, "click", L.DomEvent.stop).on(e, "click", function () {
                    L.DomUtil.hasClass(e, "icon-active") ? (l.resetRuler(!!l.mainLayer), L.DomUtil.removeClass(e, "icon-active"), L.DomUtil.removeClass(n, "ruler-map")) : (l.initRuler(), L.DomUtil.addClass(e, "icon-active"), L.DomUtil.addClass(n, "ruler-map"))
                }), this.options.color && this.options.color.indexOf("#") === -1 ? this.options.color = "#" + this.options.color : this.options.color || (this.options.color = "#4D90FE");
            var r = this.options.color.replace("#", "");
            return this.options.contrastingColor = "#" + i(r), o
        }, onRemove: function (t) {
            this.resetRuler(!!this.mainLayer)
        }, initRuler: function () {
            var t = this, i = this._map;
            this.mainLayer = L.featureGroup(),
                this.mainLayer.addTo(this._map),
                i.touchZoom.disable(),
                i.doubleClickZoom.disable(),
                i.boxZoom.disable(),
                i.keyboard.disable(),
            i.tap && i.tap.disable(),
                this.dblClickEventFn = function (t) {
                    L.DomEvent.stop(t)
                },
                this.clickEventFn = function (i) {
                    t.clickHandle ? (clearTimeout(t.clickHandle),
                        t.clickHandle = 0,
                    t.options.show_last_node && (t.preClick(i),
                        t.getMouseClickHandler(i)),
                        t.getDblClickHandler(i)) : (t.preClick(i),
                        t.clickHandle = setTimeout(function () {
                            t.getMouseClickHandler(i), t.clickHandle = 0
                        }, t.clickSpeed))
                }, this.moveEventFn = function (i) {
                t.clickHandle || t.getMouseMoveHandler(i)
            },
                i.on("click", this.clickEventFn, this),
                i.on("mousemove", this.moveEventFn, this),
                i.on('contextmenu',function (e) {
                    (clearTimeout(t.clickHandle),
                        t.clickHandle = 0,
                    t.options.show_last_node && (t.preClick(e),
                        t.getMouseClickHandler(e)),
                        t.getDblClickHandler(e))
                }),
                this.resetRuler()
        }, initLayer: function () {
            this.layer = L.featureGroup(), this.layer.addTo(this.mainLayer), this.layer.on("selected", this.layerSelected), this.layer.on("click", this.clickEventFn, this)
        }, resetRuler: function (t) {
            var i = this._map;
            t && (i.off("click", this.clickEventFn, this), i.off("mousemove", this.moveEventFn, this), this.mainLayer && this._map.removeLayer(this.mainLayer), this.mainLayer = null, this._map.touchZoom.enable(), this._map.boxZoom.enable(), this._map.keyboard.enable(), this._map.tap && this._map.tap.enable()), this.layer = null, this.prevLatlng = null, this.poly = null, this.multi = null, this.latlngs = null, this.latlngsList = [], this.sum = 0, this.distance = 0, this.separation = 1, this.last = 0, this.fixedLast = 0, this.totalIcon = null, this.total = null, this.lastCircle = null, this.UNIT_CONV = 1e3, this.SUB_UNIT_CONV = 1e3, this.UNIT = "km", this.SUB_UNIT = "m", "imperial" === this.options.unitSystem && (this.UNIT_CONV = 1609.344, this.SUB_UNIT_CONV = 5280, this.UNIT = "mi", this.SUB_UNIT = "ft"), this.measure = {
                scalar: 0,
                unit: this.SUB_UNIT
            }
        }, cleanUpMarkers: function (t) {
            var i = this.layer;
            i && i.eachLayer(function (s) {
                s.options && "tmp" === s.options.type && (t ? s.options.type = "fixed" : i.removeLayer(s))
            })
        }, cleanUpFixed: function () {
            var t = this.layer;
            t && t.eachLayer(function (i) {
                i.options && "fixed" === i.options.type && t.removeLayer(i)
            })
        }, convertDots: function () {
            var t = this, i = this.layer;
            i && i.eachLayer(function (i) {
                if (i.options && "dot" === i.options.type) {
                    var s = i.options.marker, a = s ? s.options.icon.options : null, o = a ? a.html : "";
                    if (o && o.indexOf(t.measure.unit) === -1) {
                        var e = i.options.label, n = e.split(" "), l = parseFloat(n[0]), r = n[1], h = "";
                        i.options.label.indexOf(t.measure.unit) !== -1 ? h = i.options.label : r === t.UNIT ? h = (l * t.SUB_UNIT_CONV).toFixed(2) + " " + t.SUB_UNIT : r === t.SUB_UNIT && (h = (l / t.SUB_UNIT_CONV).toFixed(2) + " " + t.UNIT);
                        var c = L.divIcon({className: "total-popup-label", html: h});
                        s.setIcon(c)
                    }
                }
            })
        }, displayMarkers: function (t, i, s) {
            var a, o, e, n, l, r = t[t.length - 1], h = t[0], c = h.distanceTo(r) / this.UNIT_CONV, p = c,
                u = this._map.latLngToContainerPoint(r), m = this._map.latLngToContainerPoint(h), d = 1;
            this.measure.unit === this.SUB_UNIT && (d = this.SUB_UNIT_CONV, p *= d);
            for (var v = s * d + p, f = s * d, g = Math.floor(f); g < v; g++)n = (v - g) / p, g % this.separation || g < f || (a = u.x - n * (u.x - m.x), o = u.y - n * (u.y - m.y), l = L.point(a, o), r = this._map.containerPointToLatLng(l), e = g + " " + this.measure.unit, this.renderCircle(r, 0, this.layer, i ? "fixed" : "tmp", e), this.last = v);
            return c
        }, renderCircle: function (t, i, s, a, o) {
            var e = this.options.color, n = this.options.color, l = "", r = "", linesHTML = [];
            a = a || "circle";
            var h = {color: n, fillOpacity: 1, opacity: 1, fill: !0, type: a},
                c = this.prevLatlng ? this._map.latLngToContainerPoint(this.prevLatlng) : null,
                p = this._map.latLngToContainerPoint(t);
            var p_latLng = this._map.containerPointToLatLng(p)
            if ("dot" === a && (r = "node-label", c && this.options.show_azimut && (l = ' <span class="azimut"> ' + this.lastAzimut + "&deg;</span>")), p_latLng , o) {
                var u = L.divIcon({
                    className: "total-popup-label " + r,
                    html: '<span style="color: ' + e + ';">' + o + l + "</span>"
                });
                h.icon = u, h.marker = L.marker(p_latLng, {icon: u, type: a}).addTo(s), h.label = o
            }
            var m = L.circleMarker(t, h);
            return m.setRadius(3), m.addTo(s), m
        }, getAzimut: function (t, i) {
            var s = 0;
            return t && i && (s = parseInt(180 * Math.atan2(i.y - t.y, i.x - t.x) / Math.PI), s > 0 ? s += 90 : s < 0 && (s = Math.abs(s), s = s <= 90 ? 90 - s : 360 - (s - 90))), this.lastAzimut = s, s
        }, renderPolyline: function (t, i, s) {
            var a = L.polyline(t, {color: this.options.color, weight: 2, opacity: 1, dashArray: i});
            return a.addTo(s), a
        }, renderMultiPolyline: function (t, i, s) {
            var a;
            return a = L.version.startsWith("0") ? L.multiPolyline(t, {
                color: this.options.color,
                weight: 2,
                opacity: 1,
                dashArray: i
            }) : L.polyline(t, {color: this.options.color, weight: 2, opacity: 1, dashArray: i}), a.addTo(s), a
        }, formatDistance: function (t, i) {
            var s = L.Util.formatNum(t < 1 ? t * parseFloat(this.SUB_UNIT_CONV) : t, i),
                a = t < 1 ? this.SUB_UNIT : this.UNIT;
            return {scalar: s, unit: a}
        }, hasClass: function (t, i) {
            var s = L.DomUtil.hasClass;
            for (var a in i)if (s(t, i[a]))return !0;
            return !1
        }, preClick: function (t) {
            var i = this, s = t.originalEvent.target;
            this.hasClass(s, ["leaflet-popup", "total-popup-content"]) || (i.layer || i.initLayer(), i.cleanUpMarkers(!0), i.fixedLast = i.last, i.prevLatlng = t.latlng, i.sum = 0)
        }, getMouseClickHandler: function (t) {
            var i = this;
            i.fixedLast = i.last, i.sum = 0, i.poly && (i.latlngsList.push(i.latlngs), i.multi ? i.multi.setLatLngs(i.latlngsList) : i.multi = i.renderMultiPolyline(i.latlngsList, "5 5", i.layer, "dot"));
            var s, a;
            for (var o in i.latlngsList)s = i.latlngsList[o], i.sum += s[0].distanceTo(s[1]) / i.UNIT_CONV;
            a = i.measure.unit === this.SUB_UNIT ? i.sum * i.SUB_UNIT_CONV : i.sum;
            var e = a.toFixed(2);
            i.renderCircle(t.latlng, 0, i.layer, "dot", parseInt(e) ? e + " " + i.measure.unit : ""), i.prevLatlng = t.latlng
        }, getMouseMoveHandler: function (t) {
            var i = "";
            if (this.prevLatlng) {
                var s = t.latlng;
                this.latlngs = [this.prevLatlng, t.latlng], this.poly ? this.poly.setLatLngs(this.latlngs) : this.poly = this.renderPolyline(this.latlngs, "5 5", this.layer), this.distance = parseFloat(this.prevLatlng.distanceTo(t.latlng)) / this.UNIT_CONV, this.measure = this.formatDistance(this.distance + this.sum, 2);
                var a = this.prevLatlng ? this._map.latLngToContainerPoint(this.prevLatlng) : null,
                    o = this._map.latLngToContainerPoint(s);
                if (a && this.options.show_azimut) {
                    var e = "color: " + this.options.contrastingColor + ";";
                    i = ' <span class="azimut azimut-final" style="' + e + '"> &nbsp; ' + this.getAzimut(a, o) + "&deg;</span>"
                }
                var n = this.measure.scalar + " " + this.measure.unit,
                    l = '<span class="total-popup-content" style="background-color:' + this.options.color + "; color: " + this.options.contrastingColor + '">' + n + i + "</span>";
                this.total ? (this.totalIcon = L.divIcon({
                    className: "total-popup",
                    html: l
                }), this.total.setLatLng(t.latlng), this.total.setIcon(this.totalIcon)) : (this.totalIcon = L.divIcon({
                    className: "total-popup",
                    html: l
                }), this.total = L.marker(t.latlng, {icon: this.totalIcon, clickable: !0}).addTo(this.layer));
                var r = this.measure.scalar, h = this.separation, c = parseInt(r).toString().length,
                    p = Math.pow(10, c), u = r > p / 2 ? p / 10 : p / 20, m = 0;
                if (this.separation = u, h !== this.separation && this.fixedLast) {
                    this.cleanUpMarkers(), this.cleanUpFixed();
                    var d = this.multi.getLatLngs();
                    for (var v in d)m += this.displayMarkers.apply(this, [d[v], !0, m]);
                    this.displayMarkers.apply(this, [this.poly.getLatLngs(), !1, this.sum]), this.convertDots()
                } else this.cleanUpMarkers(), this.displayMarkers.apply(this, [this.poly.getLatLngs(), !1, this.sum])
            }
        }, getDblClickHandler: function (t) {
            var i = "", s = this;
            if (this.total) {
                if (this.layer.off("click"), L.DomEvent.stop(t), this.options.show_azimut) {
                    var a = "color: " + this.options.contrastingColor + ";";
                    i = ' <span class="azimut azimut-final" style="' + a + '"> &nbsp; ' + this.lastAzimut + "&deg;</span>"
                }
                var o = this.layer, e = this.measure.scalar + " " + this.measure.unit + " ",
                    n = (this.measure.unit === this.SUB_UNIT ? this.measure.scalar / this.UNIT_CONV : this.measure.scalar, this.total.getLatLng(), this.total),
                    l = ['<div class="total-popup-content" style="background-color:' + this.options.color + "; color: " + this.options.contrastingColor + '">' + e + i, '  <svg class="lineclose" viewbox="0 0 45 35">', '   <path style="stroke: ' + this.options.contrastingColor + '" class="lineclose" d="M 10,10 L 30,30 M 30,10 L 10,30" />', "  </svg>", "</div>"].join("");
                this.totalIcon = L.divIcon({className: "total-popup", html: l}), this.total.setIcon(this.totalIcon);
                var r = {total: this.measure, total_label: n, unit: this.UNIT_CONV, sub_unit: this.SUB_UNIT_CONV},
                    h = function (t) {
                        L.DomUtil.hasClass(t.originalEvent.target, "lineclose") ? s.mainLayer.removeLayer(o) : o.fireEvent("selected", r)
                    };
                o.on("click", h), o.fireEvent("selected", r), this.resetRuler(!1)
            }
        }, purgeLayers: function (t) {
            for (var i in t)t[i] && this.layer.removeLayer(t[i])
        }, layerSelected: function (t) {
        }
    })
}();