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
    commits : {
      name : 'swscopio-commits-commits',
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
          //trackAll: true,
          // sensibility: 1,
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
            position : 'se',
            noColumns : 3,
            backgroundColor : '#D2E8FF' // A light blue background color
        },
      },
      processData : processData
    },
    issues_closed : {
        name : 'swscopio-issues-closed',
        config : {
          'lite-lines' : {
            lineWidth : 1,
            show : true,
            fill : true,
            fillOpacity : 0.2,
            color: '#ffa500',
            fillColor: '#ffa500'
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
            showLabels : true,
            min : 0
          }
        },
        processData : processData
      },
      issues_opened : {
          name : 'swscopio-issues-opened',
          config : {
            'lite-lines' : {
              lineWidth : 1,
              show : true,
              fill : true,
              fillOpacity : 0.2,
              color: '#ffa500',
              fillColor: '#ffa500'
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
              showLabels : true,
              min : 0
            }
          },
          processData : processData
        },  
    committers : {
      name : 'swscopio-commits-committers',
      config : {
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
          autoscaleMargin : 0.5 
        }
      },
      processData : processData
    },
    summary : {
      name : 'swscopio-commits-summary',
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
          noTicks: 10,
          showLabels : true,
        },
        yaxis : {
          autoscale : true,
          autoscaleMargin : 0.1
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
      name : 'swscopio-commits-connection',
      adapterConstructor : V.components.QuadraticDrawing
    }
  };
}

function CommitsIssues (options) {

  var
    data = options.data,
    defaults = getDefaults(data.markers, data.dates),
    vis = new V.Visualization({
        name : 'swscopio-commits-issues',
        }),
    selection = new V.Interaction(),
    hit = new V.Interaction(),
    commits, committers, connection, summary, 
    issues_closed, issues_opened, markers ;

  if (options.defaults) {
    defaults = Flotr.merge(options.defaults, defaults);
  }

  // defaults.commits.config.data = [
  defaults.commits.data = [
      {label:"commits", data: data.commits}, 
      {label:"issues opened", data: data.issues_opened},
      {label:"issues closed", data: data.issues_closed} 
  ];
  
  series_number = defaults.commits.data.length;
  series_drawn = 0;

  defaults.committers.data = data.committers;
  defaults.summary.data = data.summary;
  defaults.issues_closed.data = data.issues_closed;
  defaults.issues_opened.data = data.issues_opened;

  defaults.commits.config.mouse.trackFormatter = options.trackFormatter;
  
  if (options.xTickFormatter) {
    defaults.summary.config.xaxis.tickFormatter = options.xTickFormatter;
  }
  defaults.commits.config.yaxis.tickFormatter = options.yTickFormatter || function (n) {
    return '$' + n;
  };

  commits = new V.Component(defaults.commits);
  committers = new V.Component(defaults.committers);
  issues = new V.Component(defaults.issues);
  issues_closed = new V.Component(defaults.issues_closed);
  issues_opened = new V.Component(defaults.issues_opened);
  connection = new V.Component(defaults.connection);
  
  summary = new V.Component(defaults.summary);  

  // Render visualization
  vis
    .add(commits)
    //.add(issues_closed)
    //.add(issues_opened)
    .add(committers)
    .add(connection)
    .add(summary)
    .render(options.container);

  // Define the selection zooming interaction
  selection
    .follower(commits)
    //.follower(issues_closed)
    //.follower(issues_opened)
    .follower(committers)
    .follower(connection)
    .leader(summary)
    .add(V.actions.selection, options.selectionCallback ? { callback : options.selectionCallback } : null);

  // Define the mouseover hit interaction
  hit
    // .group([commits, issues_closed, issues_opened, committers])    
    .group([commits, committers])
    .add(V.actions.hit);

  // Optional initial selection
  if (options.selection) {
    summary.trigger('select', options.selection);
  }

  // Members
  this.vis = vis;
  this.selection = selection;
  this.hit = hit;
  this.commits = commits;
  this.committers = committers;
  this.issues_closed = issues_closed;
  this.issues_opened = issues_opened;
  this.summary = summary;
}

V.templates.CommitsIssues = CommitsIssues;

})();
