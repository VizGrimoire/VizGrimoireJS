(function () {

var
  V = envision, global_data = {};

function getDefaultsMetrics(ds, viz, metrics, default_config) {
    for (metric in metrics) {
    	config = default_config;
    	if (metrics[metric]['envision']) 
    		config = Metric.mergeConfig(default_config, metrics[metric]['envision']); 
		if ($.inArray(metric, global_data['envision_hide'])===-1) {
		    // TODO ds[0] hack
			viz[metric] = Metric.getEnvisionDefaultsGraph('milestone0-'+ds[0]+'-'+metric, config);
		}
    }

}

function getDefaults (ds) {
    var defaults_colors = ['#ffa500', '#ffff00', '#00ff00', '#4DA74D', '#9440ED'];
	var default_config = {
		colors: defaults_colors, 
		y_labels : false,
		g_type : '',
		markers : false,
		dates: global_data.dates,
		markers: global_data.markers	
	};
	
	var viz = {};
	var metrics = {};
	if (!ds) {
		metrics = SCM.getMetrics();
		getDefaultsMetrics(['scm'], viz, metrics, default_config);
		metrics = ITS.getMetrics();
		getDefaultsMetrics(['its'], viz, metrics, default_config); 
		metrics = MLS.getMetrics();
		getDefaultsMetrics(['mls'], viz, metrics, default_config);
	}
	else {
		if ($.inArray('scm', ds)>-1) {
			metrics = SCM.getMetrics();
			getDefaultsMetrics(['scm'], viz, metrics, default_config);
		}
		if ($.inArray('its', ds)>-1) {
			metrics = ITS.getMetrics();
			getDefaultsMetrics(['its'], viz, metrics, default_config);
		}
		if ($.inArray('mls', ds)>-1) {
			metrics = MLS.getMetrics();
			getDefaultsMetrics(['mls'], viz, metrics, default_config);
		}
	}
      
    config = default_config;
    // TODO ds[0] hack
    viz.summary = Metric.getEnvisionDefaultsGraph('milestone0-'+ds[0]+'-summary', config);
    viz.summary.config.xaxis = {noTickets:10, showLabels:true};
    viz.summary.config.handles = {show:true};
    viz.summary.config.selection = {mode:'x'};
    viz.summary.config.mouse = {};

    viz.connection = {
		// TODO ds[0] hack
        name : 'milestone0-'+ds[0]+'-connection',
        adapterConstructor : V.components.QuadraticDrawing
    };    
    return viz;  
}

function getMetricDS(metric_id) {
	if (SCM.getMetrics()[metric_id]) {return "scm";}
	if (ITS.getMetrics()[metric_id]) {return "its";}
	if (MLS.getMetrics()[metric_id]) {return "mls";}	
}

function Envision_Milestone0 (options, ds) {
	
  var main_metric = options.data.main_metric;
  global_data = options.data;
	
  var
    data = options.data,
    defaults = getDefaults(ds),
    vis = new V.Visualization({name : 'milestone0-'+ds.join(",")}),
    selection = new V.Interaction(),
    hit = new V.Interaction();
  
  var metrics = {};
  if (!ds) metrics = M0.getAllMetrics();
  else {
	if ($.inArray('scm', ds)>-1) metrics = $.extend(metrics,SCM.getMetrics());
	if ($.inArray('its', ds)>-1) metrics = $.extend(metrics,ITS.getMetrics());
	if ($.inArray('mls', ds)>-1) metrics = $.extend(metrics,MLS.getMetrics());
  }
		
  for (metric in metrics) {
	if ($.inArray(metric, data['envision_hide'])===-1) {
		defaults[metric].data = [{label:metric,data:data[metric]}];
		if (getMetricDS(metric) === 'mls' && data.list_label) 
			defaults[metric].data = 
				[{label:metric+" "+data.list_label,data:data[metric]}];
	}
  }
  
  defaults.summary.data = data.summary;
    
  // SHOW BUBBLES
  defaults[main_metric].config.mouse.trackFormatter = options.trackFormatter;  
  if (options.xTickFormatter) {
    defaults.summary.config.xaxis.tickFormatter = options.xTickFormatter;
  }
  defaults[main_metric].config.yaxis.tickFormatter = options.yTickFormatter || function (n) {
    return '$' + n;
  };

  // ENVISION COMPONENTS
  var components = {};
  for (metric in metrics) {
	if ($.inArray(metric, data['envision_hide'])===-1) {
		components[metric] = new V.Component(defaults[metric]);
	}
  }
  connection = new V.Component(defaults.connection);  
  summary = new V.Component(defaults.summary);
   
  // VISUALIZATION
  for (component in components) {
	  vis.add(components[component]);
  }  
  vis
    .add(connection)
    .add(summary)
    .render(options.container);

  // ZOOMING
  for (component in components) {
	  selection.follower(components[component]);
  }  
  selection
    .follower(connection)
    .leader(summary)
    .add(V.actions.selection, options.selectionCallback ? { callback : options.selectionCallback } : null);

  // HIT
  var hit_group = [];
  for (component in components) {
	  hit_group.push(components[component]);
  }  
  hit    
    .group(hit_group)
    .add(V.actions.hit);

  // INITIAL SELECTION
  if (options.selection) {
    summary.trigger('select', options.selection);
  }
}

V.templates.Envision_Milestone0 = Envision_Milestone0;

})();