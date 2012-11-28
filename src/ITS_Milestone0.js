(function () {

var
  V = envision;

// Only markers for the first serie
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

function getDefaults (markers, dates) {
    var defaults_colors = ['#ffa500', '#ffff00', '#00ff00', '#4DA74D', '#9440ED'];
  return {      
    opened : {
      name : 'milestone0-its-open',
      config : {
        //colors: ['#00A8F0', '#C0D800', '#CB4B4B', '#4DA74D', '#9440ED'],
        colors: defaults_colors,
        'lite-lines' : {          
          lineWidth : 1,
          show : true,
          fill : true,
          fillOpacity : 0.5,
          /* color: '#ffa500',
          fillColor: '#ffa500' */
        },               
        'markers': {
            show: true,
            position: 'ct',
            labelFormatter: function (o) {
                return getDefaultsMarkers (o, markers, dates);
            }
          },
          mouse : {
              track: true,
              trackY: false,
              trackAll: true,
              sensibility: 1,
              trackDecimals: 4,
              position: 'ne'
          },
        yaxis : {
          show: true,
          autoscale : true,
          autoscaleMargin : 0.05,
          noTicks : 4,
          showLabels : true,
          min : 0
        },        
        legend : {
            backgroundOpacity: 0,
        },
      },
      processData : processData
    },
    closed : {
        name : 'milestone0-its-close',
        config : {
            colors: defaults_colors,
          'lite-lines' : {
            lineWidth : 1,
            show : true,
            fill : true,
            fillOpacity : 0.2
          },
          mouse : {
            track: true,
            trackY: false,
            trackAll: true,
            sensibility: 1,
            trackDecimals: 4,
            position: 'ne'
          },
          yaxis : { 
            autoscale : true,
            autoscaleMargin : 0.05,
            noTicks : 4,
            showLabels : false,
            min : 0
          },
          legend : {
              backgroundOpacity: 0,
          },
        },
        processData : processData
      },
      changed : {
          name : 'milestone0-its-change',
          config : {
            colors: defaults_colors,
            'lite-lines' : {
              lineWidth : 1,
              show : true,
              fill : true,
              fillOpacity : 0.2
            },
            mouse : {
              track: true,
              trackY: false,
              trackAll: true,
              sensibility: 1,
              trackDecimals: 4,
              position: 'ne'
            },
            yaxis : { 
              autoscale : true,
              autoscaleMargin : 0.05,
              noTicks : 4,
              showLabels : false,
              min : 0
            },
            legend : {
                backgroundOpacity: 0,
            },
          },
          processData : processData
        },  
    openers : {
      name : 'milestone0-its-openers',
      config : {
        colors: defaults_colors,
        whiskers : {
          show : true,
          lineWidth : 2
        },
        mouse: {
          track: true,
          trackY: false,
          trackAll: true
        },
        yaxis : {
          autoscale : true,
          autoscaleMargin : 0.5 
        },
        legend : {
            backgroundOpacity: 0,
        }
      },
      processData : processData
    },
    closers : {
        name : 'milestone0-its-closers',
        config : {
          colors: defaults_colors,
          whiskers : {
            show : true,
            lineWidth : 2
          },
          mouse: {
            track: true,
            trackY: false,
            trackAll: true
          },
          yaxis : {
            autoscale : true,
            autoscaleMargin : 0.5 
          },
          legend : {
              backgroundOpacity: 0,
          }
        },
        processData : processData
      },
      changers : {
          name : 'milestone0-its-changers',
          config : {
            colors: defaults_colors,
            whiskers : {
              show : true,
              lineWidth : 2
            },
            mouse: {
              track: true,
              trackY: false,
              trackAll: true
            },
            yaxis : {
              autoscale : true,
              autoscaleMargin : 0.5 
            },
            legend : {
                backgroundOpacity: 0,
            }
          },
          processData : processData
      },    
      summary : {
      name : 'milestone0-its-summary',
      config : {
        colors: defaults_colors,
        'lite-lines' : {
          show : true,
          lineWidth : 1,
          fill : true,
          fillOpacity : 0.2,
          fillBorder : true,
        },
        xTickFormatter: function(o) {
            return "X";
        },
        xaxis : {
          noTicks: 10,
          showLabels : true,
        },
        yaxis : {
          autoscale : true,
          autoscaleMargin : 0.1
        },
        legend : {
        	show: false,
            backgroundOpacity: 0,
        },
        handles : {
          show : true
        },
        selection : {
          mode : 'x'
        },
        grid : {
          verticalLines : false
        },
        'markers': {
            show: true,
            position: 'cm',
            labelFormatter: function (o) {
                return getDefaultsMarkersSummary (o, markers, dates);
            }
          },
      },      
    },
    connection : {
      name : 'milestone0-its-connection',
      adapterConstructor : V.components.QuadraticDrawing
    }
  };
}

function ITS_Milestone0 (options) {

  var
    data = options.data,
    defaults = getDefaults(data.markers, data.dates),
    vis = new V.Visualization({
        name : 'milestone0-its',
        }),
    selection = new V.Interaction(),
    hit = new V.Interaction(), connection,
    opened, closed, changed, openers, closers, changers, markers;

  if (options.defaults) {
    defaults = Flotr.merge(options.defaults, defaults);
  }

  // Data for plotting the graphs
  // defaults.commits.config.data = [
  defaults.opened.data = [
      {label:"opened", data: data.opened}, 
//      {label:"issues opened", data: data.issues_opened},
//      {label:"issues closed", data: data.issues_closed} 
  ];
  series_number = defaults.opened.data.length;
  series_drawn = 0;

  defaults.changed.data = [{label:"changed", data:data.changed}];
  defaults.closed.data = [{label:"closed", data:data.closed}];

  defaults.openers.data = [{label:"openers", data:data.openers}];
  defaults.closers.data = [{label:"closers", data:data.closers}];
  defaults.changers.data = [{label:"changers", data:data.changers}];
  defaults.summary.data = [{label:"opened", data:data.summary}];
  
  defaults.opened.config.mouse.trackFormatter = options.trackFormatter;
  
  if (options.xTickFormatter) {
    defaults.summary.config.xaxis.tickFormatter = options.xTickFormatter;
  }
  defaults.opened.config.yaxis.tickFormatter = options.yTickFormatter || function (n) {
    return '$' + n;
  };

  opened = new V.Component(defaults.opened);
  closed = new V.Component(defaults.closed);
  changed = new V.Component(defaults.changed);
  openers = new V.Component(defaults.openers);
  closers = new V.Component(defaults.closers);
  changers = new V.Component(defaults.changers);

  
  connection = new V.Component(defaults.connection);  
  summary = new V.Component(defaults.summary);  

  // Render visualization
  var viz_m0_names = ["opened", "openers", "closed", "closers", "changed", "changers"];
  var viz_m0_values = [];
  
  for (var i = 0; i< viz_m0_names.length; i++) {
	  if ($.inArray(viz_m0_names[i],data.envision_its_hide)===-1) {
		  viz_m0_values.push(eval(viz_m0_names[i]));
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
  this.vis = vis;
  this.selection = selection;
  this.hit = hit;
  this.opened = opened;
  this.closed = closed;
  this.changed = changed; 
  this.openers = openers;
  this.closers = closers;
  this.changers = changers;
  this.summary = summary;
}

V.templates.ITS_Milestone0 = ITS_Milestone0;

})();