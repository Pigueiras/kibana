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

        $.each(data.timestamp, function(index, timestamp) {
            $.each(data.service, function(index, service) {
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
                    timestamp,
                    service,
                    availability]);
            });
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

      var yScale = d3.scale.ordinal()
        .domain(data.service)
        .rangeBands([height, 0]);

      var xScale = d3.scale.ordinal()
        .domain(data.timestamp)
        .rangeBands([0, width]);

      var heatMap = svg.selectAll(".hour")
          .data(formatted_data)
          .enter().append("rect")
          .attr("x", function(d) { return xScale(d[0]); })
          .attr("y", function(d) { return yScale(d[1]); })
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
      var $elem = $(this.chartEl);
      var margin = this._attr.margin;
      var elWidth = this._attr.width = $elem.width();
      var elHeight = this._attr.height = $elem.height();

      return function (selection) {
        selection.each(function (data) {
          var div = d3.select(this);

          var path;
          var width = elWidth;
          var height = elHeight - margin.top - margin.bottom;


          var svg = div.append('svg')
          .attr('width', width)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', 'translate(0,' + margin.top + ')');

          path = self.addPath(width, height, svg, data);

          return svg;
        });
      };
    };

    return HeatmapChart;
  };
});
