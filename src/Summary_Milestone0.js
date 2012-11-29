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
	// MLS
   sent : {
		  name : 'milestone0-summary-sent',
	      config : {
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
	          trackDecimals: 4,
	          position: 'ne'
	        },
	        yaxis : {
	          show: true,
	          autoscale : true,
	          autoscaleMargin : 0.05,
	          noTicks : 3,
	          showLabels : true,
	          min : 0
	        },
	        legend : {
	            position : 'nw',
	            noColumns : 1,
	            backgroundColor : '#FFFFFF', // A light blue background color
	            backgroundOpacity: 0,

	        },
	      },
	      processData : processData
	    },
	    senders : {
	        name : 'milestone0-summary-senders',
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
	              position : 'nw',
	              noColumns : 1,
	              backgroundColor : '#FFFFFF', // A light blue background color
	              backgroundOpacity: 0,

	          },
	        },
	        processData : processData
	    },
   //SCM
   commits : {
	  name : 'milestone0-summary-commits',
      config : {
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
          trackDecimals: 4,
          position: 'ne'
        },
        yaxis : {
          show: true,
          autoscale : true,
          autoscaleMargin : 0.05,
          noTicks : 3,
          showLabels : true,
          min : 0
        },
        legend : {
            position : 'nw',
            noColumns : 1,
            backgroundColor : '#FFFFFF', // A light blue background color
            backgroundOpacity: 0,

        },
      },
      processData : processData
    },
    authors : {
        name : 'milestone0-summary-authors',
        config : {
            colors: ['#ffa500', '#ffff00', '#00ff00', '#4DA74D', '#9440ED'],
            whiskers : {
              show : true,
              lineWidth : 2,
              // color: '#ffa500'
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
            position : 'nw',
            noColumns : 1,
            backgroundColor : '#FFFFFF', // A light blue background color
            backgroundOpacity: 0,

        },
      },
      processData : processData
    },  
	// ITS
    opened : {
      name : 'milestone0-summary-open',
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
            position : 'nw',
            noColumns : 1,
            margin: 5,
            backgroundOpacity: 0,
        },
      },
      processData : processData
    },
    closed : {
        name : 'milestone0-summary-close',
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
              position : 'nw',
              noColumns : 1,
              margin: 5,
              backgroundOpacity: 0,
          }
        },
        processData : processData
      },
    closers : {
        name : 'milestone0-summary-closers',
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
              position : 'nw',
              noColumns : 1,
              backgroundColor : '#FFFFFF', // A light blue background color
              backgroundOpacity: 0,

          },
        },
        processData : processData
    },    
	  summary : {
	  name : 'milestone0-summary-summary',
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
	        position : 'nw',
	        noColumns : 1,
	        backgroundColor : '#FFFFFF', // A light blue background color
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
	//        'markers': {
	//            show: true,
	//            position: 'cm',
	//            labelFormatter: function (o) {
	//                return getDefaultsMarkersSummary (o, markers, dates);
	//            }
	//          },
	  },      
    },
    connection : {
      name : 'milestone0-summary-connection',
      adapterConstructor : V.components.QuadraticDrawing
    }
  };
}

function Summary_Milestone0 (options) {

  var
    data = options.data,
    defaults = getDefaults(data.markers, data.dates),
    vis = new V.Visualization({
        name : 'milestone0-summary',
        }),
    selection = new V.Interaction(),
    hit = new V.Interaction(),
    commits, authors, opened, closed, closers, sent, senders;

  if (options.defaults) {
    defaults = Flotr.merge(options.defaults, defaults);
  }

  defaults.commits.data = [{label:"commits", data: data.commits}];
  
  defaults.sent.data = [{label:"sent", data: data.sent}];
  
  defaults.authors.data = [{label:"authors",data:data.authors}];
  
  defaults.opened.data = [{label:"opened", data: data.opened}];
  series_number = defaults.opened.data.length;
  series_drawn = 0;

  defaults.closed.data = [{label:"closed", data:data.closed}];
  defaults.closers.data = [{label:"closers", data:data.closers}];
  defaults.summary.data = [{label:"opened", data:data.summary}];

  defaults.sent.data = [{label:"sent", data: data.sent}];
  defaults.senders.data = [{label:"senders",data:data.senders}];
  
  defaults.commits.config.mouse.trackFormatter = options.trackFormatter;
  
  if (options.xTickFormatter) {
    defaults.summary.config.xaxis.tickFormatter = options.xTickFormatter;
  }
  defaults.opened.config.yaxis.tickFormatter = options.yTickFormatter || function (n) {
    return '$' + n;
  };

  commits = new V.Component(defaults.commits);   
  authors = new V.Component(defaults.authors);
  opened = new V.Component(defaults.opened);
  closed = new V.Component(defaults.closed);
  closers = new V.Component(defaults.closers);
  sent = new V.Component(defaults.sent);
  senders = new V.Component(defaults.senders);
  
  connection = new V.Component(defaults.connection);  
  summary = new V.Component(defaults.summary);  

  // Render visualization
  vis
    .add(commits)
    .add(authors)
    .add(opened)
    .add(closed)
    .add(closers)
    .add(sent)
    .add(senders)
    .add(connection)
    .add(summary)
    .render(options.container);

  // Define the selection zooming interaction
  selection
    .follower(commits)
    .follower(authors)
    .follower(opened)
    .follower(closed)
    .follower(closers)
    .follower(sent)
    .follower(senders)
    .leader(summary)
    .add(V.actions.selection, options.selectionCallback ? { callback : options.selectionCallback } : null);

  // Define the mouseover hit interaction
  hit    
    .group([commits, authors, opened, closed, closers, sent, senders])    
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
  this.commits = commits; 
  this.authors = authors;
  this.closers = closers;
  this.sent = sent;
  this.senders = senders;  
  this.summary = summary;
}

V.templates.Summary_Milestone0 = Summary_Milestone0;

})();