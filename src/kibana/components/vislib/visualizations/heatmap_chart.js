define(function (require) {
  return function HeatmapChartFactory(d3, Private) {
    var _ = require('lodash');
    var $ = require('jquery');

    var Chart = Private(require('components/vislib/visualizations/_chart'));
    var TimeMarker = Private(require('components/vislib/visualizations/time_marker'));
    var errors = require('errors');
    require('css!components/vislib/styles/main');

    /**
     * Area chart visualization
     *
     * @class HeatmapChart
     * @constructor
     * @extends Chart
     * @param handler {Object} Reference to the Handler Class Constructor
     * @param el {HTMLElement} HTML element to which the chart will be appended
     * @param chartData {Object} Elasticsearch query results for this specific
     * chart
     */
    _(HeatmapChart).inherits(Chart);
    function HeatmapChart(handler, chartEl, chartData) {
      if (!(this instanceof HeatmapChart)) {
        return new HeatmapChart(handler, chartEl, chartData);
      }

      HeatmapChart.Super.apply(this, arguments);

    }


    HeatmapChart.prototype.buildData = function(slices) {
        var data = []
        for (var i = 0; i < slices.children.length; i++) {
            for (var j = 0; j < slices.children[i].children.length; j++) {
                data.push([i, j, slices.children[i].children[j].children[0].name]);
            }

        }
        return data;



    }
    /**
     * Adds pie paths to SVG
     *
     * @method addPath
     * @param width {Number} Width of SVG
     * @param height {Number} Height of SVG
     * @param svg {HTMLElement} Chart SVG
     * @param slices {Object} Chart data
     * @returns {D3.Selection} SVG with paths attached
     */
    HeatmapChart.prototype.addPath = function (width, height, svg, slices) {
      var self = this;

      var gridWidth = Math.floor(width / slices.children.length),
          gridHeight = Math.floor(height / 4),
          buckets = slices.children.length,
          colors = ["green", "orange", "red"]
          data = self.buildData(slices);

          var colorScale = d3.scale.ordinal()
              .domain(["available", "degraded", "unavailable"])
              .range(colors);

          var heatMap = svg.selectAll(".hour")
              .data(data)
              .enter().append("rect")
              .attr("x", function(d) { return (d[0] - 1) * gridWidth; })
              .attr("y", function(d) { return (d[1] - 1) * gridHeight; })
              .attr("rx", 5)
              .attr("ry", 4)
              .attr("class", "hour bordered")
              .attr("width", gridWidth)
              .attr("height", gridHeight)
              .style("fill", colors[0]);

          heatMap.style("fill", function(d) { return colorScale(d[2]); });

      return svg;
    };

    HeatmapChart.prototype.draw = function () {
      var self = this;

      return function (selection) {
        selection.each(function (data) {
          var div = d3.select(this);
          var width = $(this).width();
          var height = $(this).height();
          var path;

          var svg = div.append('svg')
          .attr('width', width)
          .attr('height', height)
          .append('g')
          //.attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

          path = self.addPath(width, height, svg, data.slices);

          return svg;
        });
      };
    };

    return HeatmapChart;
  };
});
