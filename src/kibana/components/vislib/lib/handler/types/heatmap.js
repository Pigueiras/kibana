define(function (require) {
  return function HeatmapHandler(d3, Private) {
    var Handler = Private(require('components/vislib/lib/handler/handler'));
    var Data = Private(require('components/vislib/lib/data'));
    var Legend = Private(require('components/vislib/lib/legend'));
    var ChartTitle = Private(require('components/vislib/lib/chart_title'));
    var XHeatmapAxis = Private(require('components/vislib/lib/x_heatmap_axis'));
    var YHeatmapAxis = Private(require('components/vislib/lib/y_heatmap_axis'));


    /*
     * Handler for Pie visualizations.
     */

    return function (vis) {
      var data = new Data(vis.data, vis._attr);

      return new Handler(vis, {
        legend: new Legend(vis,
            vis.el, data.heatmapValues(), data.getHeatmapColorFunc(), vis._attr),
        chartTitle: new ChartTitle(vis.el),
        xAxis: new XHeatmapAxis({
            el                : vis.el,
            xValues           : data.data.timestamp,
            xAxisFormatter    : data.get('xAxisFormatter'),
            _attr             : vis._attr
        }),
        yAxis: new YHeatmapAxis({
            el   : vis.el,
            yValues : data.data.service,
            yAxisFormatter: data.get('yAxisFormatter'),
            _attr: vis._attr
        })
      });
    };
  };
});
