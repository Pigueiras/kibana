define(function (require) {
  return function YHeatmapAxisFactory(d3, Private) {
    var _ = require('lodash');
    var $ = require('jquery');
    var errors = require('errors');

    var ErrorHandler = Private(require('components/vislib/lib/_error_handler'));

    /**
     * Appends y axis to the visualization
     *
     * @class YHeatmapAxis
     * @constructor
     * @param args {{el: (HTMLElement), yMax: (Number), _attr: (Object|*)}}
     */
    function YHeatmapAxis(args) {
      this.el = args.el;
      this.yValues = args.yValues;
      this._attr = args._attr || {};
    }

    _(YHeatmapAxis.prototype).extend(ErrorHandler.prototype);

    /**
     * Renders the y axis
     *
     * @method render
     * @return {D3.UpdateSelection} Renders y axis to visualization
     */
    YHeatmapAxis.prototype.render = function () {
      d3.select(this.el).selectAll('.y-axis-div').call(this.draw());
    };

    YHeatmapAxis.prototype._isPercentage = function () {
      return (this._attr.mode === 'percentage');
    };

    YHeatmapAxis.prototype._isUserDefined = function () {
      return (this._attr.setYExtents);
    };

    YHeatmapAxis.prototype._isYExtents = function () {
      return (this._attr.defaultYExtents);
    };

    YHeatmapAxis.prototype._validateUserExtents = function (domain) {
      var self = this;

      return domain.map(function (val) {
        val = parseInt(val, 10);

        if (isNaN(val)) throw new Error(val + ' is not a valid number');
        if (self._isPercentage() && self._attr.setYExtents) return val / 100;
        return val;
      });
    };

    YHeatmapAxis.prototype._getExtents = function (domain) {
      var min = domain[0];
      var max = domain[1];

      if (this._isUserDefined()) return this._validateUserExtents(domain);
      if (this._isYExtents()) return domain;
      if (this._attr.scale === 'log') return this._logDomain(min, max); // Negative values cannot be displayed with a log scale.
      if (!this._isYExtents() && !this._isUserDefined()) return [Math.min(0, min), Math.max(0, max)];
      return domain;
    };

    YHeatmapAxis.prototype._throwCustomError = function (message) {
      throw new Error(message);
    };

    YHeatmapAxis.prototype._throwLogScaleValuesError = function () {
      throw new errors.InvalidLogScaleValues();
    };

    /**
     * Returns the appropriate D3 scale
     *
     * @param fnName {String} D3 scale
     * @returns {*}
     */
    YHeatmapAxis.prototype._getScaleType = function (fnName) {
      if (fnName === 'square root') fnName = 'sqrt'; // Rename 'square root' to 'sqrt'
      fnName = fnName || 'linear';

      if (typeof d3.scale[fnName] !== 'function') return this._throwCustomError('YHeatmapAxis.getScaleType: ' + fnName + ' is not a function');

      return d3.scale[fnName]();
    };

    /**
     * Return the domain for log scale, i.e. the extent of the log scale.
     * Log scales must begin at 1 since the log(0) = -Infinity
     *
     * @param scale
     * @param yMin
     * @param yMax
     * @returns {*[]}
     */
    YHeatmapAxis.prototype._logDomain = function (min, max) {
      if (min < 0 || max < 0) return this._throwLogScaleValuesError();
      return [1, max];
    };

    /**
     * Creates the d3 y scale function
     *
     * @method getYScale
     * @param height {Number} DOM Element height
     * @returns {D3.Scale.QuantitiveScale|*} D3 yScale function
     */
    YHeatmapAxis.prototype.getYScale = function (height) {
      this.yScale = d3.scale.ordinal()
      .domain(this.yValues)
      .rangeBands([height, 0]);

      return this.yScale;
    };

    YHeatmapAxis.prototype.tickFormat = function () {
      var isPercentage = this._attr.mode === 'percentage';
      if (isPercentage) return d3.format('%');
      if (this.yAxisFormatter) return this.yAxisFormatter;
      return d3.format('n');
    };

    YHeatmapAxis.prototype._validateYScale = function (yScale) {
      if (!yScale || _.isNaN(yScale)) throw new Error('yScale is ' + yScale);
    };

    /**
     * Creates the d3 y axis function
     *
     * @method getYAxis
     * @param height {Number} DOM Element height
     * @returns {D3.Svg.Axis|*} D3 yAxis function
     */
    YHeatmapAxis.prototype.getYAxis = function (height) {
      var yScale = this.getYScale(height);
      this._validateYScale(yScale);

      // Create the d3 yAxis function
      this.yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left');

      return this.yAxis;
    };

    /**
     * Create a tick scale for the y axis that modifies the number of ticks
     * based on the height of the wrapping DOM element
     * Avoid using even numbers in the yTickScale.range
     * Causes the top most tickValue in the chart to be missing
     *
     * @method tickScale
     * @param height {Number} DOM element height
     * @returns {number} Number of y axis ticks
     */
    YHeatmapAxis.prototype.tickScale = function (height) {
      var yTickScale = d3.scale.ordinal()
      .domain(this.yValues)
      .rangeBands([height, 0]);



      return yTickScale;
    };

    /**
     * Renders the y axis to the visualization
     *
     * @method draw
     * @returns {Function} Renders y axis to visualization
     */
    YHeatmapAxis.prototype.draw = function () {
      var self = this;
      var margin = this._attr.margin;
      var mode = this._attr.mode;
      var yValues = this.yValues;

      return function (selection) {
        selection.each(function () {
          var el = this;

          var div = d3.select(el);
          var width = $(el).parent().width();
          var height = $(el).height();
          var adjustedHeight = height - margin.top - margin.bottom;

          var yAxis = self.getYAxis(adjustedHeight);

          // Append svg and y axis
          var svg = div.append('svg')
          .attr('width', width)
          .attr('height', height);

          svg.append('g')
          .attr('class', 'y axis')
          .attr('transform', 'translate(' + (width - 2) + ',' + margin.top + ')')
          .call(yAxis);


          //svg.append("g")
          //  .attr('class', 'y axis tick')
          //  .selectAll('.y-ticks')
          //  .data(yValues)
          //  .enter().append("text")
          //      .text(function(d) { return d; })
          //      .attr("x", 0)
          //      .attr("y", function(d, i) { return i * height/yValues.length; })
          //      .attr("transform", "translate(0, " + height/yValues.length / 2 + ")")

            var container = svg.select('g.y.axis').node();
            if (container) {
              var cWidth = Math.max(width, container.getBBox().width);
              svg.attr('width', cWidth);
              svg.select('g')
              .attr('transform', 'translate(' + (cWidth - 2) + ',' + margin.top + ')');
            }
          //svg.append('g')
          //.attr('class', 'y axis')
          //.attr('transform', 'translate(' + (width - 2) + ',' + margin.top + ')')
          //.call(yAxis);
        });
      };
    };

    return YHeatmapAxis;
  };
});
