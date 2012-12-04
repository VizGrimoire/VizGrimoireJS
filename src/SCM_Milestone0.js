(function () {

var
  V = envision, global_data = {};

function getDefaults () {
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
	var metrics = SCM.getMetrics();
  
    for (metric in metrics) {
    	config = default_config;
    	if (metrics[metric]['envision']) 
    		config = Metric.mergeConfig(default_config, metrics[metric]['envision']); 
		if ($.inArray(metric, data.envision_scm_hide)===-1) {
			viz[metric] = Metric.getEnvisionDefaultsGraph('milestone0-scm-'+metric, config);
		}
    }
    
    config = default_config;
    viz.summary = Metric.getEnvisionDefaultsGraph('milestone0-scm-summary', config);
    viz.summary.config.xaxis = {noTickets:10, showLabels:true};
    viz.summary.config.handles = {show:true};
    viz.summary.config.selection = {mode:'x'};

    viz.connection = {
        name : 'milestone0-scm-connection',
        adapterConstructor : V.components.QuadraticDrawing
    };
    
    return viz;  
}

function SCM_Milestone0 (options) {
  
  global_data = options.data;
	
  var
    data = options.data,
    defaults = getDefaults(),
    vis = new V.Visualization({name : 'milestone0-scm'}),
    selection = new V.Interaction(),
    hit = new V.Interaction();
	var metrics = SCM.getMetrics();

  for (metric in metrics) {
	if ($.inArray(metric, data.envision_scm_hide)===-1) {
		defaults[metric].data = [{label:metric,data:data[metric]}];
	}
  }
  
  defaults.summary.data = [{label:"commits", data:data.summary}];
    
  // SHOW BUBBLES
  defaults.commits.config.mouse.trackFormatter = options.trackFormatter;  
  if (options.xTickFormatter) {
    defaults.summary.config.xaxis.tickFormatter = options.xTickFormatter;
  }
  defaults.commits.config.yaxis.tickFormatter = options.yTickFormatter || function (n) {
    return '$' + n;
  };

  // ENVISION COMPONENTS
  var components = {};
  for (metric in metrics) {
	if ($.inArray(metric, data.envision_scm_hide)===-1) {
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

V.templates.SCM_Milestone0 = SCM_Milestone0;

})();
