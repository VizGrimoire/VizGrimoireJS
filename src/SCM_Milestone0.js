(function () {

var
  V = envision, global_data = {};


// Only markers for the first series
var series_drawn;
var series_number;


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
	if (gconfig.gtype==="whiskers") {
		graph.config['whiskers'] = {
		    show : true,
		    lineWidth : 2
		};
	} 
	else {
		graph.config['lite-lines'] = {          
	        lineWidth : 1,
	        show : true,
	        fill : true,
	        fillOpacity : 0.5,
	      };		
	}
	
	if (gconfig.y_labels) {
		graph.config.yaxis = {			
			showLabels : true
		};
	}
	if (gconfig.markers) {
	
		graph.config.markers = {
	        show: true,
	        position: 'ct',
	        labelFormatter: function (o) {
	            return getDefaultsMarkers (o, markers, dates);
	        }
		};
	}
	
	return graph;
}


function getDefaults () {
    var defaults_colors = ['#ffa500', '#ffff00', '#00ff00', '#4DA74D', '#9440ED'];
	var config = {
		colors: defaults_colors, 
		y_labels : true,
		g_type : '',
		markers : true
	};
    var graph_defaults = {
	    commits : getDefaultsGraph('milestone0-scm-commits', config),
    };
    config.markers = false;
    config.y_labels = false;
    graph_defaults.files = getDefaultsGraph('milestone0-scm-files', config);
    graph_defaults.branches = getDefaultsGraph('milestone0-scm-branches', config);

    config.g_type = 'whiskers';
    graph_defaults.committers = getDefaultsGraph('milestone0-scm-committers', config);
    graph_defaults.authors = getDefaultsGraph('milestone0-scm-authors', config);
    graph_defaults.repositories = getDefaultsGraph('milestone0-scm-repositories', config);

    graph_defaults.summary = getDefaultsGraph('milestone0-scm-summary', config);
    graph_defaults.summary.config.xaxis = {noTickets:10, showLabels:true};
    graph_defaults.summary.config.handles = {show:true};
    graph_defaults.summary.config.selection = {mode:'x'};

    graph_defaults.connection = {
        name : 'milestone0-scm-connection',
        adapterConstructor : V.components.QuadraticDrawing
    };
    
    return graph_defaults;  
}

function SCM_Milestone0 (options) {
  
  global_data = options.data;
	
  var
    data = options.data,
    defaults = getDefaults(),
    vis = new V.Visualization({name : 'milestone0-scm'}),
    selection = new V.Interaction(),
    hit = new V.Interaction(),
    commits, committers, connection, summary, 
    files, branches, repositories, markers ;

  // Data for plotting the graphs
  defaults.branches.data = [{label:"branches",data:data.branches}];
  defaults.commits.data = [
      {label:"commits", data: data.commits}, 
//      {label:"issues opened", data: data.issues_opened},
//      {label:"issues closed", data: data.issues_closed} 
  ];
  series_number = defaults.commits.data.length;
  series_drawn = 0;
  defaults.committers.data = [{label:"committers",data:data.committers}];
  defaults.authors.data = [{label:"authors",data:data.authors}];
  defaults.files.data = [{label:"files",data:data.files}];
  defaults.repositories.data = [{label:"repositories",data:data.repositories}];
  defaults.summary.data = [{label:"commits", data:data.summary}];
  
  defaults.commits.config.mouse.trackFormatter = options.trackFormatter;
  
  if (options.xTickFormatter) {
    defaults.summary.config.xaxis.tickFormatter = options.xTickFormatter;
  }
  defaults.commits.config.yaxis.tickFormatter = options.yTickFormatter || function (n) {
    return '$' + n;
  };

  branches = new V.Component(defaults.branches);
  commits = new V.Component(defaults.commits);
  committers = new V.Component(defaults.committers);
  authors = new V.Component(defaults.authors);
  files = new V.Component(defaults.files);
  repositories = new V.Component(defaults.repositories);
  
  connection = new V.Component(defaults.connection);  
  summary = new V.Component(defaults.summary);
   
  // Render visualization
  var metrics = SCM.getMetrics();
  var viz_m0_names = [];
  for (metric in metrics) viz_m0_names.push(metric);
  var viz_m0_values = [];
  
  for (metric in metrics) {
	  if ($.inArray(metric,data.envision_scm_hide)===-1) {
		  viz_m0_values.push(eval(metric));
	  }
  }
  
  for (var i = 0; i< viz_m0_values.length; i++) {
	  vis.add(viz_m0_values[i]);
  }  
  vis
    .add(connection)
    .add(summary)
    .render(options.container);

  // Define the selection zooming interaction
  for (var i = 0; i< viz_m0_values.length; i++) {
	  selection.follower(viz_m0_values[i]);
  }
  
  selection
    .follower(connection)
    .leader(summary)
    .add(V.actions.selection, options.selectionCallback ? { callback : options.selectionCallback } : null);

  // Define the mouseover hit interaction
  var hit_group = [];
  for (var i = 0; i< viz_m0_values.length; i++) {
	  hit_group.push(viz_m0_values[i]);
  }
  hit    
    .group(hit_group)
    .add(V.actions.hit);

  // Optional initial selection
  if (options.selection) {
    summary.trigger('select', options.selection);
  }

  // Members
  /* this.vis = vis;
  this.selection = selection;
  this.hit = hit;
  this.commits = commits;
  this.committers = committers;
  this.branches = branches;
  this.files = files;
  this.repositories = repositories;
  this.summary = summary; */
}

V.templates.SCM_Milestone0 = SCM_Milestone0;

})();
