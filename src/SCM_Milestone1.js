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
      name : 'milestone1-scm-commits',
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
          trackDecimals: 4,
          position: 'se'
        },
        yaxis : {
          show: true,
          autoscale : true,
          autoscaleMargin : 0.05,
          noTicks : 3,
          showLabels : true,
          min : 0
        },
      },
      processData : processData
    },
    files : {
        name : 'milestone1-scm-files',
        config : {
          colors: ['#ffa500', '#ffff00', '#00ff00', '#4DA74D', '#9440ED'],
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
          }
        },
        processData : processData
      },
      lines : {
          name : 'milestone1-scm-lines',
          config : {
            colors: ['#ffa500', '#ffff00', '#00ff00', '#4DA74D', '#9440ED'],
            'lite-lines' : {
              lineWidth : 1,
              show : true,
              // fill : true,
              fillOpacity : 0.2,
              color: '#ffa500',
              fillColor: '#ffa500'
            },
            mouse : {
              track: true,
              trackY: false,
              trackAll: true,
            },
            yaxis : { 
              autoscale : true,
              autoscaleMargin : 0.05,
              min : 0
            }
          },
          processData : processData
      },
      committers : {
        name : 'milestone1-scm-committers',
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
          autoscaleMargin : 0.5 
        }
      },
      processData : processData
    },
    authors : {
        name : 'milestone1-scm-authors',
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
        }
      },
      processData : processData
    },
    size : {
        name : 'milestone1-scm-size',
        colors: ['#ffa500', '#ffff00', '#00ff00', '#4DA74D', '#9440ED'],
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
            autoscaleMargin : 0.5 
          },
        },
        processData : processData
      },    
    summary : {
      name : 'milestone1-scm-summary',
      config : {
        colors: ['#ffa500', '#ffff00', '#00ff00', '#4DA74D', '#9440ED'],
        'lite-lines' : {
          show : true,
          lineWidth : 1,
          fill : true,
          fillOpacity : 0.2,
          fillBorder : true,
          color: '#ffa500',
          fillColor: '#ff7500'
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
      name : 'milestone1-scm-connection',
      adapterConstructor : V.components.QuadraticDrawing
    }
  };
}

function SCM_Milestone1 (options) {

  var
    data = options.data,
    defaults = getDefaults(data.markers, data.dates),
    vis = new V.Visualization({
        name : 'milestone1-scm',
        }),
    selection = new V.Interaction(),
    hit = new V.Interaction(),
    commits, committers, connection, summary, 
    files, lines, size, markers ;

  if (options.defaults) {
    defaults = Flotr.merge(options.defaults, defaults);
  }

  // Data for plotting the graphs
  defaults.lines.data = [
    {label:"lines added",data:data.lines_added},
    {label:"lines removed",data:data.lines_removed}];
  defaults.commits.data = [
      {label:"commits", data: data.commits}];
      // {label:"commits noLR", data: data.commits_noLiferay}];
  series_number = defaults.commits.data.length;
  series_drawn = 0;
  defaults.committers.data = [{label:"committers",data:data.committers}];
  defaults.authors.data = [{label:"authors",data:data.authors}];
 //                          {label:"authors noLR",data:data.authors_noLiferay}];
  defaults.files.data = [{label:"files",data:data.files}];
  defaults.size.data = [{label:"size",data:data.lines_size}];
  defaults.summary.data = data.summary;
  
  defaults.commits.config.mouse.trackFormatter = options.trackFormatter;
  
  if (options.xTickFormatter) {
    defaults.summary.config.xaxis.tickFormatter = options.xTickFormatter;
  }
  defaults.commits.config.yaxis.tickFormatter = options.yTickFormatter || function (n) {
    return '$' + n;
  };

  lines = new V.Component(defaults.lines);
  commits = new V.Component(defaults.commits);
  committers = new V.Component(defaults.committers);
  authors = new V.Component(defaults.authors);
  files = new V.Component(defaults.files);
  size = new V.Component(defaults.size);
  
  connection = new V.Component(defaults.connection);  
  summary = new V.Component(defaults.summary);  

  // Render visualization
  vis
    .add(commits)
    //.add(committers)
    .add(authors)
    .add(lines)
    .add(files)
    //.add(size)
    .add(connection)
    .add(summary)
    .render(options.container);

  // Define the selection zooming interaction
  selection
    .follower(commits)
    //.follower(committers)
    .follower(authors)
    .follower(lines)
    .follower(files)
    //.follower(size)
    .follower(connection)
    .leader(summary)
    .add(V.actions.selection, options.selectionCallback ? { callback : options.selectionCallback } : null);

  // Define the mouseover hit interaction
  hit    
    .group([commits, 
            // committers, 
            authors, lines, files])
            // authors, lines, files, size])
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
  this.authors = authors;
  this.lines = lines;
  this.files = files;
  this.size = size;
  this.summary = summary;
}

V.templates.SCM_Milestone1 = SCM_Milestone1;

})();
