(function () {

var
  V = envision, global_data = {};


// Only markers for the first series
var series_drawn = 0;
var series_number = 0;


// Custom data processor
function processData (options) {
    
  return;

  var
    resolution = options.resolution;

  options.preprocessor
    .bound(options.min, options.max)
    .subsampleMinMax(resolution + Math.round(resolution / 3));
}

function getDefaultsMarkersSummary (option, markers, dates) {
    var mark = "";
    for (var i=0; i<markers.date.length; i++) {
        if (markers.date[i] == dates[option.index]) {
            mark = markers.marks[i];
        }
    }
    return mark;
}

// Only show markers with the first graph
function getDefaultsMarkers (option, markers, dates) {
    var mark = "";
    for (var i=0; i<markers.date.length; i++) {
        if (markers.date[i] == dates[option.index]) {
            mark = markers.marks[i];
            if (series_drawn != 0) mark="";
            // Last mark?
            if (i == markers.date.length-1) {
                series_drawn++;
                // Last series? Reset initial status
                if (series_drawn == series_number) {
                    series_drawn = 0;
                }
            }
        }
    }
    return mark;
}

function getDefaultsGraph (name, gconfig) {
	markers = global_data.markers;
	dates = global_data.dates;
		
	var graph = {
	    name : name,
	    config : {
	      colors: gconfig.colors,
	      mouse : {
	        track: true,
	        trackY: false,
	        position: 'ne'
	      },
	      yaxis : {
	    	  autoscale : true,  
	      },
	      legend : {
	          backgroundColor : '#FFFFFF', // A light blue background color
	          backgroundOpacity: 0,
	      },
	    },
	    processData : processData
	};
	
	if (gconfig.gtype==="whiskers")
		graph.config['whiskers'] = {show : true, lineWidth : 2}; 
	else 
		graph.config['lite-lines'] = {          
	        lineWidth : 1,
	        show : true,
	        fill : true,
	        fillOpacity : 0.5,
	      };		
	
	if (gconfig.y_labels) graph.config.yaxis = {showLabels : true};
	
	if (gconfig.markers)
		graph.config.markers = {
	        show: true,
	        position: 'ct',
	        labelFormatter: function (o) {
	            return getDefaultsMarkers (o, markers, dates);
	        }
		};
	
	return graph;
}

function mergeConfig(config1, config2)
{
	var new_config = {};
	for (entry in config1) new_config[entry] = config1[entry];
	for (entry in config2) new_config[entry] = config2[entry];
	return new_config;
}


function getDefaults () {
    var defaults_colors = ['#ffa500', '#ffff00', '#00ff00', '#4DA74D', '#9440ED'];
	var default_config = {
		colors: defaults_colors, 
		y_labels : false,
		g_type : '',
		markers : false
	};
	
	var viz = {};
	var metrics = SCM.getMetrics();
  
    for (metric in metrics) {
    	config = default_config;
    	if (metrics[metric]['envision']) config = mergeConfig(default_config, metrics[metric]['envision']); 
		if ($.inArray(metric, data.envision_scm_hide)===-1) {
			viz[metric] = getDefaultsGraph('milestone0-scm-'+metric, config);
		}
    }
    
    config = default_config;
    viz.summary = getDefaultsGraph('milestone0-scm-summary', config);
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
  
  series_number = defaults.commits.data.length;
  
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
