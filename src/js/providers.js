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



    return providers;
});