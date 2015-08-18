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


    HeatmapChart.prototype.buildData = function(data) {
        var formatted_data = [];
        var i = 0;
        var j = 0;
        $.each(data.timestamp, function(timestamp) {
            $.each(data.service, function(service) {
                var availability = null;
                try {
                    availability = data.heatmap[timestamp][service];
                }
                catch (error) {
                    if (error.name !== 'TypeError') {
                        throw error
                    }
                }
                if (availability === undefined) {
                    availability = 'no data';
                }

                formatted_data.push([
                    i,
                    j,
                    availability]);
                j = j + 1;
            });
            j = 0;
            i = i + 1;
        });

        return formatted_data;
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
    HeatmapChart.prototype.addPath = function (width, height, svg, data) {
      var self = this;

      var gridWidth = Math.floor(width / Object.keys(data.timestamp).length),
          gridHeight = Math.floor(height / Object.keys(data.service).length),
          colors = ["green", "orange", "red", "grey"]
          formatted_data = self.buildData(data);

      var colorScale = d3.scale.ordinal()
          .domain(["available", "degraded", "unavailable", "no data"])
          .range(colors);

      var heatMap = svg.selectAll(".hour")
          .data(formatted_data)
          .enter().append("rect")
          .attr("x", function(d) { return (d[0]) * gridWidth; })
          .attr("y", function(d) { return (d[1]) * gridHeight; })
          .attr("rx", 5)
          .attr("ry", 4)
          .attr("class", "hour bordered")
          .attr("width", gridWidth)
          .attr("height", gridHeight);

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

          path = self.addPath(width, height, svg, data);

          return svg;
        });
      };
    };

    return HeatmapChart;
  };
});
