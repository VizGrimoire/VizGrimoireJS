/* 
 *  Milestone1.js: Library for visualizing Bitergia Milestone 1 Report
 * 
 */

function displayM1EvoSCM (id, commits, markers) {

 var
 container = document.getElementById(id);

  $.getJSON(commits, function (history) {
     $.getJSON(markers, function (markers) {
         var
         V = envision,
         firstMonth = history.id[0],
         commits = [history.id,history.commits],
         commits_noLiferay= [history.id,history.commits_noLiferay],
         committers = [history.id,history.committers],
         authors = [history.id,history.authors],
         authors_noLiferay = [history.id,history.authors_noLiferay],
         ratio = [history.id,history.ratio],
         files = [history.id,history.files],
         branches = [history.id,history.branches],
         repositories = [history.id,history.repositories],
         lines_added = [history.id,history.lines_added],
         lines_removed = [history.id,history.lines_removed],         
         dates = history.date,
         options, vis;
         
         history.lines_size = [lines_added[1][0] - lines_removed[1][0]]
         for(var i=1;i<lines_added[1].length;i++) {             
             change = lines_added[1][i] - lines_removed[1][i];
             history.lines_size.push(history.lines_size[i-1] + change);               
         }
         lines_size = [history.id, history.lines_size],
 
         options = {
             container : container,
             data : {
                 commits : commits,
                 commits_noLiferay : commits_noLiferay,
                 committers : committers,
                 authors: authors,
                 authors_noLiferay: authors_noLiferay,
                 files: files,
                 branches:  branches,
                 repositories: repositories,
                 lines_added: lines_added,
                 lines_removed: lines_removed,
                 lines_size: lines_size,
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
                 value += commits_noLiferay[1][index] + " commits no Liferay|";
                 value += committers[1][index] + " committers|";
                 value += "<br>"+authors[1][index] + " authors|";
                 value += authors_noLiferay[1][index] + " authors no Liferay|";
                 value += files[1][index] + " files ";
                 //value += branches[1][index] + " branches|";
                 //value += repositories[1][index] + "repos ";
                 
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
         vis = new envision.templates.SCM_Milestone1(options);
    });
  });
}

function displayM1EvoITS (id, issues, markers) {

    var
    container = document.getElementById(id);
    
    $.getJSON(issues, function (history) {
        $.getJSON(markers, issues, function (markers) {
            var
            V = envision,
            firstMonth = history.id[0],
            options, vis;
            
            history.open_total = [history.open[0] - history.closed[0]]
            for(var i=1;i<history.open.length;i++) {             
                change = history.open[i] + history.reopen[i] - history.closed[i];
                history.open_total.push(history.open_total[i-1] + change);               
            }
 
            options = {
                container : container,
                data : {
                    summary : [history.id,history.open], 
                    open : [history.id,history.open],
                    reopen: [history.id,history.reopen],
                    open_total: [history.id, history.open_total],
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
                    value += "Issues remaining: " + history.open_total[index];
                    value += ", closed: " + history.closed[index];
                    value += ", opened: " + history.open[index];
                    value += ", reopened: " + history.reopen[index];
                    value += ", changed: " + history.changed[index];
                    value += "<br>Closers: " + history.closers[index];
                    value += ", openers: " + history.openers[index];
                    value += ", changers: " + history.changers[index];

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
            vis = new envision.templates.ITS_Milestone1(options);
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