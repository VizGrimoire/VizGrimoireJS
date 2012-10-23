/* 
 *  Milestone0.js: Library for visualizing Bitergia Milestone 0 Report
 * 
 */

function displayM0EvoSummary (id, commits, issues, markers) {
	 var
	 container = document.getElementById(id);

	  $.getJSON(commits, function (history) {
	     $.getJSON(issues, function (history1) {
		     $.getJSON(markers, function (markers) {
		         var
		         V = envision,
		         firstMonth = history.id[0],
		         options, vis,
                 commits = [history.id,history.commits],
                 authors = [history.id,history.authors],
		         dates = history.date;
		         
		         var open_fill = [];
		         var close_fill = [];
		         var closers_fill = [];		         
		         
		         for(var i=0;i<history.id.length;i++) {
		        	 pos = history1.id.indexOf(history.id[i]);
		        	 if (pos != -1) {
		        		 open_fill[i] = history1.open[pos];
		        		 close_fill[i] = history1.closed[pos];
		        		 closers_fill[i] = history1.closers[pos];
		        	 }
		        	 else {
		        		 open_fill[i] = null;
		        		 close_fill[i] = null;
		        		 closers_fill[i] = null;
		        	 }
		         }
		         var 
                 	open = [history.id,open_fill],
                 	close = [history.id,close_fill],
                 	closers = [history.id,closers_fill];


		 
		         options = {
		             container : container,
		             data : {
		                 commits : commits,
		                 authors : authors,
		                 open : open,
		                 close : close,
		                 closers : closers,
				         dates : dates,
		                 summary : commits,
		                 markers: markers
		             },
		             trackFormatter : function (o) {             
		                 var
		                 //   index = o.index,
		                 data = o.series.data,
		                 index = data[o.index][0]-firstMonth,
		                 value;
		                 
		                 value =  dates[index] + ": ";
		                 if (commits[1][index] != null)
		                	 value += commits[1][index] + " commits|";
		                 if (authors[1][index]!= null)
		                	 value += authors[1][index] + " authors|";
		                 if (open[1][index]!= null)
		                 	value += open[1][index] + " open|";
		                 if (close[1][index]!= null)
		                 	value += close[1][index] + " close|";
		                 if (closers[1][index]!= null)
		                 	value += closers[1][index] + " closers";		                 
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
		         vis = new envision.templates.Summary_Milestone0(options);
		    });
		 });
	  });
}

function displayM0EvoSCM (id, commits, issues, markers) {

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
            vis = new envision.templates.ITS_Milestone0(options);
        });
    });         
}

function basic_lines(div_id, json_file, column, labels, title) {
    $.getJSON(json_file, function(history) {
        
        var line_data = [];
        container = document.getElementById(div_id);


        for ( var i = 0; i < history[column].length; i++) {
            line_data[i] = [ i, parseInt(history[column][i]) ];
        }

        var graph;

        // Draw Graph
        if (labels) {
            graph = Flotr.draw(container, [ line_data ], {
                title : title,
                xaxis : {
                    minorTickFreq : 4,
                    tickFormatter: function(x) {
                       if (history.date) {
                             x = history.date[parseInt(x)];
                        }
                        return x;
                    }
                },
                yaxis : {
                    minorTickFreq : 1000,
                    tickFormatter: function(y) {
                         return parseInt(y)+"";
                     }
                },
                
                grid : {
                    show : false,
                // minorVerticalLines: true
                },
                mouse : {
                    track : true,
                    trackY : false,
                    trackFormatter : function(o) {
                        return history.date[parseInt(o.x)]+": "+parseInt (o.y);
                    }
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
                    tickFormatter: function(y) {
                        return parseInt(y)+"";
                    }
                },
                grid : {
                    show : false,
                // minorVerticalLines: true
                },
                mouse : {
                    track : true,
                    trackY : false,
                    mouse : {
                        track : true,
                        trackY : false,
                        trackFormatter : function(o) {
                            return history.date[parseInt(o.x)]+": "+parseInt (o.y);
                        }
                    }
                }
            });

        }
    });
};
