/* 
 * ITS.js: Library for visualizing Bitergia ITS data
 */

var ITS = {};

(function() {

ITS.displayBasic = displayBasic;
ITS.displayBasicHTML = displayBasicHTML;
ITS.displayData = displayData;
ITS.displayEvo = displayEvo;

var basic_metrics = {
		'open': {
			'divid':'open_its', 
			'column':"open",
			'name':"open",
			'desc':"Evolution of the number of open tickets"},
		'openers': {
			'divid':'openers_its', 
			'column':"openers",
			'name':"openers",
			'desc':"People opening ticket reports"},
		'closed': {
			'divid':'closed_its', 
			'column':"closed",
			'name':"closed",
			'desc':"Tickets being closed"},
		'closers': {
			'divid':'closers_its', 
			'column':"closers",
			'name':"closers",
			'desc':"People closing ticket reports"},
		'changed': {
			'divid':'changed_its', 
			'column':"changed",
			'name':"changed",
			'desc':"Tickets being changed (aggregated)"},
		'changers': {
			'divid':'changers_its', 
			'column':"changers",
			'name':"changers",
			'desc':"People changing ticket reports"}		
};

function displayEvo (id, its_file, markers, config) {
	$.getJSON(its_file, function(history) {
		envisionEvo(id, history, markers, config);
	});
}

function displayData(filename) {
	$.getJSON(filename, function(data) {
		$("#itsFirst").text(data.first_date);
		$("#itsLast").text(data.last_date);
		$("#itsTickets").text(data.tickets);
		$("#itsOpeners").text(data.openers);
	});
}

// Create HTML code to show the metrics
function displayBasicHTML(its_file, div_target) {
	$.getJSON(its_file, function(history) {
		var new_div = '<div class="info-pill">';
		new_div += '<h1>Tickets analysis</h1></div>';
		$("#"+div_target).append(new_div);
		for (var id in basic_metrics) {
			var metric = basic_metrics[id];
			new_div = '<div id="flotr2_open" class="info-pill m0-box-div">';
			new_div += '<h1>'+metric.name+'</h1>';
			new_div += '<div class ="m0-box" id="'+metric.divid+'"></div>' ;
			new_div += '<p>'+metric.desc+'</p>';
			new_div += '</div>' ;
			$("#"+div_target).append(new_div);
			M0.displayBasicLines(metric.divid, history, 
					metric.column, 1, metric.name);
		}
	});
}

function displayBasic(its_file) {
	$.getJSON(its_file, function(history) {
		basicEvo(history);
	});
}

function basicEvo (history) {
	for (var id in basic_metrics) {
		var metric = basic_metrics[id];
		if ($('#'+metric.divid).length)
			M0.displayBasicLines(metric.divid, history, 
					metric.column, true, metric.name);
	}
}

function envisionEvo(id, history, markers, envision_cfg) {
	var V = envision, firstMonth = history.id[0], options, vis;
	var container = document.getElementById(id);
	
	options = {
		container : container,
		data : {
			summary : [ history.id, history.open ],
			open : [ history.id, history.open ],
			close : [ history.id, history.closed ],
			change : [ history.id, history.changed ],
			openers : [ history.id, history.openers ],
			closers : [ history.id, history.closers ],
			changers : [ history.id, history.changers ],
			markers : markers,
			dates : history.date,
			envision_its_hide: envision_cfg.its_hide
		},
		trackFormatter : function(o) {
			var
			//   index = o.index,
			data = o.series.data, index = data[o.index][0]
					- firstMonth, value;

			value = history.date[index] + ": ";
			value += history.closed[index] + " closed, ";
			value += history.open[index] + " opened, ";
			value += history.changed[index] + " changed";
			value += "<br/>" + history.closers[index]
					+ " closers, ";
			value += history.openers[index] + " openers, ";
			value += history.changers[index] + " changers";

			return value;
		},
		xTickFormatter : function(index) {
			var label = history.date[index - firstMonth];
			if (label === "0") label = "";
			return label;
			// return Math.floor(index/12) + '';
		},
		yTickFormatter : function(n) {
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
}
})();