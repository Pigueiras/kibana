define(function (require) {
  return function HeatmapProvider(Private) {
    var _ = require('lodash');

    return function (vis, resp) {
        // [lp]: Implement it more generic
        var timestamp = {}; // [lp] Archaic implementation of a set in JS
        var service = {};
        var availability = {};
        var data = {};

        var rowsLength = resp.rows.length;

        for (var i = 0; i < rowsLength; i++) {
            var tmp_timestamp = resp.rows[i][0].key;
            var tmp_service = resp.rows[i][1].key;
            var tmp_availability = resp.rows[i][2].key;
            var tmp_count = resp.rows[i][3].key;

            timestamp[tmp_timestamp] = true; // x axis
            service[tmp_service] = true; // y axis
            availability[tmp_availability] = true; // colors in legend

            if (!data.hasOwnProperty(tmp_timestamp)) {
                data[tmp_timestamp] = {}
            }

            if (!data[tmp_timestamp].hasOwnProperty(tmp_service)) {
                data[tmp_timestamp][tmp_service] = {}
            }

            data[tmp_timestamp][tmp_service] = tmp_availability;
        }

        return {
            "xAxisFormatter": resp.columns[0].aggConfig.fieldFormatter(),
            "yAxisFormatter": resp.columns[1].aggConfig.fieldFormatter(),
            "timestamp": Object.keys(timestamp).map(function(k) {
                if (!isNaN(k))
                    return Number.parseFloat(k)
                return k
            }),
            "service": Object.keys(service).map(function(k) {
                if (!isNaN(k))
                    return Number.parseFloat(k)
                return k
            }),
            "heatmap": data
        }
    };
  };
});
