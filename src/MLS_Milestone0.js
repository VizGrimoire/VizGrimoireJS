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
  return {
    sent : {
      name : 'milestone0-mls-sent',
      config : {
        //colors: ['#00A8F0', '#C0D800', '#CB4B4B', '#4DA74D', '#9440ED'],
        colors: ['#ffa500', '#ffff00', '#00ff00', '#4DA74D', '#9440ED'],
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
          noTicks : 1,
          showLabels : true,
          min : 0,
          tickFormatter: function(y) {
              return parseInt(y)+"";
          }
        },
        legend : {
            position : 'nw',
            noColumns : 1,
	    margin: 5,
            backgroundOpacity: 0,
        },
      },
      processData : processData
    },
    senders : {
      name : 'milestone0-mls-senders',
      config : {
        colors: ['#ffa500', '#ffff00', '#00ff00', '#4DA74D', '#9440ED'],
        whiskers : {
          show : true,
          lineWidth : 2,
          color: '#ffa500'
        },
        mouse: {
          track: true,
          trackY: false,
          trackAll: true
        },
        yaxis : {
          autoscale : true,
          autoscaleMargin : 0.5,
          tickFormatter: function(y) {
              return parseInt(y)+"";
          }
        },
        legend : {
            position : 'nw',
            noColumns : 1,
	    margin: 5,
            backgroundOpacity: 0,
        }
      },
      processData : processData
    },
      summary : {
      name : 'milestone0-mls-summary',
      config : {
        'lite-lines' : {
          show : true,
          lineWidth : 1,
          fill : true,
          fillOpacity : 0.2,
          fillBorder : true,
          color: '#ffa500',
          fillColor: '#ff7500'
        },
        xTickFormatter: function(o) {
            return "X";
        },
        xaxis : {
          noTicks: 5,
          showLabels : true,
        },
        yaxis : {
          autoscale : true,
          autoscaleMargin : 0.1,
          tickFormatter: function(y) {
              return parseInt(y)+"";
          }
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
      name : 'milestone0-mls-connection',
      adapterConstructor : V.components.QuadraticDrawing
    }
  };
}

function MLS_Milestone0 (options) {

  var
    data = options.data,
    defaults = getDefaults(data.markers, data.dates),
    vis = new V.Visualization({
        name : 'milestone0-mls',
        }),
    selection = new V.Interaction(),
    hit = new V.Interaction(),
    sent, senders, markers;

  if (options.defaults) {
    defaults = Flotr.merge(options.defaults, defaults);
  }

  // Data for plotting the graphs
  // defaults.commits.config.data = [
  defaults.sent.data = [
      {label:"Messages " + data.list_label, data: data.sent}, 
//      {label:"issues opened", data: data.issues_opened},
//      {label:"issues closed", data: data.issues_closed} 
  ];
  series_number = defaults.sent.data.length;
  series_drawn = 0;

  defaults.senders.data = [{label:"Senders " + data.list_label, data:data.senders}];
  defaults.summary.data = data.summary;

  defaults.sent.config.mouse.trackFormatter = options.trackFormatter;
  
  if (options.xTickFormatter) {
    defaults.summary.config.xaxis.tickFormatter = options.xTickFormatter;
  }
  defaults.sent.config.yaxis.tickFormatter = options.yTickFormatter || function (n) {
    return '$' + n;
  };

  sent = new V.Component(defaults.sent);
  senders = new V.Component(defaults.senders);
  
  connection = new V.Component(defaults.connection);  
  summary = new V.Component(defaults.summary);  

  // Render visualization
  var viz_m0_names = ["sent", "senders"];
  var viz_m0_values = [];
  
  for (var i = 0; i< viz_m0_names.length; i++) {
	  if ($.inArray(viz_m0_names[i],data.envision_mls_hide)===-1) {
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
  this.sent = sent;
  this.senders = senders;
  this.summary = summary;
}

V.templates.MLS_Milestone0 = MLS_Milestone0;

})();