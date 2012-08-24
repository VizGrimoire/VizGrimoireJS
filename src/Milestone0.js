/* 
 *  Milestone0.js: Library for visualizing Bitergia Milestone 0 Report
 * 
 */

function displayM0EvoSCM (id, commits, markers) {

 var
 container = document.getElementById(id);

  $.getJSON(commits, function (history) {
     $.getJSON(markers, function (markers) {
         var
         V = envision,
         firstMonth = history.id[0],
         commits = [history.id,history.commits],
         committers = [history.id,history.committers],
         ratio = [history.id,history.ratio],
         files = [history.id,history.files],
         branches = [history.id,history.branches],
         repositories = [history.id,history.repositories],
         dates = history.date,
         options, vis;
 
         options = {
             container : container,
             data : {
                 commits : commits,
                 committers : committers,
                 files: files,
                 branches:  branches,
                 repositories: repositories,
                 summary : commits,
                 markers: markers,
                 dates: dates
             },
             trackFormatter : function (o) {             
                 var
                 //   index = o.index,
                 data = o.series.data,
                 index = data[o.index][0]-firstMonth,
                 value;
                 
                 value =  dates[index] + ": ";
                 value += commits[1][index] + " commits|";
                 value += committers[1][index] + " committers|";
                 value += files[1][index] + " files|";
                 value += branches[1][index] + " branches|";
                 value += repositories[1][index] + "repos ";
                 
                 return value;
             },
             xTickFormatter : function (index) {
                 return dates[index-firstMonth];
             },
             yTickFormatter : function (n) {
                 return n + '';
             },
             // Initial selection
             selection : {
               data : {
                 x : {
                   min : history.id[0],
                   max : history.id[history.id.length - 1]
                 }
               }
             }
         };
         // Create the TimeSeries
         vis = new envision.templates.SCM_Milestone0(options);
    });
  });
}

function displayM0EvoITS (id, issues, markers) {

    var
    container = document.getElementById(id);
    
    $.getJSON(issues, function (history) {
        $.getJSON(markers, issues, function (markers) {
            var
            V = envision,
            firstMonth = history.id[0],
            options, vis;
    
            options = {
                container : container,
                data : {
                    summary : [history.id,history.open], 
                    open : [history.id,history.open],
                    close : [history.id,history.closed],
                    change : [history.id,history.changed],
                    openers: [history.id,history.openers],
                    closers : [history.id,history.closers],
                    changers : [history.id,history.changers],
                    markers: markers,
                    dates: history.date
                },
                trackFormatter : function (o) {     
                    var
                    //   index = o.index,
                    data = o.series.data,
                    index = data[o.index][0]-firstMonth,
                    value;
                    
                    value = history.date[index] + ": ";
                    value += "Issues closed: " + history.closed[index];
                    value += ", opened: " + history.open[index];
                    value += ", chnaged: " + history.changed[index];
                    value += "<br>Closers: " + history.closers[index];
                    value += ", openers: " + history.openers[index];
                    value += ", chnagers: " + history.changers[index];

                    return value;
                },
                xTickFormatter : function (index) {
                    return history.date[index-firstMonth];
                    // return Math.floor(index/12) + '';
                },
                yTickFormatter : function (n) {
                    return n + '';
                },
                // Initial selection
                selection : {
                  data : {
                    x : {
                      min : history.id[0],
                      max : history.id[history.id.length - 1]
                    }
                  }
                }
            };
            // Create the TimeSeries
            vis = new envision.templates.ITS_Milestone0(options);
        });
    });         
}

function basic_lines(div_id, json_file, column, labels, title) {
    $.getJSON(json_file, function(history) {
        var line_data = [];

        for ( var i = 0; i < history[column].length; i++) {
            line_data[i] = [ i, parseInt(history[column][i]) ];
        }

        var graph;

        var container = document.getElementById(div_id);

        // Draw Graph
        if (labels) {
            graph = Flotr.draw(container, [ line_data ], {
                title : title,
                xaxis : {
                    minorTickFreq : 4,
                //showLabels : false,
                    tickFormatter: function(x) {
                        return history.date[x];
                    }
                },
                yaxis : {
                    minorTickFreq : 1000,
                },
                grid : {
                    show : false,
                // minorVerticalLines: true
                },
                mouse : {
                    track : true,
                    trackY : false
                }
            });
        } else {
            graph = Flotr.draw(container, [ line_data ], {
                xaxis : {
                    //minorTickFreq: 4,
                    showLabels : false,
                },
                yaxis : {
                    showLabels : false,
                },
                grid : {
                    show : false,
                // minorVerticalLines: true
                },
                mouse : {
                    track : true,
                    trackY : false
                }
            });

        }
    });
};