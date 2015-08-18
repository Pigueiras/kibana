define(function () {
  return function ChartSplitFactory(d3) {
    /*
     * Adds div DOM elements to the `.chart-wrapper` element based on the data layout.
     * For example, if the data has rows, it returns the same number of
     * `.chart` elements as row objects.
     */

    return function split(selection) {
      selection.each(function (data) {
        var div = d3.select(this)
        .attr('class', function () {
            return 'chart-wrapper';
        });
        var divClass;

        var charts = div.selectAll('charts')
        .append('div')
        .data(function (d) {
          divClass = 'chart';
          return [d];
        })
        .enter()
          .append('div')
          .attr('class', function () {
            return divClass;
          });

      });
    };
  };
});
