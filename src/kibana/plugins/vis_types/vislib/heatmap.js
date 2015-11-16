define(function (require) {
  return function HistogramVisType(Private) {
    var VislibVisType = Private(require('plugins/vis_types/vislib/_vislib_vis_type'));
    var Schemas = Private(require('plugins/vis_types/_schemas'));
    var heatmapConverter = Private(require('components/agg_response/heatmap/heatmap'));

    return new VislibVisType({
      name: 'heatmap',
      title: 'Heatmap',
      icon: 'fa-th',
      description: 'Plugin specifically made for CERN and XSLS availabilities',
      params: {
        defaults: {
            addLegend: true,
            addTooltip: true
        },
        editor: require('text!plugins/vis_types/vislib/editors/heatmap.html')
      },
      hierarchicalData: false,
      responseConverter: heatmapConverter,
      schemas: new Schemas([
        {
          group: 'metrics',
          name: 'metric',
          title: 'Count',
          min: 1,
          max: 1,
          aggFilter: ['count'],
          defaults: [
            { schema: 'metric', type: 'count' }
          ]
        },

        {
          group: 'buckets',
          name: 'segment',
          title: 'Aggregation',
          min: 0,
          max: Infinity,
          aggFilter: ['date_histogram', 'terms']
        },
      ])
    });
  };
});
