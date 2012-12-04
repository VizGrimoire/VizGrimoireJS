/* 
 * Metric.js: Library for visualizing Bitergia Metric shared data and logic
 */

var Metric = {};

(function() {
	
Metric.displayTop = displayTop;
Metric.displayBasicHTML = displayBasicHTML;
Metric.displayBasicMetricHTML = displayBasicMetricHTML;
Metric.getEnvisionDefaultsGraph = getEnvisionDefaultsGraph;
Metric.checkBasicConfig = checkBasicConfig;
Metric.mergeConfig = mergeConfig;

function mergeConfig(config1, config2)
{
	var new_config = {};
	for (entry in config1) new_config[entry] = config1[entry];
	for (entry in config2) new_config[entry] = config2[entry];
	return new_config;
}

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

function displayTopMetric(div_id, metric, metric_period, history) {
	var top_metric_id = metric.column;
	var metric_id = metric.action;
	var doer = findMetricDoer(history, metric_id); 
	new_div = "<div class='info-pill'><h1>Top " + top_metric_id + " " + metric_period + " </h1>";
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
// For example: "committers.all":{"commits":[5310, ...],"name":["Brion Vibber",..]}
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
						displayTopMetric(div, metric, top_period, history[key]);
						if (!all) return;
					break;
				} 
			}
		}
	});
}

function getDefaultsMarkers (option, markers, dates) {
    var mark = "";
    for (var i=0; i<markers.date.length; i++) {
        if (markers.date[i] == dates[option.index]) {
            mark = markers.marks[i];
            }
    }
    return mark;
} 

function getEnvisionDefaultsGraph (name, gconfig) {
	var graph = {
	    name : name,
	    config : {
	      colors: gconfig.colors,
	      mouse : {
	        track: true,
	        trackY: false,
	        position: 'ne'
	      },
	      yaxis : {
	    	  autoscale : true,  
	      },
	      legend : {
	          backgroundColor : '#FFFFFF', // A light blue background color
	          backgroundOpacity: 0,
	      },
	    }
	};
	
	if (gconfig.gtype==="whiskers")
		graph.config['whiskers'] = {show : true, lineWidth : 2}; 
	else 
		graph.config['lite-lines'] = {          
	        lineWidth : 1,
	        show : true,
	        fill : true,
	        fillOpacity : 0.5,
	      };		
	
	if (gconfig.y_labels) graph.config.yaxis = {showLabels : true};
	
	if (gconfig.show_markers)
		graph.config.markers = {
	        show: true,
	        position: 'ct',
	        labelFormatter: function (o) {
	            return getDefaultsMarkers (o, gconfig.markers, gconfig.dates);
	        }
		};	
	return graph;
}


function checkBasicConfig(config) {
	if (config == undefined) config = {};
	if (config.show_desc == undefined) config.show_desc = true;
	if (config.show_title == undefined) config.show_title = true;
	if (config.show_labels == undefined) config.show_labels = true;	
	return config;
}

function displayBasicHTML(data_file, div_target, title, basic_metrics, hide, config) {
	config = checkBasicConfig(config);	
	$.getJSON(data_file, function(history) {
		var new_div = '<div class="info-pill">';
		new_div += '<h1>'+title+'</h1></div>';
		$("#"+div_target).append(new_div);
		for (var id in basic_metrics) {
			var metric = basic_metrics[id];
			var title_metric = metric.name;
			if (!config.show_title) title_metric='';
			if ($.inArray(metric.column,M0.getConfig()[hide])>-1) continue;
			new_div = '<div id="flotr2_'+metric.column+'" class="info-pill m0-box-div">';
			new_div += '<h1>'+metric.name+'</h1>';
			new_div += '<div class ="m0-box" id="'+metric.divid+'"></div>' ;
			if (config.show_desc==true)
				new_div += '<p>'+metric.desc+'</p>';
			new_div += '</div>' ;
			$("#"+div_target).append(new_div);
			M0.displayBasicLines(metric.divid, history, 
					metric.column, config.show_labels, title_metric);
		}
	});
}

function displayBasicMetricHTML(metric, data_file, div_target, config) {
	config = checkBasicConfig(config);	
	var title = metric.name;
	if (!config.show_title) title='';
	$.getJSON(data_file, function(history) { 
		var new_div = '<div class="info-pill">';
		$("#"+div_target).append(new_div);
		new_div = '<div id="flotr2_'+metric.column+'" class="info-pill m0-box-div">';
		new_div += '<h1>'+metric.name+'</h1>';
		new_div += '<div style="height:100px" id="'+metric.divid+'"></div>' ;
		if (config.show_desc==true)
			new_div += '<p>'+metric.desc+'</p>';
		new_div += '</div>' ;
		$("#"+div_target).append(new_div);
		M0.displayBasicLines(metric.divid, history, metric.column, config.show_labels, title);
	});
}

})();