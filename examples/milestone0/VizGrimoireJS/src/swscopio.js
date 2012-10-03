
function displayEvoCommitsOld (id, datafile) {

    var
    container = document.getElementById(id);
    
    $.getJSON(datafile, function (timeseries) {

        var
        data, options, i;
	
        // Data Format:
        data = [
            [timeseries.id, timeseries.commits], // First Series
            [timeseries.id, timeseries.committers]  // Second Series
        ];
	
        // TimeSeries Template Options
        options = {
            // Container to render inside of
            container : container,
            // Data for detail (top chart) and summary (bottom chart)
            data : {
		detail : data,
		summary : data
            }
        };
	
        // Create the TimeSeries
        new envision.templates.TimeSeries(options);
    });
}


// Display timeseries for commits and committers using
// the finance envision template
function displayEvoCommits (id, datafile) {

    var
    container = document.getElementById(id);

    $.getJSON(datafile, function (history) {

	var
	V = envision,
	firstMonth = history.id[0],
	commits = [history.id,history.commits],
	committers = [history.id,history.committers],
	ratio = [history.id,history.ratio],
	dates = history.date,
	options, vis;

	options = {
	    container : container,
	    data : {
		commits : commits,
		committers : committers,
		summary : commits
	    },
	    trackFormatter : function (o) {
		
		var
//		index = o.index,
		data = o.series.data,
		index = data[o.index][0]-firstMonth,
		value;
		
		value = dates[index] + ": " + commits[1][index] + " commits, " + committers[1][index] + " committers (commits per committer: " + ratio[1][index] + ")";

		return value;
	    },
	    xTickFormatter : function (index) {
		return Math.floor(index/12) + '';
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
	vis = new envision.templates.Commits(options);
    });
}

//Display timeseries for commits and committers using
//the finance envision template
function displayEvoCommitsIssues (id, commits, issues, markers, offset) {

 var
 container = document.getElementById(id);

 $.getJSON(commits, function (history) {
   $.getJSON(issues, function (history_issues) {
     $.getJSON(markers, issues, function (markers) {
         var
         V = envision,
         firstMonth = history.id[0],
         commits = [history.id,history.commits],
         committers = [history.id,history.committers],
         ratio = [history.id,history.ratio],
         issues_closed = [history_issues.id,history_issues.closed],
         issues_opened = [history_issues.id,history_issues.open],
         dates = history.date,
         options, vis;
 
         options = {
             container : container,
             data : {
                 commits : commits,
                 committers : committers,
                 summary : commits,
                 issues_closed : issues_closed,
                 issues_opened : issues_opened,
                 markers: markers,
                 dates: dates
             },
             trackFormatter : function (o) {             
                 var
                 //   index = o.index,
                 data = o.series.data,
                 index = data[o.index][0]-firstMonth,
                 value;
                 
                 value =  dates[index] + ": " + commits[1][index];
                 value += " commits, " + committers[1][index];
                 value += " committers";
                 // (commits per committer: " + ratio[1][index] + ")";
                 value += ". Issues closed: " + issues_closed[1][index+offset];
                 value += ", opened: " + issues_opened[1][index+offset];
                 
                 return value;
             },
             xTickFormatter : function (index) {
                 return dates[index-firstMonth];
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
         vis = new envision.templates.CommitsIssues(options);
     });
   });         
});

}


// Display timeseries for commits/committers ratio
// using the timeseries envision template
function displayCommitsRatio (id, datafile) {

    var
    container = document.getElementById(id);

    $.getJSON(datafile, function (history) {

        var
        data, options, i;
	
        // Data Format:
        data = [
            [history.id, history.ratio]
        ];
	
        // TimeSeries Template Options
        options = {
            // Container to render inside of
            container : container,
            // Data for detail (top chart) and summary (bottom chart)
            data : {
		detail : data,
		summary : data
            },
	    // Initial selection
	    selection : {
		data : {
		    x : {
			min : history.id[0],
			max : history.id[history.month.length - 1]
		    }
		}
	    }
        };
	
        // Create the TimeSeries
        new envision.templates.TimeSeries(options);
    });
}

// Display timeseries for commits and committers using
// the finance envision template
function displayEvoLines (id, datafile, show) {

    var
    container = document.getElementById(id);
    container.innerHTML = "";

    $.getJSON(datafile, function (history) {

	var
	V = envision,
	firstMonth = history.id[0],
	commits = [history.id,history.commits],
	added = [history.id,history.added],
	removed = [history.id,history.removed],
	ratio = [history.id,history.ratio],
	dates = history.date,
	options, vis;

	if (show == "removed") {
	    price = removed
	} else if (show == "added") {
	    price = added
	} else if (show == "added,removed") {
	    price = [added,removed]
	} else {
	    price = [added,removed]
	}
	options = {
	    container : container,
	    data : {
		price : price,
		volume : ratio,
		summary : commits
	    },
	    trackFormatter : function (o) {
		
		var
		data = o.series.data,
		index = data[o.index][0]-firstMonth,
		value;
		
		
		value = dates[index] + ' (' + commits[1][index] + " commits): ";  		 if (show == "removed") {
		    value += removed[1][index] + " lines removed, "
		} else if (show == "added") {
		    value += added[1][index] + " lines added, "
		} else if (show == "added,removed") {
		    value += added[1][index] + " lines added, " + removed[1][index] + " removed, "
		} else {
		    value += added[1][index] + " lines added, " + removed[1][index] + " removed, "
		}

		value += ratio[1][index] + " lines changed / commit";

//		value = dates[index] + ' (' + commits[1][index] + " commits): " + added[1][index] + " lines added, " + ratio[1][index] + " lines changed / commit";

		return value;
	    },
	    xTickFormatter : function (index) {
		return Math.floor(index/12) + '';
	    },
	    yTickFormatter : function (n) {
		return n + '';
	    },
	    // Initial selection
	    selection : {
		data : {
		    x : {
			min : history.id[0],
			max : history.id[history.month.length - 1]
		    }
		}
	    }
	};

        // Create the TimeSeries
	vis = new envision.templates.Finance(options);
    });
}


// Display timeseries for issues (tickets) using
// the finance envision template
function displayEvoIssues (id, datafile, show) {

    var
    container = document.getElementById(id);
    container.innerHTML = "";

    $.getJSON(datafile, function (history) {

	var
	V = envision,
	firstMonth = history.id[0],
	open = [history.id,history.open],
	openers = [history.id,history.openers],
	closed = [history.id,history.closed],
	changed = [history.id,history.changed],
	changers = [history.id,history.changers],
	dates = history.date,
	options, vis;

	if (show == "all") {
	    price = [open,closed,changed]
	} else if (show == "open") {
	    price = [open,openers]
	} else if (show == "closed") {
	    price = closed
	} else if (show == "changed") {
	    price = [changed,changers]
	} else {
	    price = [open,closed]
	}
	options = {
	    container : container,
	    data : {
		price : price,
		volume : changers,
		summary : changed
	    },
	    trackFormatter : function (o) {
		
		var
		data = o.series.data,
		index = data[o.index][0]-firstMonth,
		value;
		
		
		value = dates[index]; 
		value += ' (' + changers[1][index] + " people modifying ";
		value += changed[1][index] + " modifications to tickets) ";
  		if (show == "all") {
		    value += open[1][index] + " open tickets, ";
		    value += closed[1][index] + " closed tickets, ";
		    value += changed[1][index] + " modifications";
		} else if (show == "open") {
		    value += open[1][index] + " open tickets, ";
		    value += openers[1][index] + " people opening tickets, ";
		} else if (show == "closed") {
		    value += closed[1][index] + " closed tickets";
		} else if (show == "changed") {
		    value += changed[1][index] + " changed tickets, ";
		    value += changers[1][index] + " people changing tickets, ";
		}
                return value;
	    },
	    xTickFormatter : function (index) {
		return Math.floor(index/12) + '';
	    },
	    yTickFormatter : function (n) {
		return n + '';
	    },
	    // Initial selection
	    selection : {
		data : {
		    x : {
			min : history.id[0],
			max : history.id[history.month.length - 1]
		    }
		}
	    }
	};

        // Create the TimeSeries
	vis = new envision.templates.Finance(options);
    });
}
