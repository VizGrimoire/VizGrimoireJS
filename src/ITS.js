/* 
 * ITS.js: Library for visualizing Bitergia ITS data
 */

var ITS = {};

(function() {

ITS.displayBasic = displayBasic;
ITS.displayBasicHTML = displayBasicHTML;
ITS.displayBasicMetricHTML = displayBasicMetricHTML;
ITS.displayData = displayData;
ITS.displayEvo = displayEvo;
ITS.displayTop = displayTop;
ITS.displayTimeToFix = displayTimeToFix;
ITS.getMetrics = function() {return basic_metrics;};

var basic_metrics = {		
		'opened': {
			'divid':'open_its', 
			'column':"opened",
			'name':"Opened",
			'desc':"Number of opened tickets",
			'envision': {y_labels: true, show_markers:true}},
		'openers': {
			'divid':'openers_its', 
			'column':"openers",
			'name':"Openers",
			'desc':"Unique identities opening tickets",
			'action':"opened",
			'envision': {gtype : 'whiskers'}},
		'closed': {
			'divid':'closed_its', 
			'column':"closed",
			'name':"Closed",
			'desc':"Number of closed tickets"},
		'closers': {
			'divid':'closers_its', 
			'column':"closers",
			'name':"Closers",
			'desc':"Number of identities closing tickets",
			'action':"closed",
			'envision': {gtype : 'whiskers'}},
		'changed': {
			'divid':'changed_its', 
			'column':"changed",
			'name':"Changed",
			'desc':"Number of changes to the state of tickets"},
		'changers': {
			'divid':'changers_its', 
			'column':"changers",
			'name':"Changers",
			'desc':"Number of identities changing the state of tickets",
			'action':"changed",
			'envision': {gtype : 'whiskers'}},
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
function displayBasicHTML(its_file, div_target, config) {
	Metric.displayBasicHTML(its_file, div_target, 'Tickets', basic_metrics, 'its_hide', config);
}

function displayBasicMetricHTML(metric_id, scm_file, div_target, config) {
	Metric.displayBasicMetricHTML(basic_metrics[metric_id], scm_file, div_target, config);
}

function displayTop(div, top_file, all) {
	if (all == undefined) all=true;
	Metric.displayTop(div, top_file, basic_metrics, all);
}

function displayBasic(its_file) {
	$.getJSON(its_file, function(history) {
		basicEvo(history);
	});
}

function basicEvo (history) {
	for (var id in basic_metrics) {
		var metric = basic_metrics[id];
		if ($.inArray(metric.column,M0.getConfig().its_hide)>-1) continue;
		if ($('#'+metric.divid).length)
			M0.displayBasicLines(metric.divid, history, 
					metric.column, true, metric.name);
	}
}

function envisionEvo(id, history, markers, envision_cfg) {
	var V = envision, firstMonth = history.id[0], options, vis;
	var container = document.getElementById(id);
	var main_metric = "opened";
	options = {
		container : container,
		data : {
			summary : [ history.id, history[main_metric]],
			opened : [ history.id, history.opened ],
			closed : [ history.id, history.closed ],
			changed : [ history.id, history.changed ],
			openers : [ history.id, history.openers ],
			closers : [ history.id, history.closers ],
			changers : [ history.id, history.changers ],
			markers : markers,
			dates : history.date,
			envision_its_hide: envision_cfg.its_hide,
			main_metric : main_metric
		},
		trackFormatter : function(o) {
			var
			//   index = o.index,
			data = o.series.data, index = data[o.index][0]
					- firstMonth, value;

			value = history.date[index] + ": ";
			value += history.closed[index] + " closed, ";
			value += history.opened[index] + " opened, ";
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
	vis = new envision.templates.Envision_Milestone0(options,'its');	
}

function displayTimeToFix (div_id, json_file, column, labels, title) {
	$.getJSON(json_file, function(history) {
		var line_data = [];
		container = document.getElementById(div_id);

		for ( var i = 0; i < history.data[column].length; i++) {
			line_data[i] = [ i, parseInt(history.data[column][i]) ];
		}

		var graph;

		graph = Flotr.draw(container, [ line_data ], {
			title : title,
			xaxis : {
				minorTickFreq : 4,
				tickFormatter : function(x) {
					if (history.data.date) {
						x = history.data.date[parseInt(x)];
					}
					return x;
				}
			},
			yaxis : {
				minorTickFreq : 5,
				tickFormatter : function(y) {
					return parseInt(y / (24)) + 'd';
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
					var text = history.data.date[parseInt(o.x)] + ": "
							+ parseInt(o.y) + " h";
					text += " ( " + parseInt(o.y / (24)) + " days)";
					return text;
				}
			}
		});
	});
};




})();