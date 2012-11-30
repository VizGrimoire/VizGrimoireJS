/* 
 * Metric.js: Library for visualizing Bitergia Metric shared data and logic
 */

var Metric = {};

(function() {
	
Metric.displayTop = displayTop;
Metric.displayBasicHTML = displayBasicHTML;
Metric.displayBasicMetricHTML = displayBasicMetricHTML;

function findMetricDoer(history, metric) {
	for (var field in history) {
		if (field != metric) return field;
	}
}

function hideEmail(email) {
	var clean = email;
	if (email.indexOf("@")>-1) {
		clean = email.split('@')[0];
	}
	return clean;		
}

function displayTopMetric(div_id, metric_id, metric_period, history) {
	var doer = findMetricDoer(history, metric_id);
	new_div = "<div class='info-pill'><h1>Top " + metric_id + " " + metric_period + " </h1>";
	new_div += "<table><tbody>";
	// new_div += "<tr><th>"+doer+"</th><th>"+metric_id+"</th></tr>";
	new_div += "<tr><th></th><th>"+metric_id+"</th></tr>";
	for (var i=0; i<history[metric_id].length; i++) {
		var metric_value = history[metric_id][i];
		var doer_value = history[doer][i];
		new_div += "<tr><td>"+hideEmail(doer_value)+"</td><td>"+metric_value+"</td></tr>";
	}
	new_div += "</tbody></table></div>";
	var div = $("#"+div_id);
	div.append(new_div);
}

// Each metric can have several top: metric.period
// For example: "commits.all":{"commits":[5310, ...],"name":["Brion Vibber",..]}
function displayTop(div, top_file, basic_metrics, all) {
	if (all == undefined) all = true; 
	$.getJSON(top_file, function(history) {
		for (key in history) {
			// ex: commits.all
			var data = key.split(".");
			var top_metric = data[0];
			var top_period = data[1]; 
			for (var id in basic_metrics) {
				var metric = basic_metrics[id];
					if (metric.column == top_metric) {
						displayTopMetric(div, top_metric, top_period, history[key]);
						if (!all) return;
					break;
				} 
			}
		}
	});
}

function displayBasicHTML(data_file, div_target, title, basic_metrics, hide) {
	$.getJSON(data_file, function(history) {
		var new_div = '<div class="info-pill">';
		new_div += '<h1>'+title+'</h1></div>';
		$("#"+div_target).append(new_div);
		for (var id in basic_metrics) {
			var metric = basic_metrics[id];
			if ($.inArray(metric.column,M0.getConfig()[hide])>-1) continue;
			new_div = '<div id="flotr2_'+metric.column+'" class="info-pill m0-box-div">';
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

function displayBasicMetricHTML(metric, data_file, div_target, show_desc) {
	if (show_desc == undefined) show_desc = true;
	$.getJSON(data_file, function(history) {
		var new_div = '<div class="info-pill">';
		$("#"+div_target).append(new_div);
		new_div = '<div id="flotr2_'+metric.column+'" class="info-pill m0-box-div">';
		new_div += '<h1>'+metric.name+'</h1>';
		new_div += '<div style="height:100px" id="'+metric.divid+'"></div>' ;
		if (show_desc==true)
			new_div += '<p>'+metric.desc+'</p>';
		new_div += '</div>' ;
		$("#"+div_target).append(new_div);
		M0.displayBasicLines(metric.divid, history, metric.column, 1, metric.name);
	});
}

})();