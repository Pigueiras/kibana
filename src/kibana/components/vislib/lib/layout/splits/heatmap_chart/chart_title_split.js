define(function () {
  return function ChartTitleSplitFactory(d3) {
    /*
     * Adds div DOM elements to either the `.y-axis-chart-title` element or the
     * `.x-axis-chart-title` element based on the data layout.
     * For example, if the data has rows, it returns the same number of
     * `.chart-title` elements as row objects.
     * if not data.rows or data.columns, return no chart titles
     */
    return function (selection) {
      selection.each(function (data) {
        var div = d3.select(this);
        return div;
      });
    };
  };
});
